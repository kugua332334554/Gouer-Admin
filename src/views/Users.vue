<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h4">用户管理</h2>
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="搜索用户 ID / 用户名 / 昵称"
        hide-details density="compact"
        style="max-width: 360px" clearable
        @keyup.enter="loadUsers"
      />
    </div>
    <v-card>
      <v-data-table :headers="headers" :items="users" :loading="loading" :search="search" items-per-page="20">
        <template #item.user_id="{ value }"><code>{{ value }}</code></template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="editUser(item)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card :title="`编辑用户: ${editForm.user_id}`">
        <v-card-text>
          <v-text-field label="用户名" v-model="editForm.username" density="compact" hide-details />
          <v-text-field label="昵称" v-model="editForm.first_name" density="compact" hide-details class="mt-3" />
          <v-text-field label="Bio" v-model="editForm.bio" density="compact" hide-details class="mt-3" />
          <v-text-field label="时区" v-model="editForm.timezone" density="compact" hide-details class="mt-3" />
          <v-select label="语言" v-model="editForm.language" :items="langs" density="compact" hide-details class="mt-3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog=false">取消</v-btn>
          <v-btn color="primary" @click="saveUser">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/api'

const search = ref('')
const users = ref([])
const loading = ref(false)
const dialog = ref(false)
const editForm = ref({})
const langs = [{ title: '中文', value: 'zh' }, { title: '繁體', value: 'zh-TW' }, { title: 'English', value: 'en' }]

const headers = [
  { title: '用户ID', key: 'user_id', width: 180 },
  { title: '用户名', key: 'username' },
  { title: '昵称', key: 'first_name' },
  { title: '时区', key: 'timezone', width: 180 },
  { title: '语言', key: 'language', width: 80 },
  { title: '操作', key: 'actions', width: 80, sortable: false },
]

async function loadUsers() {
  loading.value = true
  try { users.value = await api.get('/users', { params: { search: search.value } }) } catch (e) {} finally { loading.value = false }
}

function editUser(item) {
  editForm.value = { ...item }
  dialog.value = true
}

async function saveUser() {
  try {
    await api.put(`/users/${editForm.value.user_id}`, {
      username: editForm.value.username,
      first_name: editForm.value.first_name,
      bio: editForm.value.bio,
      timezone: editForm.value.timezone,
      language: editForm.value.language,
    })
    dialog.value = false
    loadUsers()
  } catch (e) {}
}

let timer
watch(search, () => { clearTimeout(timer); timer = setTimeout(loadUsers, 300) })
onMounted(loadUsers)
</script>
