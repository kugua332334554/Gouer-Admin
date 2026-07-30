<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h4">群组管理</h2>
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="搜索群组..."
        hide-details
        density="compact"
        style="max-width: 320px"
        clearable
        @keyup.enter="loadGroups"
        @click:clear="search = ''; loadGroups()"
      />
    </div>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="groups"
        :loading="loading"
        :search="search"
        items-per-page="20"
      >
        <template #item.chat_id="{ value }">
          <code>{{ value }}</code>
        </template>
        <template #item.title="{ value, item }">
          <v-btn
            variant="text"
            color="primary"
            :to="`/groups/${item.chat_id}`"
          >
            {{ value || '(未命名)' }}
          </v-btn>
        </template>
        <template #item.username="{ value }">
          <span v-if="value">@{{ value }}</span>
          <span v-else class="text-disabled">—</span>
        </template>
        <template #item.created_at="{ value }">
          {{ formatDate(value) }}
        </template>
        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-cog"
            variant="text"
            size="small"
            color="primary"
            :to="`/groups/${item.chat_id}`"
            title="管理群组"
          />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/api'

const search = ref('')
const groups = ref([])
const loading = ref(false)

const headers = [
  { title: '群组 ID', key: 'chat_id', width: 180 },
  { title: '名称', key: 'title' },
  { title: '用户名', key: 'username', width: 180 },
  { title: '类型', key: 'type', width: 120 },
  { title: '添加时间', key: 'created_at', width: 180 },
  { title: '操作', key: 'actions', width: 80, sortable: false },
]

async function loadGroups() {
  loading.value = true
  try {
    const res = await api.get('/groups', { params: { search: search.value } })
    groups.value = res
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('zh-CN')
}

let timer
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(loadGroups, 300)
})

onMounted(loadGroups)
</script>
