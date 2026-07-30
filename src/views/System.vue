<template>
  <div>
    <h2 class="text-h4 mb-4">系统配置</h2>
    <v-row>
      <!-- Change Password -->
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-item>
            <template #prepend><v-icon>mdi-lock-reset</v-icon></template>
            <v-card-title>修改密码</v-card-title>
          </v-card-item>
          <v-card-text>
            <v-text-field v-model="pw.old_password" label="当前密码" type="password" prepend-inner-icon="mdi-lock-outline" variant="outlined" density="compact" class="mb-2" />
            <v-text-field v-model="pw.new_password" label="新密码（至少 6 位）" type="password" prepend-inner-icon="mdi-lock-plus-outline" variant="outlined" density="compact" class="mb-2" />
            <v-text-field v-model="pw.confirm_password" label="确认新密码" type="password" prepend-inner-icon="mdi-lock-check-outline" variant="outlined" density="compact" />
            <v-btn color="primary" class="mt-3" @click="changePassword" :loading="pwLoading">修改密码</v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Bot Control -->
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-item>
            <template #prepend><v-icon>mdi-robot-outline</v-icon></template>
            <v-card-title>Bot 控制</v-card-title>
            <v-card-subtitle>一键管理所有 Bot 进程</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-row dense>
              <v-col cols="4"><v-btn block color="success" variant="outlined" prepend-icon="mdi-play" @click="botAction('start')" :loading="botLoading === 'start'">启动</v-btn></v-col>
              <v-col cols="4"><v-btn block color="warning" variant="outlined" prepend-icon="mdi-restart" @click="botAction('restart')" :loading="botLoading === 'restart'">重启</v-btn></v-col>
              <v-col cols="4"><v-btn block color="error" variant="outlined" prepend-icon="mdi-stop" @click="botAction('stop')" :loading="botLoading === 'stop'">停止</v-btn></v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <!-- DB Backup -->
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-item>
            <template #prepend><v-icon>mdi-database-export-outline</v-icon></template>
            <v-card-title>数据库备份</v-card-title>
            <v-card-subtitle>导出全量 SQL 文件</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-btn color="primary" variant="outlined" prepend-icon="mdi-download" @click="downloadBackup" :loading="backupLoading">下载备份</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <!-- 2FA Management -->
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-item>
            <template #prepend><v-icon>mdi-cellphone-key</v-icon></template>
            <v-card-title>两步验证</v-card-title>
            <v-card-subtitle>状态：已绑定</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-alert type="warning" variant="tonal" density="compact" class="mb-3" icon="mdi-alert-outline">
              查看二维码会暴露密钥，请确保周围环境安全
            </v-alert>
            <v-row dense>
              <v-col cols="6">
                <v-btn block variant="outlined" prepend-icon="mdi-eye-outline" @click="showQRDialog = true">查看二维码</v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn block variant="outlined" color="error" prepend-icon="mdi-refresh" @click="resetDialog = true">重置 2FA</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Show QR Dialog -->
    <v-dialog v-model="showQRDialog" max-width="420" persistent>
      <v-card>
        <v-card-item>
          <template #prepend><v-icon color="warning">mdi-alert-outline</v-icon></template>
          <v-card-title>确认查看</v-card-title>
          <v-card-subtitle>二维码包含密钥信息，请勿在公共场合打开</v-card-subtitle>
        </v-card-item>
        <v-card-actions>
          <v-spacer /><v-btn variant="text" @click="showQRDialog = false">取消</v-btn>
          <v-btn color="primary" @click="confirmShowQR" :loading="qrLoading">确认查看</v-btn>
        </v-card-actions>
        <v-card-text v-if="qrImage">
          <v-img :src="qrImage" max-width="220" class="mx-auto" />
          <v-text-field :model-value="qrSecretKey" label="密钥" readonly density="compact" class="mt-3"
            append-inner-icon="mdi-content-copy" @click:append-inner="copyText(qrSecretKey)" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Reset 2FA Dialog -->
    <v-dialog v-model="resetDialog" max-width="420" persistent>
      <v-card>
        <v-card-item>
          <template #prepend><v-icon color="error">mdi-refresh</v-icon></template>
          <v-card-title>重置两步验证</v-card-title>
          <v-card-subtitle>旧密钥将立即失效，需重新扫码绑定</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-alert type="error" variant="tonal" density="compact" class="mb-3">此操作不可撤销！</v-alert>
          <v-text-field v-model="resetPassword" label="当前密码" type="password"
            prepend-inner-icon="mdi-lock-outline" variant="outlined" density="compact" class="mb-2" />
          <v-text-field v-model="resetTotp" label="当前 Google 验证码"
            prepend-inner-icon="mdi-cellphone-key" variant="outlined" density="compact" maxlength="6" />
          <v-alert v-if="resetError" type="error" variant="tonal" density="compact" class="mt-2">{{ resetError }}</v-alert>
          <div v-if="newQR" class="mt-4">
            <v-divider class="mb-3" />
            <div class="text-subtitle-1 font-weight-bold mb-2">新密钥 — 请立即扫码绑定</div>
            <v-img :src="newQR" max-width="220" class="mx-auto" />
            <v-text-field :model-value="newSecret" label="新密钥" readonly density="compact" class="mt-3"
              append-inner-icon="mdi-content-copy" @click:append-inner="copyText(newSecret)" />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="resetDialog = false; resetError = ''; newQR = ''; newSecret = ''">取消</v-btn>
          <v-btn v-if="!newQR" color="error" @click="confirmReset" :loading="resetLoading">确认重置</v-btn>
          <v-btn v-else color="primary" @click="resetDialog = false; resetError = ''; newQR = ''; newSecret = ''">完成</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" color="success" timeout="2000">{{ snackMsg }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api'

