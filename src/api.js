import axios from 'axios'

const api = axios.create({ timeout: 15000 })

// Endpoints that should NOT receive the db parameter
const EXCLUDE_DB = [
  '/login', '/captcha', '/change-password', '/change-username',
  '/2fa-setup', '/2fa-reset',
  '/bot-tokens',         // bot token CRUD stays on main DB
  '/bots/',              // bot process control + status/log
  '/db/',                // DB manager has its own db param
  '/code/',              // code editor
  '/system/',            // system config
  '/_health',            // health check
]

function shouldAttachDb(url) {
  return !EXCLUDE_DB.some(prefix => url.startsWith(prefix))
}

api.interceptors.request.use((config) => {
  // Read API prefix from meta tag (bypass CSP)
  if (!config.baseURL) {
    const meta = document.querySelector('meta[name="api-prefix"]')
    config.baseURL = meta ? meta.content : ''
  }
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Multi-bot: attach db param when a non-main bot is selected
  const selectedBotId = localStorage.getItem('selected_bot_id')
  if (selectedBotId && selectedBotId !== '0' && selectedBotId !== 'null') {
    const dbName = localStorage.getItem('selected_bot_db') || ''
    if (dbName && shouldAttachDb(config.url || '')) {
      config.params = config.params || {}
      config.params.db = dbName
    }
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
