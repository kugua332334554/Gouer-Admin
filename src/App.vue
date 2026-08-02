<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-if="auth.isLoggedIn"
      :model-value="drawer"
      @update:model-value="drawer = $event"
      :rail="rail"
      permanent
      :width="260"
      class="no-scrollbar"
    >
      <v-list-item
        class="pa-4"
        :title="'GouerBot'"
        subtitle="群管管理后台"
        prepend-avatar="logo.svg"
        nav
      >
        <template #append>
          <v-btn
            :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            variant="text"
            size="small"
            @click="rail = !rail"
          />
        </template>
      </v-list-item>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="仪表盘"
          value="dashboard"
          to="/dashboard"
        />
        <v-list-item
          prepend-icon="mdi-account-group"
          title="群组管理"
          value="groups"
          to="/groups"
        />
        <v-list-item
          prepend-icon="mdi-broadcast"
          title="频道管理"
          value="channels"
          to="/channels"
        />
        <v-list-item
          prepend-icon="mdi-account"
          title="用户管理"
          value="users"
          to="/users"
        />
        <v-list-item
          prepend-icon="mdi-star"
          title="积分管理"
          value="points"
          to="/points"
        />

        <v-divider class="my-2" />

        <v-list-subheader>功能模块</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-clock-outline"
          title="定时消息"
          value="dingshi"
          to="/dingshi"
        />
        <v-list-item
          prepend-icon="mdi-block-helper"
          title="违禁词管理"
          value="weijinci"
          to="/weijinci"
        />
        <v-list-item
          prepend-icon="mdi-key-variant"
          title="关键词回复"
          value="keyword-reply"
          to="/keyword-reply"
        />
        <v-list-item
          prepend-icon="mdi-cart"
          title="积分商城"
          value="shop"
          to="/shop"
        />
        <v-list-item
          prepend-icon="mdi-ticket-confirmation"
          title="抽奖管理"
          value="lotteries"
          to="/lotteries"
        />
        <v-list-item
          prepend-icon="mdi-send-outline"
          title="快速发布"
          value="kuaisufabu"
          to="/kuaisufabu"
        />
        <v-list-item
          prepend-icon="mdi-clover"
          title="抽签管理"
          value="fortunes"
          to="/fortunes"
        />

        <v-divider class="my-2" />

        <v-list-subheader>系统管理</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-robot"
          title="Bot克隆"
          value="bot-tokens"
          to="/bot-tokens"
        />
        <v-list-item
          prepend-icon="mdi-account-cancel"
          title="集群黑名单"
          value="blacklist"
          to="/blacklist"
        />
        <v-list-item
          prepend-icon="mdi-crown"
          title="订阅管理"
          value="subscriptions"
          to="/subscriptions"
        />
        <v-list-item
          prepend-icon="mdi-code-braces"
          title="插件管理"
          value="code-editor"
          to="/code-editor"
        />
        <v-list-item
          prepend-icon="mdi-database"
          title="数据库管理"
          value="db-manager"
          to="/db-manager"
        />
        <v-list-item
          prepend-icon="mdi-cog"
          title="系统配置"
          value="system"
          to="/system"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-app-bar
        v-if="auth.isLoggedIn"
        :elevation="1"
        density="compact"
      >
        <template #prepend>
          <v-app-bar-nav-icon
            v-if="!drawer || rail"
            @click="drawer = !drawer"
          />
        </template>

        <v-app-bar-title>
          {{ $route.meta.title || pageTitle }}
        </v-app-bar-title>

        <v-spacer />

        <!-- Bot selector — switch between main + clone bots -->
        <v-select
          v-if="botStore.bots.length >= 1"
          :model-value="botStore.selectedBotId"
          :items="botStore.bots"
          item-title="bot_username"
          item-value="id"
          density="compact"
          hide-details
          variant="outlined"
          style="max-width: 220px"
          @update:model-value="onBotChange"
        >
          <template #item="{ item, props }">
            <v-list-item v-bind="props">
              <template #append>
                <v-chip size="x-small" variant="tonal" class="ml-2">
                  {{ item.raw.group_count }} 群
                </v-chip>
              </template>
            </v-list-item>
          </template>
        </v-select>

        <v-btn
          :icon="theme.isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          variant="text"
          @click="theme.toggle()"
          :title="theme.isDark ? '切换到亮色模式' : '切换到暗色模式'"
        />

        <v-menu>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-dots-vertical"
              variant="text"
            />
          </template>
          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-shield-key"
              title="2FA 设置"
              @click="show2FADialog = true"
            />
            <v-list-item
              prepend-icon="mdi-logout"
              title="退出登录"
              @click="handleLogout"
            />
          </v-list>
        </v-menu>
      </v-app-bar>

      <v-container fluid class="pa-4">
        <router-view :key="routerViewKey" />
      </v-container>
    </v-main>

    <!-- 2FA Setup Dialog -->
    <v-dialog v-model="show2FADialog" max-width="500">
      <v-card title="Google Authenticator 设置">
        <v-card-text class="text-center">
          <v-img v-if="qrCode" :src="qrCode" max-width="250" class="mx-auto mb-4" />
          <v-text-field
            v-if="qrSecret"
            :model-value="qrSecret"
            label="密钥 (手动输入)"
            readonly
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copySecret"
            variant="outlined"
            density="compact"
          />
          <p class="text-caption text-medium-emphasis mt-2">
            使用 Google Authenticator 扫描二维码或手动输入密钥完成设置
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="load2FA">刷新</v-btn>
          <v-btn @click="show2FADialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useBotStore } from '@/stores/bot'
import api from '@/api'

const auth = useAuthStore()
const theme = useThemeStore()
const botStore = useBotStore()
const router = useRouter()
const route = useRoute()

const drawer = ref(true)
const rail = ref(false)
const show2FADialog = ref(false)
const qrCode = ref('')
const qrSecret = ref('')

// Force router-view remount on bot switch
const routerViewKey = ref(0)
watch(() => botStore.selectedBotId, () => { routerViewKey.value++ })

// Bot change handler
function onBotChange(botId) {
  const bot = botStore.bots.find(b => b.id === botId)
  if (bot) botStore.selectBot(bot)
}

const pageTitles = {
  '/dashboard': '仪表盘',
  '/groups': '群组管理',
  '/users': '用户管理',
  '/dingshi': '定时消息',
  '/weijinci': '违禁词管理',
  '/keyword-reply': '关键词回复',
  '/shop': '积分商城',
  '/lotteries': '抽奖管理',
  '/kuaisufabu': '快速发布',
  '/bot-tokens': 'Bot 克隆',
  '/channels': '频道管理',
  '/subscriptions': '订阅管理',
  '/db-manager': '数据库管理',
  '/system': '系统配置',
  '/points': '积分管理',
}

const pageTitle = computed(() => {
  const base = route.path.split('/')[1] || ''
  return pageTitles['/' + base] || '管理后台'
})

theme.init()

async function load2FA() {
  try {
    const res = await api.get('/2fa-setup')
    qrCode.value = res.qr_code
    qrSecret.value = res.secret
  } catch (e) {
    console.error('Load 2FA failed:', e)
  }
}

async function copySecret() {
  try {
    await navigator.clipboard.writeText(qrSecret.value)
  } catch {}
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => { botStore.loadBots() })
</script>

<style>
.v-navigation-drawer {
  transition: width 0.2s ease;
}
.no-scrollbar .v-navigation-drawer__content {
  overflow: hidden !important;
}
.no-scrollbar .v-navigation-drawer__content:hover {
  overflow-y: auto !important;
}
.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.12);
}
</style>
