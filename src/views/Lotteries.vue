<template>
  <div>
    <div class="d-flex align-center mb-4" style="gap:12px">
      <h2 class="text-h4">抽奖管理</h2>
      <v-spacer />
      <v-autocomplete v-model="filterChatId" :items="groups" item-title="label" item-value="chat_id" label="按群组筛选" prepend-inner-icon="mdi-account-group" density="compact" hide-details clearable style="max-width:300px" @update:model-value="load" />
    </div>
    <v-card>
      <v-data-table :headers="headers" :items="filtered" :loading="loading" items-per-page="30">
        <template #item.chat_id="{ value }"><code>{{ value }}</code></template>
        <template #item.status="{ value }">
          <v-chip :color="value==='active'?'success':value==='completed'?'info':'error'" size="small">{{ {active:'进行中',completed:'已完成',cancelled:'已取消'}[value]||value }}</v-chip>
        </template>
        <template #item.draw_time="{ value }">{{ value ? new Date(value).toLocaleString('zh-CN') : '人数触发' }}</template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'; import api from '@/api'
const items=ref([]); const groups=ref([]); const loading=ref(false); const filterChatId=ref(null)
const headers=[{title:'ID',key:'id',width:50},{title:'群组',key:'chat_id',width:140},{title:'标题',key:'title'},{title:'类型',key:'type',width:70},{title:'奖品',key:'prize_description'},{title:'中奖',key:'winner_count',width:60},{title:'状态',key:'status',width:80},{title:'开奖时间',key:'draw_time',width:160}]
const filtered=computed(()=>filterChatId.value?items.value.filter(i=>i.chat_id==filterChatId.value):items.value)
async function loadGroups(){try{groups.value=(await api.get('/groups')).map(g=>({chat_id:g.chat_id,label:`[${g.chat_id}] ${g.title}`}))}catch{}}
async function load(){loading.value=true;try{items.value=await api.get('/lotteries')}catch{}finally{loading.value=false}}
onMounted(()=>{loadGroups();load()})
</script>
