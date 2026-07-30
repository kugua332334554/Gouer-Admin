<template>
  <div :class="{ 'fullscreen-editor': isFullscreen }">
    <div class="d-flex align-center mb-2">
      <h2 class="text-h4">插件管理</h2>
      <v-spacer />
      <v-btn v-if="currentFile && activeTab !== 'bots'" size="small" color="success" prepend-icon="mdi-content-save" @click="saveFile" :loading="saving" class="mr-1">保存</v-btn>
      <v-btn v-if="activeTab !== 'bots'" size="small" variant="text" :icon="isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" @click="isFullscreen = !isFullscreen" title="全屏" />
    </div>

    <v-card>
      <v-tabs v-model="activeTab" density="compact">
        <v-tab value="plugins"><v-icon size="18" class="mr-1">mdi-puzzle-outline</v-icon>插件 ({{ pluginFiles.length }})</v-tab>
        <v-tab value="bot"><v-icon size="18" class="mr-1">mdi-robot-outline</v-icon>Bot ({{ botFiles.length }})</v-tab>
        <v-tab value="bots"><v-icon size="18" class="mr-1">mdi-server</v-icon>进程管理</v-tab>
      </v-tabs>

      <div v-show="activeTab === 'plugins' || activeTab === 'bot'" :style="{display:'flex',height:isFullscreen?'100vh':'calc(100vh - 210px)'}">
        <!-- File Tree -->
        <div style="width:240px;border-right:1px solid rgba(var(--v-border-color),.3);overflow-y:auto;flex-shrink:0;position:relative">
          <v-text-field v-model="filter" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" hide-details variant="solo" flat class="pa-2" />
          <v-list density="compact" nav>
            <v-list-item v-for="f in activeTab==='plugins'?filteredPluginFiles:filteredBotFiles" :key="f.path"
              :title="f.name" :subtitle="formatSize(f.size)" :active="currentFile===f.path"
              @click="openFile(f.path, f.scope)" @contextmenu.prevent="ctxMenu(f)"
              style="font-size:12px;min-height:30px;cursor:pointer">
              <template #prepend><v-icon size="16" :color="f.name.endsWith('.py')?'warning':''">{{ f.name.endsWith('.py')?'mdi-language-python':'mdi-file-document-outline' }}</v-icon></template>
            </v-list-item>
          </v-list>
          <v-btn block size="x-small" variant="text" prepend-icon="mdi-plus" @click="createDialog = true" class="mt-1">新建文件</v-btn>
        </div>

        <!-- Editor -->
        <div style="flex:1;display:flex;flex-direction:column;position:relative">
          <div v-if="currentFile" class="d-flex align-center px-3 py-1" style="border-bottom:1px solid rgba(var(--v-border-color),.3)">
            <v-icon size="16" class="mr-2">mdi-file-document-outline</v-icon>
            <span class="text-body-2">{{ currentFile }}</span>
            <v-spacer />
            <v-btn size="x-small" variant="text" icon="mdi-pencil-outline" @click="renameTarget = currentFile; renameNew = currentFile; renameDialog = true" title="重命名" />
            <v-btn size="x-small" variant="text" icon="mdi-reload" @click="reloadFile" title="热重载" />
          </div>
          <div ref="editorContainer" style="flex:1;min-height:300px"></div>
          <div v-if="!currentFile" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:#666;pointer-events:none">
            <v-icon size="64" color="grey-darken-1">mdi-code-braces</v-icon><div class="mt-2">选择左侧文件 / 右键创建</div>
          </div>
        </div>
      </div>

      <!-- Process Management -->
      <div v-show="activeTab === 'bots'" class="pa-4">
        <v-alert v-if="mainBot.running" type="success" variant="tonal" density="compact" class="mb-3" icon="mdi-check-circle">主 Bot 运行中 PID: {{ mainBot.pid }}</v-alert>
        <v-alert v-else type="error" variant="tonal" density="compact" class="mb-3" icon="mdi-close-circle">主 Bot 未运行</v-alert>
        <v-data-table :headers="botHeaders" :items="allbots" :loading="botsLoading" density="compact" items-per-page="20">
          <template #item.running="{ value }"><v-chip :color="value?'success':'error'" size="x-small">{{ value?'运行':'停止' }}</v-chip></template>
          <template #item.type="{ value }"><v-chip size="x-small" :color="value==='main'?'primary':''">{{ value==='main'?'主 Bot':'子 Bot' }}</v-chip></template>
          <template #item.actions="{ item }"><v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-text-box-outline" @click="viewBotLog(item)">日志</v-btn></template>
        </v-data-table>
        <v-btn variant="text" size="small" class="mt-2" prepend-icon="mdi-refresh" @click="loadBots" :loading="botsLoading">刷新</v-btn>
      </div>
    </v-card>

    <!-- Context Menu -->
    <v-menu v-model="ctxShow" :style="{left:ctxX+'px',top:ctxY+'px'}" absolute>
      <v-list density="compact">
        <v-list-item prepend-icon="mdi-pencil-outline" @click="ctxRename">重命名</v-list-item>
        <v-list-item prepend-icon="mdi-delete-outline" @click="ctxDelete">删除</v-list-item>
      </v-list>
    </v-menu>

    <!-- Create Dialog -->
    <v-dialog v-model="createDialog" max-width="360">
      <v-card title="新建文件">
        <v-card-text>
          <v-text-field v-model="createName" label="文件名 (.py)" density="compact" hide-details autofocus @keyup.enter="doCreate" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="createDialog=false">取消</v-btn><v-btn color="primary" @click="doCreate">创建</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Rename Dialog -->
    <v-dialog v-model="renameDialog" max-width="360">
      <v-card title="重命名">
        <v-card-text>
          <v-text-field v-model="renameNew" label="新文件名" density="compact" hide-details @keyup.enter="doRename" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="renameDialog=false">取消</v-btn><v-btn color="primary" @click="doRename">确认</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bot Log Dialog -->
    <v-dialog v-model="logDialog" max-width="700">
      <v-card>
        <v-card-item><template #prepend><v-icon>mdi-text-box-outline</v-icon></template><v-card-title>{{ logTitle }} 日志</v-card-title></v-card-item>
        <v-card-text>
          <div class="bg-grey-darken-4 pa-3" style="max-height:400px;overflow:auto;font-family:monospace;font-size:12px;white-space:pre-wrap">
            <div v-for="(l,i) in botLogLines" :key="i">{{ l }}</div>
          </div>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="logDialog=false">关闭</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import api from '@/api'

