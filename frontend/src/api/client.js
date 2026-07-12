import axios from 'axios'

// Decide the API address at RUNTIME (more reliable than a build-time flag):
// the Vite dev server runs on port 5173 and proxies /api → localhost:8000.
// Everywhere else (production), the backend serves this app, so the API is
// same-origin at the root.
const isDevServer = typeof window !== 'undefined' && window.location.port === '5173'
const api = axios.create({ baseURL: isDevServer ? '/api' : '' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
