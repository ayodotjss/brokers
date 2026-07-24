// Preloads every heavy asset up-front and reports byte-accurate progress.
// Images/video are fetched as blobs so the browser cache is warm before reveal.

const ASSETS = [
  { url: '/logo.png', weight: 1 },
  { url: '/bgvideo.mp4', weight: 8 },
  // first brokers shown in the galleries — preload so About paints instantly
  { url: '/octos1.png', weight: 2 },
  { url: '/octos7.png', weight: 2 },
  { url: '/octos5.png', weight: 2 },
  { url: '/octos3.png', weight: 2 },
  { url: '/octos9.png', weight: 2 },
  { url: '/octos2.png', weight: 2 },
]

async function fetchWithProgress(url, onPct) {
  const res = await fetch(url)
  const total = Number(res.headers.get('content-length')) || 0
  if (!res.body || !total) {
    await res.blob()
    onPct(1)
    return
  }
  const reader = res.body.getReader()
  let received = 0
  const chunks = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    onPct(Math.min(received / total, 1))
  }
  onPct(1)
  return new Blob(chunks)
}

export async function preloadAssets(onProgress) {
  const totalWeight = ASSETS.reduce((sum, a) => sum + a.weight, 0)
  const pcts = new Array(ASSETS.length).fill(0)

  const report = () => {
    const done = ASSETS.reduce((sum, a, i) => sum + a.weight * pcts[i], 0)
    onProgress(Math.round((done / totalWeight) * 100))
  }

  // also wait for the display fonts so the reveal doesn't FOUT
  const fonts = document.fonts
    ? Promise.allSettled([
        document.fonts.load('400 80px "Bebas Neue"'),
        document.fonts.load('600 16px "Manrope"'),
      ])
    : Promise.resolve()

  await Promise.allSettled(
    ASSETS.map((a, i) =>
      fetchWithProgress(a.url, (p) => {
        pcts[i] = p
        report()
      }),
    ),
  )
  await fonts
  onProgress(100)
}