const snackbar = ref(false), snackMsg = ref('')

// Password change
const pw = ref({ old_password: '', new_password: '', confirm_password: '' })
const pwLoading = ref(false)
async function changePassword() {
  if (pw.value.new_password !== pw.value.confirm_password) { snackMsg.value = '两次密码不一致'; snackbar.value = true; return }
  pwLoading.value = true
  try {
    await api.post('/change-password', { old_password: pw.value.old_password, new_password: pw.value.new_password })
    snackMsg.value = '密码已修改，下次登录生效'; snackbar.value = true
    pw.value = { old_password: '', new_password: '', confirm_password: '' }
  } catch (e) { snackMsg.value = e.message; snackbar.value = true } finally { pwLoading.value = false }
}

// 2FA show QR
const showQRDialog = ref(false), qrLoading = ref(false), qrImage = ref(''), qrSecretKey = ref('')
async function confirmShowQR() {
  qrLoading.value = true
  try {
    const res = await api.get('/2fa-setup', { params: { confirm: true } })
    qrImage.value = res.qr_code; qrSecretKey.value = res.secret
  } catch (e) { snackMsg.value = e.message; snackbar.value = true } finally { qrLoading.value = false }
}

// 2FA reset
const resetDialog = ref(false), resetLoading = ref(false), resetPassword = ref(''), resetTotp = ref(''), resetError = ref(''), newQR = ref(''), newSecret = ref('')
async function confirmReset() {
  if (!resetPassword.value || !resetTotp.value) { resetError.value = '请填写密码和验证码'; return }
  resetLoading.value = true; resetError.value = ''
  try {
    const res = await api.post('/2fa-reset', { password: resetPassword.value, totp_code: resetTotp.value })
    newQR.value = res.qr_code; newSecret.value = res.secret
  } catch (e) { resetError.value = e.message } finally { resetLoading.value = false }
}

const botLoading = ref('')
async function botAction(action) { botLoading.value = action; try { await api.post(`/bots/${action}-all`); snackMsg.value = `${action} 完成`; snackbar.value = true } catch(e) { snackMsg.value = e.message; snackbar.value = true } finally { botLoading.value = '' } }

const backupLoading = ref(false)
async function downloadBackup() {
  backupLoading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const meta = document.querySelector('meta[name="api-prefix"]')
    const prefix = meta ? meta.content : ''
    const res = await fetch(`${prefix}/db/backup`, { headers: { Authorization: `Bearer ${token}` } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `backup_${Date.now()}.sql`; a.click()
    URL.revokeObjectURL(url)
  } catch(e) { snackMsg.value = '备份失败'; snackbar.value = true } finally { backupLoading.value = false }
}

async function copyText(text) { try { await navigator.clipboard.writeText(text) } catch {} }
</script>
