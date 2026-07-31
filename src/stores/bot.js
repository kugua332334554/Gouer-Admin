// Bot selection store — main + clone bots
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useBotStore = defineStore('bot', () => {
  const bots = ref([])
  const selectedBotId = ref(parseInt(localStorage.getItem('selected_bot_id') || '0'))
  const loading = ref(false)

  // Current selected bot object
  const selectedBot = computed(() => bots.value.find(b => b.id === selectedBotId.value) || null)
  // Is main bot selected
  const isMainBot = computed(() => selectedBotId.value === 0)

  // Fetch bot list from API
  async function loadBots() {
    loading.value = true
    try {
      bots.value = await api.get('/bots/list')
    } catch (e) {
      console.error('Load bots failed:', e)
      bots.value = []
    } finally {
      loading.value = false
    }
  }

  // Select a bot and persist
  function selectBot(bot) {
    selectedBotId.value = bot.id
    localStorage.setItem('selected_bot_id', String(bot.id))
    localStorage.setItem('selected_bot_db', bot.db_name || '')
  }

  return { bots, selectedBotId, selectedBot, isMainBot, loading, loadBots, selectBot }
})
