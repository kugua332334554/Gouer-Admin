<template>
  <div>
    <div class="d-flex align-center flex-wrap mb-4" style="gap:12px">
      <h2 class="text-h4">快速发布</h2>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">添加</v-btn>
    </div>
    <v-card>
      <v-data-table :headers="headers" :items="items" :loading="loading" items-per-page="30">
        <template #item.status="{ value }"><v-chip :color="value ? 'success' : 'error'" size="small">{{ value ? '启用' : '停用' }}</v-chip></template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="del(item.id)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card :title="isEdit ? '编辑快发' : '添加快发'">
        <v-card-text>
          <v-text-field label="名称" v-model="form.name" density="compact" hide-details />
          <v-text-field label="关键词" v-model="form.keyword" density="compact" hide-details class="mt-2" />
          <v-textarea label="内容" v-model="form.content_text" rows="3" density="compact" hide-details class="mt-2" />
          <v-text-field label="按钮 JSON" v-model="form.buttons_text" density="compact" hide-details class="mt-2" />
          <v-switch v-if="isEdit" label="启用" v-model="form.status" density="compact" hide-details class="mt-1" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="dialog=false">取消</v-btn><v-btn color="primary" @click="save" :loading="saving">{{ isEdit?'更新':'创建' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; import api from '@/api'
const items=ref([]); const loading=ref(false); const dialog=ref(false); const saving=ref(false); const isEdit=ref(false)
const form=ref({ id:0, creator_id:0, name:'', keyword:'', content_text:'', buttons_text:'', status:true })
const headers=[{title:'ID',key:'id',width:50},{title:'创建者',key:'creator_id',width:140},{title:'名称',key:'name'},{title:'关键词',key:'keyword',width:100},{title:'内容',key:'content_text'},{title:'状态',key:'status',width:70},{title:'',key:'actions',width:90,sortable:false}]

async function load(){loading.value=true;try{items.value=await api.get('/kuaisufabu')}catch{}finally{loading.value=false}}
function resetForm(){form.value={id:0,creator_id:0,name:'',keyword:'',content_text:'',buttons_text:'',status:true}}
function openAdd(){resetForm();isEdit.value=false;dialog.value=true}
function openEdit(item){form.value={...item};isEdit.value=true;dialog.value=true}
async function save(){saving.value=true;try{if(isEdit.value){const{id,creator_id,...d}=form.value;await api.put(`/kuaisufabu/${id}`,d)}else{await api.post('/kuaisufabu',form.value)};dialog.value=false;load()}catch{}finally{saving.value=false}}
async function del(id){try{await api.delete(`/kuaisufabu/${id}`);load()}catch{}}
onMounted(load)
</script>
