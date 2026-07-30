<template>
  <div>
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" to="/groups" class="mr-3" />
      <div>
        <h2 class="text-h4">{{ group.title || '群组详情' }}</h2>
        <p class="text-body-2 text-medium-emphasis">
          ID: <code>{{ group.chat_id }}</code>
          <span v-if="group.username"> | @{{ group.username }}</span>
        </p>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="7">
        <!-- Basic Info -->
        <v-card class="mb-4">
          <v-card-item><template #prepend><v-icon>mdi-information-outline</v-icon></template><v-card-title>基本信息</v-card-title></v-card-item>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6"><v-text-field label="群组名称" v-model="editInfo.title" variant="outlined" density="compact" hide-details /></v-col>
              <v-col cols="12" sm="6"><v-text-field label="用户名" v-model="editInfo.username" variant="outlined" density="compact" hide-details /></v-col>
            </v-row>
            <v-btn color="primary" class="mt-4" @click="saveInfo">保存</v-btn>
          </v-card-text>
        </v-card>

        <!-- Verification -->
        <v-card class="mb-4">
          <v-card-item class="pb-0"><template #prepend><v-icon>mdi-shield-check-outline</v-icon></template>
            <v-card-title>进群验证</v-card-title>
            <template #append><v-switch v-model="group.verify.status" hide-details density="compact" @update:model-value="saveVerify" /></template>
          </v-card-item>
          <v-card-text v-if="group.verify.status">
            <v-row>
              <v-col cols="4"><v-select label="验证模式" :items="verifyModes" v-model="group.verify.mode" density="compact" hide-details @update:model-value="saveVerify" /></v-col>
              <v-col cols="4"><v-select label="验证时间" :items="verifyDurations" v-model="group.verify.duration" density="compact" hide-details @update:model-value="saveVerify" /></v-col>
              <v-col cols="4"><v-select label="超时惩罚" :items="verifyPenalties" v-model="group.verify.penalty" density="compact" hide-details @update:model-value="saveVerify" /></v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Welcome -->
        <v-card class="mb-4">
          <v-card-item class="pb-0"><template #prepend><v-icon>mdi-hand-wave-outline</v-icon></template>
            <v-card-title>欢迎消息</v-card-title>
            <template #append><v-switch v-model="group.welcome.status" hide-details density="compact" @update:model-value="saveWelcome" /></template>
          </v-card-item>
          <v-card-text v-if="group.welcome.status">
            <v-textarea label="欢迎文本" v-model="group.welcome.welcome_text" rows="2" density="compact" hide-details hint="可用: {MENTION} {USERNAME} {CHAT} {USER_ID}" persistent-hint />
            <v-text-field label="按钮 JSON" v-model="group.welcome.buttons_text" density="compact" hide-details class="mt-2" />
            <v-row class="mt-2">
              <v-col cols="6"><v-text-field label="自动删除(秒)" v-model.number="group.welcome.delete_time" type="number" density="compact" hide-details /></v-col>
              <v-col cols="6"><v-checkbox label="删除上一条" v-model="group.welcome.delete_last" hide-details density="compact" /></v-col>
            </v-row>
            <v-btn color="primary" class="mt-3" @click="saveWelcome">保存</v-btn>
          </v-card-text>
        </v-card>

        <!-- Anti-Spam -->
        <v-card class="mb-4">
          <v-card-item class="pb-0"><template #prepend><v-icon>mdi-shield-alert-outline</v-icon></template>
            <v-card-title>反垃圾</v-card-title>
            <template #append><v-switch v-model="group.antispam.enabled" hide-details density="compact" @update:model-value="saveAntispam" /></template>
          </v-card-item>
          <v-card-text v-if="group.antispam.enabled">
            <v-row dense>
              <v-col cols="4" v-for="opt in antispamOptions" :key="opt.key">
                <v-checkbox :label="opt.label" v-model="group.antispam[opt.key]" hide-details density="compact" @update:model-value="saveAntispam" />
              </v-col>
            </v-row>
            <v-row class="mt-2">
              <v-col cols="6"><v-text-field label="刷屏次数" v-model.number="group.antispam.flood_count" type="number" density="compact" hide-details /></v-col>
              <v-col cols="6"><v-text-field label="刷屏窗口(秒)" v-model.number="group.antispam.flood_timeout" type="number" density="compact" hide-details /></v-col>
              <v-col cols="6"><v-select label="惩罚方式" v-model="group.antispam.penalty" :items="penaltyItems" density="compact" hide-details /></v-col>
              <v-col cols="6"><v-text-field label="禁言时长(秒)" v-model.number="group.antispam.mute_duration" type="number" density="compact" hide-details /></v-col>
              <v-col cols="6"><v-text-field label="白名单(UID逗号分隔)" v-model="group.antispam.whitelist" density="compact" hide-details /></v-col>
              <v-col cols="6"><v-text-field label="警告删除(秒)" v-model.number="group.antispam.warn_delete" type="number" density="compact" hide-details /></v-col>
            </v-row>
            <v-btn color="primary" class="mt-3" @click="saveAntispam">保存</v-btn>
          </v-card-text>
        </v-card>

        <!-- Night Mode -->
        <v-card class="mb-4">
          <v-card-item class="pb-0"><template #prepend><v-icon>mdi-weather-night</v-icon></template>
            <v-card-title>夜间模式</v-card-title>
            <template #append><v-switch v-model="group.night.status" hide-details density="compact" @update:model-value="saveNight" /></template>
          </v-card-item>
          <v-card-text v-if="group.night.status">
            <v-row>
              <v-col cols="4"><v-select label="开始" :items="hours" v-model="group.night.start_hour" density="compact" hide-details @update:model-value="saveNight" /></v-col>
              <v-col cols="4"><v-select label="结束" :items="hours" v-model="group.night.end_hour" density="compact" hide-details @update:model-value="saveNight" /></v-col>
              <v-col cols="4"><v-checkbox label="通知" v-model="group.night.notify" hide-details density="compact" @update:model-value="saveNight" /></v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <!-- Points -->
        <v-card class="mb-4">
          <v-card-item class="pb-0"><template #prepend><v-icon>mdi-star-outline</v-icon></template>
            <v-card-title>积分设置</v-card-title>
            <template #append><v-switch v-model="group.points.status" hide-details density="compact" @update:model-value="savePoints" /></template>
          </v-card-item>
          <v-card-text v-if="group.points.status">
            <v-text-field label="每条消息积分" v-model.number="group.points.msg_points" type="number" density="compact" hide-details />
            <v-checkbox label="忽略贴纸消息" v-model="group.points.ignore_stickers" hide-details density="compact" class="mt-2" />
            <v-btn color="primary" class="mt-3" @click="savePoints">保存</v-btn>
          </v-card-text>
        </v-card>

        <!-- AI Settings -->
        <v-card class="mb-4">
          <v-card-item><template #prepend><v-icon>mdi-robot-outline</v-icon></template><v-card-title>AI 设置</v-card-title></v-card-item>
          <v-card-text>
            <v-row dense>
              <v-col cols="6"><v-switch v-model="group.ai.chat_enabled" label="AI 聊天" hide-details density="compact" @update:model-value="saveAI" /></v-col>
              <v-col cols="6"><v-switch v-model="group.ai.audit_enabled" label="AI 审核" hide-details density="compact" @update:model-value="saveAI" /></v-col>
            </v-row>
            <v-text-field label="触发词" v-model="group.ai.chat_trigger" density="compact" hide-details class="mt-2" />
            <v-textarea label="系统提示词 (chat_prompt)" v-model="group.ai.chat_prompt" rows="2" density="compact" hide-details class="mt-2" />
            <v-select label="审核惩罚" v-model="group.ai.audit_penalty" :items="penaltyItems" density="compact" hide-details class="mt-2" @update:model-value="saveAI" />
            <v-btn color="primary" class="mt-3" @click="saveAI">保存</v-btn>
          </v-card-text>
        </v-card>

        <!-- Toggle Group -->
        <v-card class="mb-4">
          <v-card-item class="pb-0"><template #prepend><v-icon>mdi-toggle-switch-outline</v-icon></template>
            <v-card-title>开关群</v-card-title>
            <template #append><v-switch v-model="group.toggle.enabled" hide-details density="compact" @update:model-value="saveToggle" /></template>
          </v-card-item>
          <v-card-text v-if="group.toggle.enabled">
            <v-text-field label="开群关键词" v-model="group.toggle.open_keyword" density="compact" hide-details />
            <v-textarea label="开群消息" v-model="group.toggle.open_text" rows="2" density="compact" hide-details class="mt-2" />
            <v-text-field label="关群关键词" v-model="group.toggle.close_keyword" density="compact" hide-details class="mt-2" />
            <v-textarea label="关群消息" v-model="group.toggle.close_text" rows="2" density="compact" hide-details class="mt-2" />
            <v-btn color="primary" class="mt-3" @click="saveToggle">保存</v-btn>
          </v-card-text>
        </v-card>

        <!-- Speak Check -->
        <v-card class="mb-4">
          <v-card-item class="pb-0"><template #prepend><v-icon>mdi-check-circle-outline</v-icon></template>
            <v-card-title>发言检查</v-card-title>
            <template #append><v-switch v-model="group.speak_check.enabled" hide-details density="compact" @update:model-value="saveSpeakCheck" /></template>
          </v-card-item>
          <v-card-text v-if="group.speak_check.enabled">
            <v-checkbox label="要求姓氏" v-model="group.speak_check.require_last_name" density="compact" hide-details @update:model-value="saveSpeakCheck" />
            <v-checkbox label="要求用户名" v-model="group.speak_check.require_username" density="compact" hide-details @update:model-value="saveSpeakCheck" />
            <v-checkbox label="要求头像" v-model="group.speak_check.require_photo" density="compact" hide-details @update:model-value="saveSpeakCheck" />
            <v-checkbox label="要求 Premium" v-model="group.speak_check.require_premium" density="compact" hide-details @update:model-value="saveSpeakCheck" />
            <v-checkbox label="要求关注频道" v-model="group.speak_check.require_channel" density="compact" hide-details @update:model-value="saveSpeakCheck" />
            <v-text-field v-if="group.speak_check.require_channel" label="频道用户名" v-model="group.speak_check.channel_username" density="compact" hide-details class="mt-2" />
            <v-row class="mt-2">
              <v-col cols="6"><v-select label="惩罚" v-model="group.speak_check.penalty" :items="penaltyItems" density="compact" hide-details /></v-col>
              <v-col cols="6"><v-text-field label="禁言时长(秒)" v-model.number="group.speak_check.mute_duration" type="number" density="compact" hide-details /></v-col>
            </v-row>
            <v-btn color="primary" class="mt-3" @click="saveSpeakCheck">保存</v-btn>
          </v-card-text>
        </v-card>

        <!-- Auto Delete -->
        <v-card class="mb-4">
          <v-card-item><template #prepend><v-icon>mdi-delete-outline</v-icon></template><v-card-title>自动删除</v-card-title></v-card-item>
          <v-card-text>
            <v-checkbox label="置顶消息" v-model="group.autodelete.pin" density="compact" hide-details @update:model-value="saveAutodelete" />
            <v-checkbox label="头像变更" v-model="group.autodelete.photo" density="compact" hide-details @update:model-value="saveAutodelete" />
            <v-checkbox label="标题变更" v-model="group.autodelete.title" density="compact" hide-details @update:model-value="saveAutodelete" />
          </v-card-text>
        </v-card>

        <!-- Card -->
        <v-card class="mb-4">
          <v-card-item class="pb-0"><template #prepend><v-icon>mdi-credit-card-outline</v-icon></template>
            <v-card-title>名片打卡</v-card-title>
            <template #append><v-switch v-model="group.card.enabled" hide-details density="compact" @update:model-value="saveCard" /></template>
          </v-card-item>
        </v-card>

        <!-- Permission -->
        <v-card class="mb-4">
          <v-card-item><template #prepend><v-icon>mdi-shield-key-outline</v-icon></template><v-card-title>权限控制</v-card-title></v-card-item>
          <v-card-text>
            <v-select label="管理权限" v-model="group.permission" :items="permItems" density="compact" hide-details @update:model-value="savePermission" />
          </v-card-text>
        </v-card>

        <!-- Stats -->
        <v-card class="mb-4">
          <v-card-item><template #prepend><v-icon>mdi-chart-bar</v-icon></template><v-card-title>统计</v-card-title></v-card-item>
          <v-card-text>
            <v-list density="compact">
              <v-list-item><template #prepend><v-icon size="small">mdi-clock-outline</v-icon></template>
                <v-list-item-title>定时消息</v-list-item-title>
                <template #append><span class="text-h6">{{ group.dingshi_count || 0 }}</span></template>
              </v-list-item>
              <v-list-item><template #prepend><v-icon size="small">mdi-block-helper</v-icon></template>
                <v-list-item-title>违禁词</v-list-item-title>
                <template #append><span class="text-h6">{{ group.weijinci_count || 0 }}</span></template>
              </v-list-item>
              <v-list-item><template #prepend><v-icon size="small">mdi-history</v-icon></template>
                <v-list-item-title>动作日志</v-list-item-title>
                <template #append><span class="text-h6">{{ group.action_count || 0 }}</span></template>
              </v-list-item>
              <v-list-item><template #prepend><v-icon size="small">mdi-crown-outline</v-icon></template>
                <v-list-item-title>有效订阅</v-list-item-title>
                <template #append><span class="text-body-2">{{ (group.subscriptions || []).map(s => s.feature).join(', ') || '无' }}</span></template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" :color="snackColor" timeout="2000">{{ snackMsg }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()
