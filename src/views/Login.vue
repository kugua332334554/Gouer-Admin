<template>
  <div style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;display:flex;overflow:hidden">
    <!-- Left: background image -->
    <div class="d-none d-md-block" style="flex:1;position:relative">
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:url('login-bg.jpg') center/cover no-repeat" />
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,rgba(0,0,0,.55),rgba(0,0,0,.25))" />
      <div style="position:absolute;bottom:60px;left:60px;color:#fff;z-index:1">
        <div class="text-h3 font-weight-bold mb-2">GouerAdmin</div>
        <div class="text-subtitle-1" style="color:rgba(255,255,255,.7)">群管机器人后台管理系统</div>
      </div>
    </div>

    <!-- Right: login form -->
    <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px;overflow-y:auto">
      <v-card max-width="420" width="100%" elevation="0" class="bg-transparent">
        <v-card-item class="mb-4 px-0">
          <v-icon size="40" color="primary" class="mb-2">mdi-shield-lock-outline</v-icon>
          <v-card-title class="text-h4 font-weight-bold px-0">登录</v-card-title>
          <v-card-subtitle class="px-0">请输入账号信息</v-card-subtitle>
        </v-card-item>

        <v-alert v-if="errorMsg" type="error" variant="tonal" closable class="mb-4" @click:close="errorMsg=''">{{ errorMsg }}</v-alert>

        <v-form @submit.prevent="handleLogin">
          <v-text-field v-model="username" label="账号" prepend-inner-icon="mdi-account-outline" variant="outlined" density="comfortable" class="mb-2" />
          <v-text-field v-model="password" label="密码" type="password" prepend-inner-icon="mdi-lock-outline" variant="outlined" density="comfortable" class="mb-2" />
          <v-text-field v-model="totpCode" label="Google 验证码" prepend-inner-icon="mdi-cellphone-key" placeholder="6 位数字" maxlength="6" variant="outlined" density="comfortable" class="mb-2" />

          <v-row dense class="mb-2" align="center">
            <v-col cols="7">
              <v-text-field v-model="captchaAnswer" label="验证码" prepend-inner-icon="mdi-security" variant="outlined" density="comfortable" hide-details @keyup.enter="handleLogin" />
            </v-col>
            <v-col cols="5">
              <div class="d-flex align-center" style="gap:4px">
                <v-img v-if="captcha.image" :src="captcha.image" max-width="130" max-height="48" class="border rounded" @click="refreshCaptcha" style="cursor:pointer" />
                <div v-else class="text-caption text-disabled" style="width:130px;height:48px;display:grid;place-items:center;border:1px dashed #999;cursor:pointer" @click="refreshCaptcha">点击获取</div>
                <v-btn variant="text" size="x-small" icon="mdi-refresh" :loading="captchaLoading" @click="refreshCaptcha" />
              </div>
            </v-col>
          </v-row>

          <v-btn type="submit" color="primary" block size="large" :loading="loading" class="mt-2" prepend-icon="mdi-login">登录</v-btn>
        </v-form>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('admin')
const password = ref('')
const totpCode = ref('')
const captchaAnswer = ref('')
const captcha = ref({ captcha_id: '', image: '' })
const errorMsg = ref('')
const loading = ref(false)
const captchaLoading = ref(false)

async function refreshCaptcha() {
  captchaLoading.value = true
  try {
    const res = await api.post('/captcha')
    captcha.value = { captcha_id: res.captcha_id, image: res.image }
  } catch (e) {
    errorMsg.value = '获取验证码失败'
  } finally { captchaLoading.value = false }
}

async function handleLogin() {
  if (!captcha.value.captcha_id) { errorMsg.value = '请先获取验证码'; return }
  loading.value = true; errorMsg.value = ''
  try {
    const result = await authStore.login(username.value, password.value, totpCode.value, captcha.value.captcha_id, captchaAnswer.value)
    if (result.must_change_password) {
      router.push('/dashboard?force_password=1')
    } else {
      router.push('/dashboard')
    }
  } catch (e) {
    errorMsg.value = e.message
    refreshCaptcha()
  } finally { loading.value = false }
}

onMounted(refreshCaptcha)
</script>
