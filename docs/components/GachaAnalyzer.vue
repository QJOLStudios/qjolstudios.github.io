<template>
  <div class="gacha-analyzer">
    <!-- 输入区域 -->
    <div class="input-section">
      <h3>📋 粘贴抽卡记录</h3>
      <textarea
        v-model="jsonInput"
        placeholder="请将从游戏中复制的 JSON 数据粘贴到这里..."
        class="json-input"
        rows="8"
      ></textarea>
      <div class="button-group">
        <button @click="parseData" class="btn-primary">🔍 分析数据</button>
        <button @click="clearData" class="btn-secondary">🗑️ 清空</button>
        <button @click="loadExample" class="btn-secondary">📖 加载示例</button>
        <button @click="loadFromCloud" class="btn-cloud" :disabled="cloudLoading">
          <span v-if="cloudLoading">⏳ 加载中...</span>
          <span v-else>☁️ 从云端获取</span>
        </button>
      </div>
      <div v-if="cloudError" class="cloud-error">
        ⚠️ {{ cloudError }}
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>

    <!-- 分析结果 -->
    <div v-if="data && !error" class="results-section">
      <!-- 概览卡片 -->
      <div class="overview-cards">
        <div class="stat-card total">
          <div class="stat-icon">🎲</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.summary.total_pulls }}</div>
            <div class="stat-label">总抽卡数</div>
          </div>
        </div>
        <div class="stat-card ur">
          <div class="stat-icon">🔴</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.summary.ur_count }}</div>
            <div class="stat-label">UR (传说)</div>
          </div>
        </div>
        <div class="stat-card ssr">
          <div class="stat-icon">🟡</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.summary.ssr_count }}</div>
            <div class="stat-label">SSR (稀有)</div>
          </div>
        </div>
        <div class="stat-card sr">
          <div class="stat-icon">🔵</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.summary.sr_count }}</div>
            <div class="stat-label">SR (普通)</div>
          </div>
        </div>
      </div>

      <!-- 概率统计 -->
      <div class="probability-section">
        <h3>📊 概率统计</h3>
        <div class="probability-grid">
          <div class="prob-item">
            <span class="prob-label">实际 UR 率:</span>
            <span class="prob-value ur-rate">{{ actualURRate }}%</span>
            <span class="prob-compare">(理论: 0.8%)</span>
          </div>
          <div class="prob-item">
            <span class="prob-label">实际 SSR 率:</span>
            <span class="prob-value ssr-rate">{{ actualSSRRate }}%</span>
            <span class="prob-compare">(理论: 12%)</span>
          </div>
          <div class="prob-item">
            <span class="prob-label">实际 SR 率:</span>
            <span class="prob-value sr-rate">{{ actualSRRate }}%</span>
            <span class="prob-compare">(理论: 87.2%)</span>
          </div>
          <div class="prob-item">
            <span class="prob-label">当前保底:</span>
            <span class="prob-value pity">{{ data.summary.current_pity }}/60</span>
          </div>
        </div>
      </div>

      <!-- 保底分析 -->
      <div class="pity-analysis">
        <h3>🎯 保底分析</h3>
        <div class="pity-stats">
          <div class="pity-item">
            <span>平均出 UR 抽数:</span>
            <span class="highlight">{{ avgURPity }} 抽</span>
          </div>
          <div class="pity-item">
            <span>最长保底记录:</span>
            <span class="highlight">{{ maxPity }} 抽</span>
          </div>
          <div class="pity-item">
            <span>最短出 UR 抽数:</span>
            <span class="highlight">{{ minURPity }} 抽</span>
          </div>
        </div>
      </div>

      <!-- 出货散点图 -->
      <div class="timeline-section">
        <h3>📈 UR 出货散点图</h3>
        <div class="scatter-chart">
          <!-- Y轴标签 -->
          <div class="y-axis-label">抽数</div>
          
          <!-- 散点图区域 -->
          <div class="scatter-plot">
            <div
              v-for="(pull, index) in urPulls"
              :key="index"
              class="scatter-point"
              :style="getScatterPointStyle(pull, index)"
              :title="`${formatTime(pull.timestamp)}: ${getIntervalAt(index)} 抽`"
            >
              <div class="point-dot"></div>
              <div class="point-label">{{ getIntervalAt(index) }}</div>
            </div>
            
            <!-- 坐标轴 -->
            <div class="axis x-axis"></div>
            <div class="axis y-axis"></div>
            
            <!-- X轴刻度 -->
            <div
              v-for="(pull, index) in urPulls"
              :key="'x-'+index"
              class="x-tick"
              :style="{ left: getXPosition(pull) + '%' }"
            >
              {{ formatTimeShort(pull.timestamp) }}
            </div>
          </div>
          
          <!-- X轴标签 -->
          <div class="x-axis-label">出货时间</div>
        </div>
        <div class="timeline-legend">
          <span>🔴 每个点代表一次 UR 出货，横轴为出货时间，纵轴为花费抽数</span>
        </div>
      </div>

      <!-- 详细记录表格 -->
      <div class="records-section">
        <h3>📝 详细记录</h3>
        <div class="table-container">
          <table class="records-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>时间</th>
                <th>稀有度</th>
                <th>保底前</th>
                <th>保底后</th>
                <th>累计抽数</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(record, index) in paginatedRecords"
                :key="index"
                :class="getRarityClass(record.rarity_code)"
              >
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td>{{ formatTime(record.timestamp) }}</td>
                <td>
                  <span :class="['rarity-badge', getRarityClass(record.rarity_code)]">
                    {{ record.rarity }}
                  </span>
                </td>
                <td>{{ record.pity_before }}</td>
                <td>{{ record.pity_after }}</td>
                <td>{{ record.total_pulls }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 分页 -->
        <div class="pagination">
          <button
            @click="currentPage--"
            :disabled="currentPage <= 1"
            class="btn-page"
          >
            ← 上一页
          </button>
          <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="btn-page"
          >
            下一页 →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const jsonInput = ref('')
const data = ref(null)
const error = ref('')
const currentPage = ref(1)
const pageSize = 20
const cloudLoading = ref(false)
const cloudError = ref('')

let supabase = null

// 初始化 Supabase
async function initSupabase() {
  if (typeof window === 'undefined') return null
  
  const { createClient } = await import('@supabase/supabase-js')
  const SUPABASE_URL = 'https://ornvxqtykdmafokmwwnr.supabase.co'
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTAzNDAsImV4cCI6MjA5MTUyNjM0MH0.1zFgq_EC6JHmMTzRPDW11JKl7ltBzdjH2EMXvioJPqI'
  
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  return supabase
}

// 从云端获取抽卡记录
async function loadFromCloud() {
  cloudLoading.value = true
  cloudError.value = ''
  error.value = ''
  
  try {
    const client = await initSupabase()
    if (!client) {
      cloudError.value = '客户端初始化失败'
      return
    }
    
    // 检查登录状态
    const { data: { session }, error: sessionError } = await client.auth.getSession()
    
    if (sessionError) throw sessionError
    
    if (!session) {
      cloudError.value = '请先登录后再获取云端数据'
      return
    }
    
    // 从 Supabase 获取抽卡记录 - 使用 gacha_history 表
    const { data: records, error: fetchError } = await client
      .from('gacha_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
    
    if (fetchError) throw fetchError
    
    if (!records || records.length === 0) {
      cloudError.value = '暂无云端抽卡记录，请先在游戏中抽卡并同步数据'
      return
    }
    
    // 转换为分析器需要的格式
    const cloudData = transformCloudData(records)
    
    // 设置数据并分析
    jsonInput.value = JSON.stringify(cloudData, null, 2)
    data.value = cloudData
    currentPage.value = 1
    
  } catch (err) {
    console.error('获取云端数据失败:', err)
    cloudError.value = '获取云端数据失败: ' + (err.message || '未知错误')
  } finally {
    cloudLoading.value = false
  }
}

// 转换云端数据为分析器格式
function transformCloudData(records) {
  // 按时间排序
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  )
  
  // 计算统计数据
  let totalPulls = 0
  let urCount = 0
  let ssrCount = 0
  let srCount = 0
  let currentPity = 0
  
  const transformedRecords = sortedRecords.map((record, index) => {
    totalPulls++
    currentPity++
    
    // 根据稀有度统计
    const rarityCode = record.rarity === 'UR' ? 2 : (record.rarity === 'SSR' ? 1 : 0)
    const rarityName = record.rarity === 'UR' ? '传说' : (record.rarity === 'SSR' ? '稀有' : '普通')
    
    if (record.rarity === 'UR') {
      urCount++
      currentPity = 0
    } else if (record.rarity === 'SSR') {
      ssrCount++
    } else {
      srCount++
    }
    
    return {
      timestamp: record.created_at,
      rarity: rarityName,
      rarity_code: rarityCode,
      pity_before: record.pity_before,
      pity_after: record.pity_after,
      total_pulls: totalPulls
    }
  })
  
  return {
    export_time: new Date().toISOString(),
    game_version: 'cloud',
    summary: {
      total_pulls: totalPulls,
      ur_count: urCount,
      ssr_count: ssrCount,
      sr_count: srCount,
      current_pity: currentPity,
      ur_rate: totalPulls > 0 ? ((urCount / totalPulls) * 100).toFixed(2) : 0
    },
    records: transformedRecords
  }
}

// 示例数据
const exampleData = {
  "export_time": "2026-04-06T12:34:56",
  "game_version": "0.0.4-demo",
  "summary": {
    "total_pulls": 150,
    "ur_count": 3,
    "ssr_count": 18,
    "sr_count": 129,
    "current_pity": 15,
    "ur_rate": 2.0
  },
  "records": [
    {"timestamp": "2026-04-06T10:00:00", "rarity": "传说", "rarity_code": 2, "pity_before": 42, "pity_after": 43, "total_pulls": 43},
    {"timestamp": "2026-04-06T10:05:00", "rarity": "稀有", "rarity_code": 1, "pity_before": 5, "pity_after": 6, "total_pulls": 50},
    {"timestamp": "2026-04-06T10:10:00", "rarity": "传说", "rarity_code": 2, "pity_before": 38, "pity_after": 39, "total_pulls": 89},
    {"timestamp": "2026-04-06T10:15:00", "rarity": "普通", "rarity_code": 0, "pity_before": 20, "pity_after": 21, "total_pulls": 110},
    {"timestamp": "2026-04-06T10:20:00", "rarity": "传说", "rarity_code": 2, "pity_before": 35, "pity_after": 36, "total_pulls": 146}
  ]
}

const parseData = () => {
  error.value = ''
  try {
    if (!jsonInput.value.trim()) {
      error.value = '请输入 JSON 数据'
      return
    }
    data.value = JSON.parse(jsonInput.value)
    currentPage.value = 1
    
    // 验证数据格式
    if (!data.value.summary || !data.value.records) {
      error.value = '数据格式不正确，请检查是否复制了完整的 JSON'
      data.value = null
    }
  } catch (e) {
    error.value = 'JSON 解析失败: ' + e.message
    data.value = null
  }
}

const clearData = () => {
  jsonInput.value = ''
  data.value = null
  error.value = ''
  cloudError.value = ''
  currentPage.value = 1
}

const loadExample = () => {
  jsonInput.value = JSON.stringify(exampleData, null, 2)
  parseData()
}

// 计算属性
const actualURRate = computed(() => {
  if (!data.value) return 0
  return ((data.value.summary.ur_count / data.value.summary.total_pulls) * 100).toFixed(2)
})

const actualSSRRate = computed(() => {
  if (!data.value) return 0
  return ((data.value.summary.ssr_count / data.value.summary.total_pulls) * 100).toFixed(2)
})

const actualSRRate = computed(() => {
  if (!data.value) return 0
  return ((data.value.summary.sr_count / data.value.summary.total_pulls) * 100).toFixed(2)
})

const urPulls = computed(() => {
  if (!data.value) return []
  return data.value.records.filter(r => r.rarity_code === 2)
})

// 计算每次UR出货的间隔抽数
const urIntervals = computed(() => {
  if (!urPulls.value.length) return []
  
  const intervals = []
  let lastURTotalPulls = 0
  
  for (const pull of urPulls.value) {
    // 本次UR距离上次UR的间隔 = 当前累计抽数 - 上次UR的累计抽数
    const interval = pull.total_pulls - lastURTotalPulls
    intervals.push(interval)
    lastURTotalPulls = pull.total_pulls
  }
  
  return intervals
})
const maxInterval = computed(() => {
  if (!urIntervals.value.length) return 0
  return Math.max(...urIntervals.value)
})
// 获取第 index 次UR的间隔抽数
const getIntervalAt = (index) => {
  if (!urIntervals.value.length || index >= urIntervals.value.length) return 0
  return urIntervals.value[index]
}

// 获取时间范围
const timeRange = computed(() => {
  if (!urPulls.value.length) return { min: 0, max: 0 }
  const timestamps = urPulls.value.map(p => new Date(p.timestamp).getTime())
  return {
    min: Math.min(...timestamps),
    max: Math.max(...timestamps)
  }
})

// 获取散点位置样式
const getScatterPointStyle = (pull, index) => {
  const interval = getIntervalAt(index)
  const timestamp = new Date(pull.timestamp).getTime()
  const xPos = timeRange.value.max === timeRange.value.min 
    ? 50 
    : ((timestamp - timeRange.value.min) / (timeRange.value.max - timeRange.value.min) * 90 + 5)
  const yPos = maxInterval.value === 0 
    ? 50 
    : (interval / maxInterval.value * 80 + 5)
  
  return {
    left: xPos + '%',
    bottom: yPos + '%'
  }
}

// 获取X轴位置
const getXPosition = (pull) => {
  const timestamp = new Date(pull.timestamp).getTime()
  return timeRange.value.max === timeRange.value.min 
    ? 50 
    : ((timestamp - timeRange.value.min) / (timeRange.value.max - timeRange.value.min) * 90 + 5)
}

// 格式化时间（短格式）
const formatTimeShort = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric'
  })
}
const avgURPity = computed(() => {
  if (!urIntervals.value.length) return 'N/A'
  const totalInterval = urIntervals.value.reduce((sum, interval) => sum + interval, 0)
  return (totalInterval / urIntervals.value.length).toFixed(1)
})

