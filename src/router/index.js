import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('@/views/Groups.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/groups/:id',
    name: 'GroupDetail',
    component: () => import('@/views/GroupDetail.vue'),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dingshi',
    name: 'Dingshi',
    component: () => import('@/views/Dingshi.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/weijinci',
    name: 'Weijinci',
    component: () => import('@/views/Weijinci.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/keyword-reply',
    name: 'KeywordReply',
    component: () => import('@/views/KeywordReply.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('@/views/Shop.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/lotteries',
    name: 'Lotteries',
    component: () => import('@/views/Lotteries.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/kuaisufabu',
    name: 'QuickPublish',
    component: () => import('@/views/QuickPublish.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/bot-tokens',
    name: 'BotTokens',
    component: () => import('@/views/BotTokens.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/blacklist',
    name: 'Blacklist',
    component: () => import('@/views/Blacklist.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/fortunes',
    name: 'Fortunes',
    component: () => import('@/views/Fortunes.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/channels',
    name: 'Channels',
    component: () => import('@/views/Channels.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: () => import('@/views/Subscriptions.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/db-manager',
    name: 'DBManager',
    component: () => import('@/views/DBManager.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/code-editor',
    name: 'CodeEditor',
    component: () => import('@/views/CodeEditor.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/views/System.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/points',
    name: 'Points',
    component: () => import('@/views/Points.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/login')
  } else if (to.meta.guest && auth.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