const chatId = computed(() => Number(route.params.id))

const group = ref({
  chat_id: 0, title: '', username: '', type: '',
  verify: { status: false, mode: 'button', duration: 1, penalty: 'mute' },
  welcome: { status: false, delete_time: 0, delete_last: false, welcome_text: '' },
  night: { status: false, start_hour: 0, end_hour: 6, notify: true },
  antispam: { enabled: false },
  ai: { chat_enabled: false, audit_enabled: false, chat_prompt: '', chat_trigger: '', audit_penalty: 'delete' },
  toggle: { enabled: false, open_keyword: '', close_keyword: '' },
  points: { status: false, msg_points: 0, ignore_stickers: true },
  speak_check: { enabled: false, require_last_name: false, require_username: false, require_photo: false, require_premium: false },
  autodelete: { pin: false, photo: false, title: false },
  card: { enabled: false },
  permission: 'all',
  subscriptions: [],
  dingshi_count: 0, weijinci_count: 0, action_count: 0,
})
const editInfo = reactive({ title: '', username: '' })

const verifyModes = [{ title: '私聊验证', value: 'private' }, { title: '按钮', value: 'button' }, { title: '数学题', value: 'math' }, { title: '验证码', value: 'captcha' }]
const verifyDurations = [1, 5, 10].map(v => ({ title: `${v}分钟`, value: v }))
const verifyPenalties = [{ title: '禁言', value: 'mute' }, { title: '踢出', value: 'kick' }]
const hours = Array.from({ length: 24 }, (_, i) => ({ title: `${i}:00`, value: i }))
const antispamOptions = [
  { key: 'block_contact', label: '联系人' }, { key: 'block_location', label: '位置' },
  { key: 'block_channel_send', label: '频道发送' }, { key: 'block_channel_fwd', label: '频道转发' },
  { key: 'block_links', label: '链接' }, { key: 'block_mention', label: '提及' },
  { key: 'block_exe', label: 'EXE文件' },
  { key: 'block_flood', label: '刷屏' }, { key: 'block_long_links', label: '长链接' },
  { key: 'block_external_ref', label: '外部引用' },
]
const penaltyItems = [{ title: '删除', value: 'delete' }, { title: '禁言', value: 'mute' }, { title: '踢出', value: 'kick' }, { title: '封禁', value: 'ban' }]
const permItems = [{ title: '全部管理员', value: 'all' }, { title: '可添加管理员者', value: 'add_admins' }, { title: '仅创建者', value: 'creator' }, { title: '可封禁者', value: 'ban' }]