const files = ref([]); const currentFile = ref(''); const currentScope = ref('plugins')
const saving = ref(false); const activeTab = ref('plugins'); const filter = ref('')
const editorContainer = ref(null); let editor = null; const isFullscreen = ref(false)

const pluginFiles = computed(() => files.value.filter(f => f.scope === 'plugins'))
const botFiles = computed(() => files.value.filter(f => f.scope === 'bot'))
const filteredPluginFiles = computed(() => { const q = filter.value.toLowerCase(); return pluginFiles.value.filter(f => f.name.toLowerCase().includes(q)) })
const filteredBotFiles = computed(() => { const q = filter.value.toLowerCase(); return botFiles.value.filter(f => f.name.toLowerCase().includes(q)) })
function formatSize(s) { return s > 1024 ? (s/1024).toFixed(1)+'KB' : s+'B' }

// Context menu
const ctxShow = ref(false); const ctxX = ref(0); const ctxY = ref(0); const ctxTarget = ref(null)
function ctxMenu(f) { ctxTarget.value = f; ctxX.value = event.clientX; ctxY.value = event.clientY; ctxShow.value = true }
function ctxRename() { renameTarget.value = ctxTarget.value.path; renameNew.value = ctxTarget.value.name; renameDialog.value = true }
async function ctxDelete() {
  if (!confirm(`删除 ${ctxTarget.value.name}?`)) return
  try { await api.delete(`/code/file?path=${encodeURIComponent(ctxTarget.value.path)}&scope=${ctxTarget.value.scope}`); loadTree() } catch {}
}