const maxPity = computed(() => {
  if (!urIntervals.value.length) return 'N/A'
  return Math.max(...urIntervals.value)
})

const minURPity = computed(() => {
  if (!urIntervals.value.length) return 'N/A'
  return Math.min(...urIntervals.value)
})

const paginatedRecords = computed(() => {
  if (!data.value) return []
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return data.value.records.slice(start, end)
})

const totalPages = computed(() => {
  if (!data.value) return 0
  return Math.ceil(data.value.records.length / pageSize)
})

// 辅助函数
const getRarityClass = (code) => {
  const classes = ['sr', 'ssr', 'ur']
  return classes[code] || 'sr'
}

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.gacha-analyzer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 输入区域 */
.input-section {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.input-section h3 {
  margin: 0 0 16px 0;
  color: var(--vp-c-text-1);
}

.json-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
}

.json-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-page, .btn-cloud {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--vp-c-brand);
  color: white;
}

.btn-primary:hover {
  background: var(--vp-c-brand-dark);
}

.btn-secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.btn-secondary:hover {
  background: var(--vp-c-gray-light-4);
}

.btn-cloud {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-cloud:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-cloud:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cloud-error {
  margin-top: 12px;
  padding: 10px 16px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 6px;
  font-size: 14px;
}

/* 错误提示 */
.error-message {
  background: #fee;
  color: #c33;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border-left: 4px solid #c33;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.total { border-left: 4px solid #888; }
.stat-card.ur { border-left: 4px solid #f44; }
.stat-card.ssr { border-left: 4px solid #fa0; }
.stat-card.sr { border-left: 4px solid #48f; }

.stat-icon {
  font-size: 32px;
  margin-right: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.stat-label {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

/* 概率统计 */
.probability-section, .pity-analysis, .timeline-section, .records-section {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.probability-section h3, .pity-analysis h3, .timeline-section h3, .records-section h3 {
  margin: 0 0 20px 0;
  color: var(--vp-c-text-1);
}

.probability-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.prob-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--vp-c-bg);
  border-radius: 8px;
}

.prob-label {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.prob-value {
  font-size: 20px;
  font-weight: bold;
}

.prob-value.ur-rate { color: #f44; }
.prob-value.ssr-rate { color: #fa0; }
.prob-value.sr-rate { color: #48f; }
.prob-value.pity { color: var(--vp-c-brand); }

.prob-compare {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* 保底分析 */
.pity-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.pity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--vp-c-bg);
  border-radius: 8px;
}

.highlight {
  font-size: 20px;
  font-weight: bold;
  color: var(--vp-c-brand);
}

/* 时间线 */
/* 散点图 */
.scatter-chart {
  position: relative;
  height: 300px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 40px 60px 40px 60px;
  display: flex;
  align-items: center;
}

.y-axis-label {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: rotate(-90deg) translateX(50%);
  transform-origin: center;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.x-axis-label {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.scatter-plot {
  position: relative;
  width: 100%;
  height: 100%;
  border-left: 2px solid var(--vp-c-text-2);
  border-bottom: 2px solid var(--vp-c-text-2);
}

.scatter-point {
  position: absolute;
  transform: translate(-50%, 50%);
  text-align: center;
}

.point-dot {
  width: 12px;
  height: 12px;
  background: #f44;
  border-radius: 50%;
  margin: 0 auto 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.point-dot:hover {
  transform: scale(1.8);
}

.point-label {
  font-size: 11px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.axis {
  position: absolute;
  background: var(--vp-c-text-2);
}

.x-axis {
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
}

.y-axis {
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
}

.timeline-legend {
  text-align: center;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.x-tick {
  position: absolute;
  bottom: -25px;
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
/* 表格 */
.table-container {
  overflow-x: auto;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.records-table th,
.records-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
}

.records-table th {
  background: var(--vp-c-bg);
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.records-table tr:hover {
  background: var(--vp-c-bg-mute);
}

.rarity-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.rarity-badge.ur {
  background: #fee;
  color: #c33;
}

.rarity-badge.ssr {
  background: #ffe;
  color: #a60;
}

.rarity-badge.sr {
  background: #eef;
  color: #36c;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.btn-page {
  padding: 8px 16px;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--vp-c-text-2);
}

/* 响应式 */
@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .probability-grid {
    grid-template-columns: 1fr;
  }
  
  .pity-stats {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary, .btn-cloud {
    width: 100%;
  }
}
</style>
