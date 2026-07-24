// API base URL.
//  - dev: '' → requests hit '/api/...' and Vite proxies to localhost:5000
//  - prod: the deployed Render backend (overridable with VITE_API_BASE_URL)
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://brokers-ci5h.onrender.com' : '')
