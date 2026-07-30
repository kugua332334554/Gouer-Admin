import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const admin = ref(localStorage.getItem('admin_name') || '')
  const require2FA = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  async function login(username, password, totpCode = '', captchaId = '', captchaAnswer = '') {
    const res = await api.post('/login', {
      username, password,
      totp_code: totpCode,
      captcha_id: captchaId,
      captcha_answer: captchaAnswer,
    })
    token.value = res.access_token
    admin.value = res.admin
    localStorage.setItem('admin_token', res.access_token)
    localStorage.setItem('admin_name', res.admin)
    return { must_change_password: res.must_change_password || false }
  }

  function logout() {
    token.value = ''
    admin.value = ''
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_name')
    require2FA.value = false
  }

  return { token, admin, require2FA, isLoggedIn, login, logout }
})
