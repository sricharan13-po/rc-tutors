import axios from 'axios'

// In dev, calls go through the Vite proxy at /api → localhost:8000.
// In production the backend serves the frontend, so the API is same-origin at the root.
const api = axios.create({ baseURL: import.meta.env.PROD ? '' : '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
