<template>
  <div>
    <div class="d-flex align-center flex-wrap mb-4" style="gap:12px">
      <h2 class="text-h4">违禁词管理</h2>
      <v-spacer />
      <v-autocomplete v-model="filterChatId" :items="groups" item-title="label" item-value="chat_id" label="按群组筛选" prepend-inner-icon="mdi-account-group" density="compact" hide-details clearable style="max-width:300px" @update:model-value="load" />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">添加</v-btn>
    </div>
    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" items-per-page="30">
        <template #item.chat_id="{ value }"><code>{{ value }}</code></template>
        <template #item.status="{ value }"><v-chip :color="value ? 'success' : 'error'" size="small">{{ value ? '启用' : '停用' }}</v-chip></template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="del(item.id)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card :title="isEdit ? '编辑违禁词' : '添加违禁词'">
        <v-card-text>
          <v-text-field label="群组ID" v-model.number="form.chat_id" type="number" density="compact" hide-details />
          <v-text-field label="违禁词" v-model="form.word" density="compact" hide-details class="mt-2" />
          <v-select label="惩罚" v-model="form.penalty" :items="penalties" density="compact" hide-details class="mt-2" />
          <v-text-field v-if="form.penalty==='mute'" label="禁言时长(秒)" v-model.number="form.mute_duration" type="number" density="compact" hide-details class="mt-2" />
          <v-switch v-if="isEdit" label="启用" v-model="form.status" density="compact" hide-details class="mt-1" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="dialog=false">取消</v-btn><v-btn color="primary" @click="save" :loading="saving">{{ isEdit ? '更新' : '创建' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; import api from '@/api'
const items=ref([]); const groups=ref([]); const loading=ref(false); const dialog=ref(false); const saving=ref(false); const isEdit=ref(false); const filterChatId=ref(null)
const form=ref({ id:0, chat_id:0, word:'', penalty:'delete', mute_duration:3600, status:true })
const penalties=[{title:'删除',value:'delete'},{title:'禁言',value:'mute'},{title:'踢出',value:'kick'},{title:'封禁',value:'ban'}]
const headers=[{title:'ID',key:'id',width:50},{title:'群组',key:'chat_id',width:140},{title:'违禁词',key:'word'},{title:'惩罚',key:'penalty',width:70},{title:'状态',key:'status',width:70},{title:'',key:'actions',width:90,sortable:false}]

async function loadGroups(){try{groups.value=(await api.get('/groups')).map(g=>({chat_id:g.chat_id,label:`[${g.chat_id}] ${g.title}`}))}catch{}}
async function load(){loading.value=true;const p={};if(filterChatId.value)p.chat_id=filterChatId.value;try{items.value=await api.get('/weijinci',{params:p})}catch{}finally{loading.value=false}}
function resetForm(){form.value={id:0,chat_id:0,word:'',penalty:'delete',mute_duration:3600,status:true}}
function openAdd(){resetForm();isEdit.value=false;dialog.value=true}
function openEdit(item){form.value={...item};isEdit.value=true;dialog.value=true}
async function save(){saving.value=true;try{if(isEdit.value){const{id,chat_id,...d}=form.value;await api.put(`/weijinci/${id}`,d)}else{await api.post('/weijinci',form.value)};dialog.value=false;load()}catch{}finally{saving.value=false}}
async function del(id){try{await api.delete(`/weijinci/${id}`);load()}catch{}}
onMounted(()=>{loadGroups();load()})
</script>
