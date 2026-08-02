<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h4">抽签管理</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">添加签文</v-btn>
    </div>
    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" items-per-page="20">
        <template #item.poem="{ value }">
          <div class="text-truncate" style="max-width: 380px">{{ value }}</div>
        </template>
        <template #item.reading="{ value }">
          <div class="text-truncate" style="max-width: 380px">{{ value }}</div>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="del(item.id)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card :title="editing ? '编辑签文' : '添加签文'">
        <v-card-text>
          <v-text-field label="签名 (sign)" v-model="form.sign" density="compact" hide-details />
          <v-text-field label="签诗 (poem)" v-model="form.poem" density="compact" hide-details class="mt-3" />
          <v-text-field label="解签 (reading)" v-model="form.reading" density="compact" hide-details class="mt-3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog=false">取消</v-btn>
          <v-btn color="primary" @click="save">保存</v-btn>
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
const editing = ref(false)
const form = ref({ id: 0, sign: '', poem: '', reading: '' })

const headers = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '签', key: 'sign', width: 100 },
  { title: '签诗', key: 'poem' },
  { title: '解签', key: 'reading' },
  { title: '创建时间', key: 'created_at', width: 180 },
  { title: '操作', key: 'actions', width: 120, sortable: false },
]

async function load() { loading.value = true; try { items.value = await api.get('/fortunes') } catch {} finally { loading.value = false } }
function openAdd() { editing.value = false; form.value = { id: 0, sign: '', poem: '', reading: '' }; dialog.value = true }
function openEdit(item) { editing.value = true; form.value = { id: item.id, sign: item.sign, poem: item.poem, reading: item.reading || '' }; dialog.value = true }
async function save() {
  if (!form.value.sign || !form.value.poem) return
  try {
    if (editing.value) { await api.put(`/fortunes/${form.value.id}`, form.value) }
    else { await api.post('/fortunes', form.value) }
    dialog.value = false
    load()
  } catch {}
}
async function del(id) {
  if (!confirm(`确认删除签文 #${id}？`)) return
  try { await api.delete(`/fortunes/${id}`); load() } catch {}
}
onMounted(load)
</script>
