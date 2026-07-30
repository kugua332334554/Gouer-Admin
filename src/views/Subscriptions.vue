<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h4">订阅管理</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">添加</v-btn>
    </div>
    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" items-per-page="30">
        <template #item.expires_at="{ value }">
          <v-chip :color="new Date(value) > new Date() ? 'success' : 'error'" size="small">{{ new Date(value).toLocaleString('zh-CN') }}</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="del(item.id)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="400">
      <v-card :title="isEdit ? '编辑订阅' : '添加订阅'">
        <v-card-text>
          <v-text-field label="群组ID" v-model.number="form.chat_id" type="number" density="compact" hide-details />
          <v-select label="功能" v-model="form.feature" :items="features" density="compact" hide-details class="mt-2" />
          <template v-if="isEdit">
            <v-text-field label="过期时间" v-model="form.expires_at" density="compact" hide-details class="mt-2" hint="YYYY-MM-DD HH:MM:SS" persistent-hint />
          </template>
          <template v-else>
            <v-text-field label="天数" v-model.number="form.days" type="number" density="compact" hide-details class="mt-2" />
          </template>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="dialog=false">取消</v-btn><v-btn color="primary" @click="save" :loading="saving">{{ isEdit?'更新':'创建' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; import api from '@/api'
const items=ref([]); const loading=ref(false); const dialog=ref(false); const saving=ref(false); const isEdit=ref(false)
const form=ref({ id:0, chat_id:0, feature:'ai', days:30, expires_at:'' })
const features=[{title:'AI审核',value:'ai'},{title:'名片',value:'card'}]
const headers=[{title:'ID',key:'id',width:50},{title:'群组',key:'chat_id',width:140},{title:'功能',key:'feature',width:80},{title:'过期时间',key:'expires_at',width:200},{title:'',key:'actions',width:90,sortable:false}]

async function load(){loading.value=true;try{items.value=await api.get('/subscriptions')}catch{}finally{loading.value=false}}
function resetForm(){form.value={id:0,chat_id:0,feature:'ai',days:30,expires_at:''}}
function openAdd(){resetForm();isEdit.value=false;dialog.value=true}
function openEdit(item){form.value={...item,days:30};isEdit.value=true;dialog.value=true}
async function save(){saving.value=true;try{if(isEdit.value){const{id,days,...d}=form.value;await api.put(`/subscriptions/${id}`,d)}else{await api.post('/subscriptions',form.value)};dialog.value=false;load()}catch{}finally{saving.value=false}}
async function del(id){try{await api.delete(`/subscriptions/${id}`);load()}catch{}}
onMounted(load)
</script>
