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
        <template #item.conditions="{ item }">
          <span v-if="!hasConditions(item)" class="text-disabled">无条件</span>
          <v-tooltip v-else location="bottom" max-width="360">
            <template #activator="{ props }">
              <v-chip v-bind="props" size="x-small" variant="tonal" color="info">有条件</v-chip>
            </template>
            <pre class="text-caption" style="white-space:pre-wrap">{{ conditionsSummary(item) }}</pre>
          </v-tooltip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- 编辑抽奖对话框 -->
    <v-dialog v-model="dialog" max-width="640">
      <v-card :title="isEdit ? `编辑抽奖 #${form.id}` : '创建抽奖'">
        <v-card-text>
          <v-row>
            <v-col cols="8"><v-text-field label="标题" v-model="form.title" density="compact" hide-details /></v-col>
            <v-col cols="4"><v-text-field label="中奖人数" v-model.number="form.winner_count" type="number" density="compact" hide-details /></v-col>
          </v-row>
          <v-select label="状态" v-model="form.status" :items="statusOptions" density="compact" hide-details class="mt-2" />
          <v-textarea label="奖品（每行一个）" v-model="prizeLines" rows="3" density="compact" hide-details class="mt-2" />

          <v-divider class="my-4" />
          <div class="text-subtitle-2 font-weight-bold mb-1">参加条件</div>
          <v-textarea label="必须加入的频道/群组（每行一个 @用户名 或 数字ID）" v-model="joinLines" rows="3" density="compact" hide-details hint="支持多个" />
          <v-text-field label="名字必须包含" v-model="form.name_contains" density="compact" hide-details class="mt-2" />
          <v-text-field label="简介必须包含" v-model="form.bio_contains" density="compact" hide-details class="mt-2" />
          <v-switch label="必须有头像" v-model="form.need_photo" density="compact" hide-details class="mt-1" />
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
import { ref, computed, onMounted } from 'vue'; import api from '@/api'
const items=ref([]); const groups=ref([]); const loading=ref(false); const filterChatId=ref(null)
const dialog=ref(false); const saving=ref(false); const isEdit=ref(false)
const prizeLines=ref(''); const joinLines=ref('')
const form=ref({ id:0, title:'', winner_count:1, status:'active', name_contains:'', bio_contains:'', need_photo:false })
const statusOptions=[{title:'进行中',value:'active'},{title:'已完成',value:'completed'},{title:'已取消',value:'cancelled'}]

const headers=[
  {title:'ID',key:'id',width:50},{title:'群组',key:'chat_id',width:140},{title:'标题',key:'title'},
  {title:'类型',key:'type',width:70},{title:'奖品',key:'prize_description'},{title:'中奖',key:'winner_count',width:60},
  {title:'条件',key:'conditions',width:80},{title:'状态',key:'status',width:80},
  {title:'开奖时间',key:'draw_time',width:160},{title:'',key:'actions',width:70,sortable:false},
]
const filtered=computed(()=>filterChatId.value?items.value.filter(i=>i.chat_id==filterChatId.value):items.value)

function hasConditions(i){ return !!(i.join_chats || i.name_contains || i.bio_contains || i.need_photo) }
function conditionsSummary(i){
  const parts=[]
  if(i.join_chats){ try{ const arr=JSON.parse(i.join_chats); parts.push(`加入：${arr.join('、')}`) }catch{ parts.push(`加入：${i.join_chats}`) } }
  if(i.name_contains) parts.push(`名字含「${i.name_contains}」`)
  if(i.bio_contains) parts.push(`简介含「${i.bio_contains}」`)
  if(i.need_photo) parts.push('需要头像')
  return parts.join('\n') || '无条件'
}
function parseLines(s){ return s.split('\n').map(x=>x.trim()).filter(Boolean) }
function toJoinJson(s){
  const arr=parseLines(s)
  return arr.length?JSON.stringify(arr):''
}

async function loadGroups(){try{groups.value=(await api.get('/groups')).map(g=>({chat_id:g.chat_id,label:`[${g.chat_id}] ${g.title}`}))}catch{}}
async function load(){loading.value=true;try{items.value=await api.get('/lotteries')}catch{}finally{loading.value=false}}

function openEdit(item){
  form.value={ id:item.id, title:item.title, winner_count:item.winner_count, status:item.status,
    name_contains:item.name_contains||'', bio_contains:item.bio_contains||'', need_photo:!!item.need_photo }
  let prizes=[]
  try{ prizes=JSON.parse(item.prize_description||'[]') }catch{}
  prizeLines.value=Array.isArray(prizes)?prizes.join('\n'):(item.prize_description||'')
  let joins=[]
  try{ joins=JSON.parse(item.join_chats||'[]') }catch{}
  joinLines.value=Array.isArray(joins)?joins.join('\n'):(item.join_chats||'')
  isEdit.value=true; dialog.value=true
}

async function save(){
  saving.value=true
  try{
    const data={
      title:form.value.title,
      winner_count:form.value.winner_count,
      status:form.value.status,
      prize_description:JSON.stringify(parseLines(prizeLines.value)),
      join_chats:toJoinJson(joinLines.value),
      name_contains:form.value.name_contains,
      bio_contains:form.value.bio_contains,
      need_photo:form.value.need_photo,
    }
    await api.patch(`/lotteries/${form.value.id}`, data)
    dialog.value=false; load()
  }catch{}finally{saving.value=false}
}

onMounted(()=>{loadGroups();load()})
</script>