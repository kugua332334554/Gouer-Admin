<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h4">Bot 克隆管理</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="dialog=true">添加克隆Bot</v-btn>
    </div>
    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" items-per-page="20">
        <template #item.status="{ value }">
          <v-chip :color="value === 'active' ? 'success' : 'error'" size="small">{{ value === 'active' ? '活跃' : value }}</v-chip>
        </template>
        <template #item.pid="{ value }">
          <v-chip :color="value ? 'success' : 'error'" size="small">{{ value ? '运行中' : '已停止' }}</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="del(item.id)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card title="添加 Bot Token">
        <v-card-text>
          <v-text-field label="所有者ID" v-model.number="form.owner_id" type="number" density="compact" hide-details />
          <v-text-field label="Bot Token" v-model="form.bot_token" density="compact" hide-details class="mt-3" hint="从 @BotFather 获取" persistent-hint />
          <v-text-field label="Bot 用户名" v-model="form.bot_username" density="compact" hide-details class="mt-3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog=false">取消</v-btn>
          <v-btn color="primary" @click="create">创建</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const items = ref([])
const loading = ref(false)
const dialog = ref(false)
const form = ref({ owner_id: 0, bot_token: '', bot_username: '' })

const headers = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '所有者ID', key: 'owner_id', width: 160 },
  { title: '用户名', key: 'bot_username' },
  { title: 'DB', key: 'db_name', width: 180 },
  { title: 'PID', key: 'pid', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', key: 'created_at', width: 180 },
  { title: '操作', key: 'actions', width: 80, sortable: false },
]

async function load() { loading.value = true; try { items.value = await api.get('/bot-tokens') } catch {} finally { loading.value = false } }
async function create() { try { await api.post('/bot-tokens', form.value); dialog.value = false; load() } catch {} }
async function del(id) { try { await api.delete(`/bot-tokens/${id}`); load() } catch {} }
onMounted(load)
</script>
