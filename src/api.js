import axios from 'axios'

const api = axios.create({ timeout: 15000 })

api.interceptors.request.use((config) => {
  // 从 meta 标签读取 API 前缀（不受 CSP 限制）
  if (!config.baseURL) {
    const meta = document.querySelector('meta[name="api-prefix"]')
    config.baseURL = meta ? meta.content : ''
  }
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_name')
      window.location.hash = '#/login'
    }
    const msg = err.response?.data?.detail || err.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
)

export default api
