<template>
  <div>
    <div class="d-flex align-center flex-wrap mb-4" style="gap:12px">
      <h2 class="text-h4">积分商城</h2>
      <v-spacer />
      <v-autocomplete v-model="filterChatId" :items="groups" item-title="label" item-value="chat_id"
        label="按群组筛选" prepend-inner-icon="mdi-account-group" density="compact" hide-details clearable
        style="max-width:300px" @update:model-value="load" />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">添加</v-btn>
    </div>

    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" items-per-page="30">
        <template #item.chat_id="{ value }"><code>{{ value }}</code></template>
        <template #item.name="{ value }">
          <span class="font-weight-bold">{{ value }}</span>
        </template>
        <template #item.points_price="{ value }">
          <v-chip size="small" color="warning" variant="tonal">{{ value }} 分</v-chip>
        </template>
        <template #item.stock="{ value }">
          <span v-if="value < 0" class="text-success">无限</span>
          <span v-else :class="value === 0 ? 'text-error' : ''">{{ value }}</span>
        </template>
        <template #item.status="{ value }">
          <v-chip :color="value ? 'success' : 'error'" size="small">{{ value ? '上架' : '下架' }}</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="del(item.id)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card :title="isEdit ? '编辑商品' : '添加商品'">
        <v-card-text>
          <v-text-field label="群组ID" v-model.number="form.chat_id" type="number" density="compact" hide-details />
          <v-text-field label="商品名称" v-model="form.name" density="compact" hide-details class="mt-2" />
          <v-row class="mt-2">
            <v-col cols="6"><v-text-field label="积分价格" v-model.number="form.points_price" type="number" density="compact" hide-details /></v-col>
            <v-col cols="6"><v-text-field label="库存 (-1=无限)" v-model.number="form.stock" type="number" density="compact" hide-details /></v-col>
          </v-row>
          <v-textarea label="描述" v-model="form.description" rows="2" density="compact" hide-details class="mt-2" />
          <v-select label="发货方式" v-model="form.delivery_mode" :items="[
            { title: '手动发货', value: 'manual' },
            { title: '自动发卡', value: 'auto' }
          ]" density="compact" hide-details class="mt-2" />
          <v-textarea v-if="form.delivery_mode === 'auto'"
            label="卡密（一行一个）" v-model="form.card_data" rows="5" density="compact" hide-details class="mt-2"
            hint="每行一个卡密，购买后自动发送给用户" persistent-hint />
          <v-switch v-if="isEdit" :label="form.status ? '上架' : '下架'" v-model="form.status" density="compact" hide-details class="mt-1" />
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
const form = ref({ id: 0, chat_id: 0, name: '', points_price: 0, stock: -1, description: '', delivery_mode: 'manual', card_data: '', status: true })

const headers = [
  { title: 'ID', key: 'id', width: 50 },
  { title: '群组', key: 'chat_id', width: 140 },
  { title: '名称', key: 'name', width: 140 },
  { title: '价格', key: 'points_price', width: 80 },
  { title: '库存', key: 'stock', width: 70 },
  { title: '描述', key: 'description' },
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
  try { items.value = await api.get('/shop', { params }) } catch {} finally { loading.value = false }
}
function resetForm() {
  form.value = { id: 0, chat_id: 0, name: '', points_price: 0, stock: -1, description: '', delivery_mode: 'manual', card_data: '', status: true }
}
function openAdd() { resetForm(); isEdit.value = false; dialog.value = true }
function openEdit(item) {
  form.value = { ...item }
  form.value.status = !!item.status  // force boolean from API int
  if (!form.value.delivery_mode) form.value.delivery_mode = 'manual'
  isEdit.value = true; dialog.value = true
}
async function save() {
  saving.value = true
  try {
    if (isEdit.value) {
      const { id, chat_id, created_at, ...data } = form.value
      await api.put(`/shop/${id}`, data)
    } else {
      await api.post('/shop', form.value)
    }
    dialog.value = false; load()
  } catch (e) {} finally { saving.value = false }
}
async function del(id) { try { await api.delete(`/shop/${id}`); load() } catch {} }
onMounted(() => { loadGroups(); load() })
</script>
