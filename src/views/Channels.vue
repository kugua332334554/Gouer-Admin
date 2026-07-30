<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h4">频道管理</h2>
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索频道..." hide-details density="compact" style="max-width: 320px" clearable @keyup.enter="load" />
    </div>
    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" items-per-page="20">
        <template #item.chat_id="{ value }"><code>{{ value }}</code></template>
        <template #item.username="{ value }"><span v-if="value">@{{ value }}</span><span v-else class="text-disabled">—</span></template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="editItem(item)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="400">
      <v-card title="编辑频道">
        <v-card-text>
          <v-text-field label="名称" v-model="edit.title" density="compact" hide-details class="mb-2" />
          <v-text-field label="用户名" v-model="edit.username" density="compact" hide-details />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="dialog=false">取消</v-btn><v-btn color="primary" @click="save" :loading="saving">保存</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'; import api from '@/api'
const search = ref(''); const items = ref([]); const loading = ref(false); const dialog = ref(false); const saving = ref(false)
const edit = ref({ chat_id: 0, title: '', username: '' })
const headers = [
  { title: '频道ID', key: 'chat_id', width: 180 }, { title: '名称', key: 'title' },
  { title: '用户名', key: 'username', width: 180 }, { title: '添加时间', key: 'created_at', width: 180 },
  { title: '', key: 'actions', width: 60, sortable: false },
]
async function load() { loading.value = true; try { items.value = await api.get('/channels', { params: { search: search.value } }) } catch {} finally { loading.value = false } }
function editItem(item) { edit.value = { ...item }; dialog.value = true }
async function save() { saving.value = true; try { await api.put(`/channels/${edit.value.chat_id}`, { title: edit.value.title, username: edit.value.username }); dialog.value = false; load() } catch {} finally { saving.value = false } }
let timer; watch(search, () => { clearTimeout(timer); timer = setTimeout(load, 300) })
onMounted(load)
</script>