const snackbar = ref(false), snackMsg = ref(''), snackColor = ref('success')
function showSnack(msg, color = 'success') { snackMsg.value = msg; snackColor.value = color; snackbar.value = true }

async function loadGroup() {
  try {
    const res = await api.get(`/groups/${chatId.value}`)
    group.value = res; editInfo.title = res.title || ''; editInfo.username = res.username || ''
  } catch (e) { showSnack('加载失败: ' + e.message, 'error') }
}

async function saveInfo() { try { await api.put(`/groups/${chatId.value}`, { title: editInfo.title, username: editInfo.username }); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function saveVerify() { try { await api.put(`/groups/${chatId.value}/verify`, group.value.verify); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function saveWelcome() { try { await api.put(`/groups/${chatId.value}/welcome`, group.value.welcome); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function saveNight() { try { await api.put(`/groups/${chatId.value}/night`, group.value.night); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function saveAntispam() { try { await api.put(`/groups/${chatId.value}/antispam`, group.value.antispam); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function saveAI() { try { await api.put(`/groups/${chatId.value}/ai`, group.value.ai); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function saveToggle() { try { await api.put(`/groups/${chatId.value}/toggle`, group.value.toggle); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function savePoints() { try { await api.put(`/groups/${chatId.value}/points`, group.value.points); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function saveSpeakCheck() { try { await api.put(`/groups/${chatId.value}/speak-check`, group.value.speak_check); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function saveAutodelete() { try { await api.put(`/groups/${chatId.value}/autodelete`, group.value.autodelete); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function saveCard() { try { await api.put(`/groups/${chatId.value}/card`, group.value.card); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }
async function savePermission() { try { await api.put(`/groups/${chatId.value}/permission`, { permissions: group.value.permission }); showSnack('已保存') } catch (e) { showSnack(e.message, 'error') } }

onMounted(loadGroup)
</script>
