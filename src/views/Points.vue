<template>
  <div>
    <h2 class="text-h4 mb-4">积分管理</h2>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-autocomplete
          v-model="chatId" :items="groups" item-title="label" item-value="chat_id"
          label="选择群组" prepend-inner-icon="mdi-account-group" density="compact"
          hide-details clearable @update:model-value="onGroupChange"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="userSearch" prepend-inner-icon="mdi-magnify" label="搜索用户 ID"
          density="compact" hide-details clearable @keyup.enter="load"
        />
      </v-col>
      <v-col cols="12" sm="4" class="d-flex align-center">
        <v-btn color="primary" variant="outlined" @click="load" :loading="loading">查询</v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" items-per-page="20">
        <template #item.chat_id="{ value }"><code>{{ value }}</code></template>
        <template #item.user_id="{ value }"><code>{{ value }}</code></template>
        <template #item.points="{ value }">
          <v-chip :color="value > 100 ? 'warning' : value > 50 ? 'success' : ''" size="small">{{ value }}</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit Points Dialog -->
    <v-dialog v-model="dialog" max-width="340">
      <v-card title="修改积分">
        <v-card-text>
          <p class="mb-2">群组: <code>{{ edit.chat_id }}</code> 用户: <code>{{ edit.user_id }}</code></p>
          <v-text-field v-model.number="edit.points" label="积分" type="number" density="compact" hide-details />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="dialog=false">取消</v-btn><v-btn color="primary" @click="savePoints" :loading="saving">保存</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/api'

const groups = ref([])
const chatId = ref(null)
const userSearch = ref('')
const items = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const edit = ref({ chat_id: 0, user_id: 0, points: 0 })

const headers = [
  { title: '群组ID', key: 'chat_id', width: 180 },
  { title: '用户ID', key: 'user_id', width: 180 },
  { title: '积分', key: 'points', width: 100 },
  { title: '', key: 'actions', width: 60, sortable: false },
]

async function loadGroups() {
  try { groups.value = (await api.get('/groups')).map(g => ({ chat_id: g.chat_id, label: `[${g.chat_id}] ${g.title}` })) } catch {}
}

async function load() {
  loading.value = true
  const params = {}
  if (chatId.value) params.chat_id = chatId.value
  if (userSearch.value) params.user_id = userSearch.value
  try { items.value = await api.get('/points', { params }) } catch {} finally { loading.value = false }
}

function onGroupChange() { userSearch.value = ''; load() }
function openEdit(item) { edit.value = { ...item }; dialog.value = true }
async function savePoints() {
  saving.value = true
  try { await api.put(`/points/${edit.value.chat_id}/${edit.value.user_id}`, { points: edit.value.points }); dialog.value = false; load() } catch {} finally { saving.value = false }
}

onMounted(() => { loadGroups(); load() })
</script>
