<template>
  <div>
    <h2 class="text-h4 mb-4"><v-icon size="x-large" class="mr-2">mdi-database</v-icon>数据库管理工具</h2>

    <v-row>
      <!-- Table List Sidebar -->
      <v-col cols="12" md="3">
        <v-card class="mb-4">
          <v-card-text class="pb-0">
            <v-autocomplete v-model="selectedDb" :items="databases" label="选择数据库" density="compact" hide-details
              prepend-inner-icon="mdi-database" @update:model-value="onDbChange" />
          </v-card-text>
          <v-divider class="mt-2" />
          <v-list density="compact" nav>
            <v-list-item
              v-for="t in tables"
              :key="t"
              :title="t"
              :value="t"
              :active="selectedTable === t"
              @click="selectTable(t)"
            >
              <template #prepend>
                <v-icon size="small">mdi-table</v-icon>
              </template>
              <template #append>
                <v-chip size="x-small" variant="tonal">{{ tableSizes[t] || '?' }}</v-chip>
              </template>
            </v-list-item>
          </v-list>
          <v-card-actions>
            <v-btn block variant="text" size="small" @click="loadTables" :loading="loading">刷新列表</v-btn>
          </v-card-actions>
        </v-card>

        <!-- SQL Query Console -->
        <v-card title="SQL 查询" class="mb-4">
          <v-card-text>
            <v-textarea
              v-model="sqlQuery"
              label="SELECT / SHOW / DESCRIBE"
              rows="4"
              density="compact"
              hide-details
              placeholder="SELECT * FROM users LIMIT 10"
            />
            <v-btn block color="primary" size="small" class="mt-2" @click="runQuery" :loading="queryRunning">
              执行查询
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Table Data -->
      <v-col cols="12" md="9">
        <v-card v-if="!selectedTable && !queryResult">
          <v-card-text class="text-center pa-12 text-medium-emphasis">
            <v-icon size="64" class="mb-4">mdi-database-search</v-icon>
            <div class="text-h5">选择数据表或执行 SQL 查询</div>
          </v-card-text>
        </v-card>

        <!-- Query Result -->
        <v-card v-if="queryResult" class="mb-4" title="查询结果">
          <template #append>
            <v-chip size="small" variant="tonal">{{ queryResult.count }} 行</v-chip>
            <v-btn icon="mdi-close" variant="text" size="small" @click="queryResult = null" />
          </template>
          <v-card-text class="pa-0" style="overflow-x: auto">
            <v-data-table
              :headers="queryResult.columns.map(c => ({ title: c, key: c }))"
              :items="queryResult.rows"
              density="compact"
              items-per-page="50"
            />
          </v-card-text>
        </v-card>

        <!-- Table Structure -->
        <v-card v-if="selectedTable && tableColumns.length" class="mb-4">
          <v-card-title>
            {{ selectedTable }}
            <v-spacer />
            <v-chip size="small" variant="tonal" class="mr-2">{{ tableColumns.length }} 列</v-chip>
            <v-chip size="small" color="primary" variant="tonal">共 {{ totalRows }} 行</v-chip>
          </v-card-title>

          <!-- Columns -->
          <v-card-text class="pb-0">
            <div class="text-subtitle-2 mb-2">表结构</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>字段</th><th>类型</th><th>可空</th><th>键</th><th>默认值</th><th>额外</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="col in tableColumns" :key="col.field">
                  <td><code>{{ col.field }}</code></td>
                  <td>{{ col.type }}</td>
                  <td>{{ col.null }}</td>
                  <td>{{ col.key }}</td>
                  <td>{{ col.default }}</td>
                  <td>{{ col.extra }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>

          <v-divider class="mt-4" />

          <!-- Data Rows -->
          <v-card-text class="pa-0 pt-2" style="overflow-x: auto">
            <div class="d-flex align-center px-4 mb-2">
              <div class="text-subtitle-2">数据</div>
              <v-spacer />
              <v-pagination
                v-model="page"
                :length="pageLength"
                density="compact"
                @update:model-value="onPageChange"
                size="small"
              />
            </div>
            <v-data-table
              :headers="dataHeaders"
              :items="tableRows"
              density="compact"
              :loading="loadingData"
              items-per-page="50"
              hide-default-footer
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/api'

const databases = ref([])
const selectedDb = ref('')
const tables = ref([])
const tableSizes = ref({})
const selectedTable = ref('')
const tableColumns = ref([])
const tableRows = ref([])
const totalRows = ref(0)
const page = ref(1)
const loading = ref(false)
const loadingData = ref(false)
const sqlQuery = ref('')
const queryRunning = ref(false)
const queryResult = ref(null)

const pageLength = computed(() => Math.ceil(totalRows.value / 50) || 1)

const dataHeaders = computed(() =>
  tableColumns.value.map(c => ({ title: c.field, key: c.field, width: 160 }))
)

let _requestId = 0

async function loadDatabases() {
  try { databases.value = await api.get('/db/databases') } catch {}
}

function onDbChange() {
  selectedTable.value = ''; tableColumns.value = []; tableRows.value = []; queryResult.value = null
  loadTables()
}

async function loadTables() {
  loading.value = true
  try {
    const params = selectedDb.value ? { db: selectedDb.value } : {}
    const res = await api.get('/db/tables', { params })
    tables.value = (res.tables || []).sort()
    tableSizes.value = {}
    for (const t of tables.value) {
      try {
        const info = await api.get(`/db/tables/${t}`, { params })
        tableSizes.value[t] = info.row_count
      } catch {}
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function selectTable(table) {
  selectedTable.value = table
  queryResult.value = null
  try {
    const params = selectedDb.value ? { db: selectedDb.value } : {}
    const info = await api.get(`/db/tables/${table}`, { params })
    tableColumns.value = info.columns
    totalRows.value = info.row_count
    // 如果 page 已是 1 则手动触发加载（v-model 不会触发事件），否则设 page=1 由事件触发
    if (page.value === 1) {
      await loadTableData(1)
    } else {
      page.value = 1
    }
  } catch (e) {
    console.error(e)
  }
}

function onPageChange(newPage) {
  loadTableData(newPage)
}

async function loadTableData(newPage) {
  if (newPage !== undefined) page.value = newPage
  const reqId = ++_requestId
  loadingData.value = true
  try {
    const params = { page: page.value, limit: 50 }
    if (selectedDb.value) params.db = selectedDb.value
    const res = await api.get(`/db/tables/${selectedTable.value}/rows`, { params })
    // 丢弃过期请求，防止竞态条件导致数据错乱
    if (reqId !== _requestId) return
    tableRows.value = res.rows
    totalRows.value = res.total   // 同步真实行数，确保翻页 length 准确
  } catch (e) {
    console.error(e)
  } finally {
    if (reqId === _requestId) loadingData.value = false
  }
}

async function runQuery() {
  if (!sqlQuery.value.trim()) return
  queryRunning.value = true
  selectedTable.value = ''
  try {
    queryResult.value = await api.post('/db/query', {
      sql: sqlQuery.value,
      limit: 100,
    })
  } catch (e) {
    queryResult.value = {
      columns: ['Error'],
      rows: [{ Error: e.message }],
      count: 1,
    }
  } finally {
    queryRunning.value = false
  }
}

loadDatabases()
loadTables()
</script>
