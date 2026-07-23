import { useEffect, useRef } from 'react'

// Raw WebGL noise-dissolve. The artwork burns in/out of existence:
// an fbm noise field eats the image, with a glowing brand-green edge
// and slight noise displacement while materializing.

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uProgress; // 0 = gone, 1 = fully formed
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.1 + 13.7;
    a *= 0.5;
  }
  return v;
}

void main() {
  float t = uProgress;
  float n = fbm(vUv * 5.0 + uTime * 0.06);

  // widen threshold range so edges fully clear at t=0 and t=1
  float edge = 0.09;
  float th = mix(-edge * 2.0, 1.0 + edge * 2.0, t);

  // displace uv a touch while the image is still forming
  vec2 wobble = (vec2(noise(vUv * 9.0 + uTime * 0.2), noise(vUv * 9.0 - uTime * 0.2)) - 0.5)
                * 0.05 * (1.0 - t);
  vec4 tex = texture2D(uTex, clamp(vUv + wobble, 0.0, 1.0));

  float visible = smoothstep(th, th - 0.02, n);      // formed pixels
  float rim = smoothstep(th, th - edge, n) - visible; // burning edge band

  vec3 rimColor = mix(vec3(0.416, 0.682, 0.451), vec3(0.957, 0.941, 0.733), rim * 2.0);
  vec3 color = tex.rgb * visible + rimColor * rim * 1.25;
  float alpha = clamp(visible + rim, 0.0, 1.0) * tex.a;

  gl_FragColor = vec4(color, alpha);
}`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

export default function ArtworkCanvas({ src, size = 512, className = '' }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    progress: 0,
    target: 0,
    pendingSrc: null,
    currentSrc: null,
    hasTexture: false,
  })
  const glRef = useRef(null)

  // one-time GL setup
  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
    if (!gl) return

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    glRef.current = {
      gl,
      uProgress: gl.getUniformLocation(prog, 'uProgress'),
      uTime: gl.getUniformLocation(prog, 'uTime'),
      tex,
    }

    let raf
    const start = performance.now()
    const loop = () => {
      const st = stateRef.current
      const g = glRef.current
      raf = requestAnimationFrame(loop)
      if (!g) return

      // ease progress toward target; when fully dissolved out, swap texture
      const speed = 0.028
      if (st.progress < st.target) st.progress = Math.min(st.progress + speed, st.target)
      else if (st.progress > st.target) st.progress = Math.max(st.progress - speed, st.target)

      if (st.progress === 0 && st.pendingSrc && st.pendingSrc !== st.currentSrc) {
        const url = st.pendingSrc
        st.pendingSrc = null
        const img = new Image()
        img.onload = () => {
          const gg = glRef.current
          if (!gg) return
          gg.gl.bindTexture(gg.gl.TEXTURE_2D, gg.tex)
          gg.gl.texImage2D(gg.gl.TEXTURE_2D, 0, gg.gl.RGBA, gg.gl.RGBA, gg.gl.UNSIGNED_BYTE, img)
          st.currentSrc = url
          st.hasTexture = true
          st.target = 1 // burn back in
        }
        img.src = url
      }

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      if (st.hasTexture) {
        gl.uniform1f(g.uProgress, st.progress)
        gl.uniform1f(g.uTime, (performance.now() - start) / 1000)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      glRef.current = null
    }
  }, [])

  // src changes → dissolve out, then the loop swaps + dissolves in
  useEffect(() => {
    const st = stateRef.current
    if (!st.currentSrc) {
      // first image: load straight in
      st.pendingSrc = src
      st.target = 0
      st.progress = 0
    } else if (src !== st.currentSrc) {
      st.pendingSrc = src
      st.target = 0
    }
  }, [src])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`h-full w-full ${className}`}
    />
  )
}
