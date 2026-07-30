<template>
  <div>
    <div class="d-flex align-center mb-3">
      <h2 class="text-h4">实时日志</h2>
      <v-spacer />
      <v-chip :color="connected ? 'success' : 'error'" size="small" variant="tonal">
        <template #prepend><v-icon size="14">{{ connected ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon></template>
        {{ connected ? '已连接' : '断开' }}
      </v-chip>
      <v-btn variant="text" size="small" icon="mdi-refresh" @click="reconnect" :loading="reconnecting" class="ml-2" />
      <v-btn variant="text" size="small" icon="mdi-delete-outline" @click="lines = []" class="ml-1" title="清屏" />
      <v-switch v-model="autoScroll" label="自动滚动" hide-details density="compact" class="ml-2" style="max-width:120px" />
    </div>
    <v-card class="bg-grey-darken-4">
      <div ref="logContainer" class="pa-3" style="height:calc(100vh - 180px);overflow-y:auto;font-family:monospace;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-all">
        <div v-if="lines.length === 0" class="text-center text-disabled mt-12">等待日志...</div>
        <div v-for="(line, i) in lines" :key="i" :style="{color: lineColor(line)}">{{ line }}</div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

const lines = ref([])
const connected = ref(false)
const reconnecting = ref(false)
const autoScroll = ref(true)
const logContainer = ref(null)
let ws = null

function lineColor(line) {
  if (line.includes('ERROR') || line.includes('error') || line.includes('Traceback')) return '#EF5350'
  if (line.includes('WARNING') || line.includes('warning')) return '#FFA726'
  if (line.includes('INFO') || line.includes('info')) return '#66BB6A'
  if (line.includes('DEBUG')) return '#90A4AE'
  return '#B0BEC5'
}

function connect() {
  if (ws) ws.close()
  const meta = document.querySelector('meta[name="api-prefix"]')
  const prefix = meta ? meta.content : ''
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${proto}//${location.host}${prefix}/ws/log`
  ws = new WebSocket(url)
  ws.onopen = () => { connected.value = true }
  ws.onmessage = (e) => {
    lines.value.push(e.data)
    if (lines.value.length > 1000) lines.value.shift()
    if (autoScroll.value) nextTick(() => { if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight })
  }
  ws.onclose = () => { connected.value = false; setTimeout(connect, 3000) }
  ws.onerror = () => ws.close()
}

function reconnect() {
  reconnecting.value = true
  lines.value = []
  connect()
  setTimeout(() => reconnecting.value = false, 1000)
}

onMounted(connect)
onUnmounted(() => { if (ws) ws.close() })
</script>
