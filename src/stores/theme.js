import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTheme } from 'vuetify'

export const useThemeStore = defineStore('theme', () => {
  const vuetifyTheme = useTheme()
  const isDark = ref(localStorage.getItem('theme_dark') !== 'false')

  function init() {
    vuetifyTheme.global.name.value = isDark.value ? 'dark' : 'light'
  }

  function toggle() {
    isDark.value = !isDark.value
    vuetifyTheme.global.name.value = isDark.value ? 'dark' : 'light'
    localStorage.setItem('theme_dark', isDark.value)
  }

  return { isDark, init, toggle }
})
