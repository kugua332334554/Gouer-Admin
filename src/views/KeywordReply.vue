<template>
  <div>
    <div class="d-flex align-center flex-wrap mb-4" style="gap:12px">
      <h2 class="text-h4">关键词回复</h2>
      <v-spacer />
      <v-autocomplete v-model="filterChatId" :items="groups" item-title="label" item-value="chat_id"
        label="按群组筛选" prepend-inner-icon="mdi-account-group" density="compact" hide-details clearable
        style="max-width:300px" @update:model-value="load" />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">添加</v-btn>
    </div>

    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" items-per-page="30">
        <template #item.chat_id="{ value }"><code>{{ value }}</code></template>
        <template #item.keyword="{ value }">
          <v-tooltip location="bottom" max-width="400" v-if="value">
            <template #activator="{ props }">
              <span v-bind="props" class="text-truncate d-inline-block" style="max-width:180px">{{ value }}</span>
            </template>
            <code class="text-caption">{{ value }}</code>
          </v-tooltip>
          <span v-else class="text-disabled">—</span>
        </template>
        <template #item.match_mode="{ value }">
          <v-chip :color="value === 'exact' ? 'warning' : 'info'" size="small" variant="tonal">
            {{ value === 'exact' ? '完全' : '包含' }}
          </v-chip>
        </template>
        <template #item.reply_text="{ value }">
          <v-tooltip location="bottom" max-width="500" v-if="value">
            <template #activator="{ props }">
              <span v-bind="props" class="text-truncate d-inline-block" style="max-width:200px">{{ value }}</span>
            </template>
            <pre class="text-caption" style="white-space:pre-wrap;word-break:break-all;max-height:200px;overflow:auto">{{ value }}</pre>
          </v-tooltip>
          <span v-else class="text-disabled">—</span>
        </template>
        <template #item.buttons_text="{ value }">
          <v-tooltip location="bottom" max-width="360" v-if="value">
            <template #activator="{ props }">
              <v-chip v-bind="props" size="x-small" variant="tonal" color="info">有按钮</v-chip>
            </template>
            <code class="text-caption">{{ value }}</code>
          </v-tooltip>
          <span v-else class="text-disabled">—</span>
        </template>
        <template #item.status="{ value }">
          <v-chip :color="value ? 'success' : 'error'" size="small">{{ value ? '启用' : '停用' }}</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="del(item.id)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card :title="isEdit ? '编辑关键词回复' : '添加关键词回复'">
        <v-card-text>
          <v-text-field label="群组ID" v-model.number="form.chat_id" type="number" density="compact" hide-details />
          <v-text-field label="关键词（多个用 | 分隔）" v-model="form.keyword" density="compact" hide-details class="mt-2"
            hint="如：你好|hello|hi" persistent-hint />
          <v-select label="匹配模式" v-model="form.match_mode" :items="[
            { title: '包含匹配', value: 'contains' },
            { title: '完全匹配', value: 'exact' }
          ]" density="compact" hide-details class="mt-2" />
          <v-textarea label="回复文字" v-model="form.reply_text" rows="3" density="compact" hide-details class="mt-2"
            hint="支持 HTML 和会员表情" persistent-hint />
          <v-text-field label="按钮 JSON" v-model="form.buttons_text" density="compact" hide-details class="mt-2" />
          <v-switch v-if="isEdit" :label="form.status ? '启用' : '停用'" v-model="form.status" density="compact" hide-details class="mt-1" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog=false">取消</v-btn>
          <v-btn color="primary" @click="save" :loading="saving">{{ isEdit ? '更新' : '创建' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const items = ref([]); const groups = ref([])
const loading = ref(false); const dialog = ref(false); const saving = ref(false); const isEdit = ref(false)
const filterChatId = ref(null)
const form = ref({ id: 0, chat_id: 0, keyword: '', match_mode: 'contains', reply_text: '', buttons_text: '', status: true })

const headers = [
  { title: 'ID', key: 'id', width: 50 },
  { title: '群组', key: 'chat_id', width: 140 },
  { title: '关键词', key: 'keyword', width: 180 },
  { title: '匹配', key: 'match_mode', width: 70 },
  { title: '回复内容', key: 'reply_text' },
  { title: '按钮', key: 'buttons_text', width: 70 },
  { title: '状态', key: 'status', width: 70 },
  { title: '', key: 'actions', width: 90, sortable: false },
]

async function loadGroups() {
  try { groups.value = (await api.get('/groups')).map(g => ({ chat_id: g.chat_id, label: `[${g.chat_id}] ${g.title}` })) } catch {}
}

async function load() {
  loading.value = true
  const params = {}
  if (filterChatId.value) params.chat_id = filterChatId.value
  try { items.value = await api.get('/keyword-reply', { params }) } catch {} finally { loading.value = false }
}

function resetForm() {
  form.value = { id: 0, chat_id: 0, keyword: '', match_mode: 'contains', reply_text: '', buttons_text: '', status: true }
}
function openAdd() { resetForm(); isEdit.value = false; dialog.value = true }
function openEdit(item) {
  form.value = { ...item }
  form.value.status = !!item.status
  if (!form.value.match_mode) form.value.match_mode = 'contains'
  isEdit.value = true; dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (isEdit.value) {
      const { id, chat_id, created_at, ...data } = form.value
      await api.put(`/keyword-reply/${id}`, data)
    } else {
      await api.post('/keyword-reply', form.value)
    }
    dialog.value = false; load()
  } catch (e) {} finally { saving.value = false }
}

async function del(id) { try { await api.delete(`/keyword-reply/${id}`); load() } catch {} }

onMounted(() => { loadGroups(); load() })
</script>
