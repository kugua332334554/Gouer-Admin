<template>
  <div>
    <h2 class="text-h4 mb-6">仪表盘</h2>

    <!-- Stats Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" color="primary" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.groups }}</div>
              <div class="text-subtitle-2 text-medium-emphasis">群组</div>
            </div>
            <v-icon size="48" opacity="0.4">mdi-account-group</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" color="info" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.channels }}</div>
              <div class="text-subtitle-2 text-medium-emphasis">频道</div>
            </div>
            <v-icon size="48" opacity="0.4">mdi-broadcast</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" color="success" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.users }}</div>
              <div class="text-subtitle-2 text-medium-emphasis">用户</div>
            </div>
            <v-icon size="48" opacity="0.4">mdi-account</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" color="warning" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.active_clones }}</div>
              <div class="text-subtitle-2 text-medium-emphasis">活跃克隆</div>
            </div>
            <v-icon size="48" opacity="0.4">mdi-robot</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4" color="accent" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.active_lotteries }}</div>
              <div class="text-subtitle-2 text-medium-emphasis">进行中抽奖</div>
            </div>
            <v-icon size="48" opacity="0.4">mdi-ticket-confirmation</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.active_subscriptions }}</div>
              <div class="text-subtitle-2 text-medium-emphasis">有效订阅</div>
            </div>
            <v-icon size="48" opacity="0.4">mdi-crown</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4" color="error" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.scheduled_messages }}</div>
              <div class="text-subtitle-2 text-medium-emphasis">定时消息</div>
            </div>
            <v-icon size="48" opacity="0.4">mdi-clock-outline</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-card class="mt-6 pa-4">
      <v-card-title>快捷操作</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6" sm="3" md="2">
            <v-btn block variant="outlined" to="/groups" prepend-icon="mdi-account-group" class="mb-2">
              群组管理
            </v-btn>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-btn block variant="outlined" to="/users" prepend-icon="mdi-account" class="mb-2">
              用户管理
            </v-btn>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-btn block variant="outlined" to="/dingshi" prepend-icon="mdi-clock-outline" class="mb-2">
              定时消息
            </v-btn>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-btn block variant="outlined" to="/db-manager" prepend-icon="mdi-database" class="mb-2">
              数据库管理
            </v-btn>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-btn block variant="outlined" to="/weijinci" prepend-icon="mdi-block-helper" class="mb-2">
              违禁词
            </v-btn>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-btn block variant="outlined" to="/system" prepend-icon="mdi-cog" class="mb-2">
              系统配置
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Force Password Change Dialog -->
    <v-dialog v-model="forcePwDialog" max-width="440" persistent>
      <v-card>
        <v-card-item>
          <template #prepend><v-icon color="warning" size="32">mdi-alert-circle-outline</v-icon></template>
          <v-card-title>首次登录 — 必须修改密码</v-card-title>
          <v-card-subtitle>检测到您正在使用默认密码，请立即修改</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-text-field v-model="forcePw.new_password" label="新密码（至少6位）" type="password" prepend-inner-icon="mdi-lock-plus-outline" variant="outlined" density="compact" class="mb-2" />
          <v-text-field v-model="forcePw.confirm_password" label="确认新密码" type="password" prepend-inner-icon="mdi-lock-check-outline" variant="outlined" density="compact" />
          <v-alert v-if="forcePwError" type="error" variant="tonal" density="compact" class="mt-2">{{ forcePwError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="doForcePassword" :loading="forcePwLoading">确认修改</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()

const stats = ref({
  groups: 0, channels: 0, users: 0,
  active_lotteries: 0, active_clones: 0,
  active_subscriptions: 0, scheduled_messages: 0,
})

onMounted(async () => {
  // Force password change check
  if (route.query.force_password === '1') {
    forcePwDialog.value = true
  }
  try {
    const res = await api.get('/dashboard')
    stats.value = res
  } catch (e) {
    console.error('Load dashboard:', e)
  }
})

// Force password change
const forcePwDialog = ref(false)
const forcePw = reactive({ new_password: '', confirm_password: '' })
const forcePwError = ref('')
const forcePwLoading = ref(false)

async function doForcePassword() {
  if (forcePw.new_password !== forcePw.confirm_password) { forcePwError.value = '两次密码不一致'; return }
  if (forcePw.new_password.length < 6) { forcePwError.value = '新密码至少 6 位'; return }
  forcePwLoading.value = true; forcePwError.value = ''
  try {
    await api.post('/change-password', { old_password: 'admin123', new_password: forcePw.new_password })
    forcePwDialog.value = false
  } catch (e) { forcePwError.value = e.message } finally { forcePwLoading.value = false }
}
</script>
