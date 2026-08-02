<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h4">集群黑名单</h2>
      <v-btn color="error" prepend-icon="mdi-plus" @click="dialog=true">添加黑名单</v-btn>
    </div>
    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" items-per-page="20">
        <template #item.user_id="{ value }">
          <code>{{ value }}</code>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="del(item.user_id)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card title="添加集群黑名单">
        <v-card-text>
          <v-text-field label="用户ID" v-model.number="form.user_id" type="number" density="compact" hide-details />
          <v-text-field label="用户名(可选)" v-model="form.username" density="compact" hide-details class="mt-3" />
          <v-text-field label="原因(可选)" v-model="form.reason" density="compact" hide-details class="mt-3" placeholder="如 anti_bot / 手动添加" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog=false">取消</v-btn>
          <v-btn color="error" @click="create">添加</v-btn>
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
const form = ref({ user_id: 0, username: '', reason: '' })

const headers = [
  { title: '用户ID', key: 'user_id', width: 160 },
  { title: '用户名', key: 'username', width: 180 },
  { title: '原因', key: 'reason' },
  { title: '加入时间', key: 'created_at', width: 180 },
  { title: '操作', key: 'actions', width: 80, sortable: false },
]

async function load() { loading.value = true; try { items.value = await api.get('/blacklist') } catch {} finally { loading.value = false } }
async function create() {
  if (!form.value.user_id) return
  try {
    await api.post('/blacklist', form.value)
    dialog.value = false
    form.value = { user_id: 0, username: '', reason: '' }
    load()
  } catch {}
}
async function del(user_id) {
  if (!confirm(`确认从集群黑名单移除 ${user_id}？`)) return
  try { await api.delete(`/blacklist/${user_id}`); load() } catch {}
}
onMounted(load)
</script>