// Create
const createDialog = ref(false); const createName = ref('')
async function doCreate() {
  if (!createName.value) return
  const scope = activeTab.value === 'bot' ? 'bot' : 'plugins'
  try { await api.post('/code/create', null, { params: { scope, name: createName.value } }); createDialog.value = false; createName.value = ''; loadTree() } catch(e) { alert(e.message) }
}

// Rename
const renameDialog = ref(false); const renameTarget = ref(''); const renameNew = ref('')
async function doRename() {
  if (!renameNew.value) return
  const scope = activeTab.value === 'bot' ? 'bot' : 'plugins'
  try { await api.put('/code/rename', null, { params: { old: renameTarget.value, new: renameNew.value, scope } }); renameDialog.value = false; loadTree(); if (currentFile.value === renameTarget.value) currentFile.value = renameNew.value } catch(e) { alert(e.message) }
}

// Bots
const bots = ref([]); const botsLoading = ref(false); const mainBot = ref({running:false,pid:0})
const allbots = computed(() => {
  const list = [{id:'main',username:'主 Bot',db:mainBot.value.db||'doge',pid:mainBot.value.pid,running:mainBot.value.running,type:'main'}]
  for (const b of bots.value) list.push({...b,type:'child'})
  return list
})
const logDialog = ref(false); const logTitle = ref(''); const botLogLines = ref([])
const botHeaders = [{title:'类型',key:'type',width:60},{title:'用户名',key:'username'},{title:'DB',key:'db'},{title:'PID',key:'pid',width:60},{title:'状态',key:'running',width:60},{title:'',key:'actions',width:60}]

async function loadTree() { try { files.value = await api.get('/code/tree') } catch {} }
async function loadBots() {
  botsLoading.value = true
  try { bots.value = await api.get('/bots/status') } catch {}
  try { mainBot.value = await api.get('/bots/main/status') } catch {}
  botsLoading.value = false
}
async function viewBotLog(bot) {
  logTitle.value = bot.type === 'main' ? '主 Bot' : `子 Bot ${bot.id}`
  logDialog.value = true; botLogLines.value = []
  try {
    const res = bot.type === 'main' ? await api.get('/bots/main/log') : await api.get(`/bots/${bot.id}/log`)
    botLogLines.value = res.lines
  } catch { botLogLines.value = ['无法读取日志'] }
}

// File ops
async function openFile(path, scope) {
  currentFile.value = path; currentScope.value = scope || 'plugins'; filter.value = ''
  try { const res = await api.get('/code/file', { params: { path, scope: scope || 'plugins' } }); if (editor) editor.setValue(res.content) } catch {}
}
async function saveFile() { if (!editor || !currentFile.value) return; saving.value = true; try { await api.put('/code/file', { path: currentFile.value, content: editor.getValue(), scope: currentScope.value }) } catch {} finally { saving.value = false } }
async function reloadFile() { if (!currentFile.value) return; try { await api.post('/code/reload', null, { params: { path: currentFile.value } }) } catch {} }

// Monaco
function initMonaco() {
  if (window.monaco) { createEditor(); return }
  if (document.querySelector('script[src*="monaco"]')) { setTimeout(initMonaco, 200); return }
  const s = document.createElement('script')
  s.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js'
  s.onload = () => { window.require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } }); window.require(['vs/editor/editor.main'], createEditor) }
  document.head.appendChild(s)
}
function createEditor() {
  if (!editorContainer.value) { setTimeout(createEditor, 300); return }
  if (editor) return
  try {
    editor = monaco.editor.create(editorContainer.value, { value: '# 选择左侧文件或右键新建', language: 'python', theme: 'vs-dark', fontSize: 14, minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false })
  } catch(e) { setTimeout(createEditor, 500) }
}

watch(activeTab, () => nextTick(() => { if (editor) editor.layout() }))
watch(isFullscreen, () => nextTick(() => { if (editor) editor.layout() }))
onMounted(() => { loadTree(); loadBots(); nextTick(() => setTimeout(initMonaco, 100)) })
</script>

<style>
.fullscreen-editor {
  position: fixed !important; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999; background: #111; padding: 12px;
}
</style>
