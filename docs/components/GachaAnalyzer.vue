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

      <!-- 出货时间线 -->
      <div class="timeline-section">
        <h3>📈 出货时间线</h3>
        <div class="timeline-chart">
          <div
            v-for="(pull, index) in urPulls"
            :key="index"
            class="timeline-item"
            :style="{ left: (index / (urPulls.length - 1 || 1) * 100) + '%' }"
          >
            <div class="timeline-dot" :title="`第 ${pull.total_pulls} 抽 - ${pull.timestamp}`"></div>
            <div class="timeline-label">{{ pull.total_pulls }}</div>
          </div>
        </div>
        <div class="timeline-legend">
          <span>🔴 每个点代表一次 UR 出货</span>
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

const avgURPity = computed(() => {
  if (!urPulls.value.length) return 'N/A'
  const totalPity = urPulls.value.reduce((sum, pull) => sum + pull.pity_before, 0)
  return (totalPity / urPulls.value.length).toFixed(1)
})

const maxPity = computed(() => {
  if (!urPulls.value.length) return 'N/A'
  return Math.max(...urPulls.value.map(p => p.pity_before))
})

const minURPity = computed(() => {
  if (!urPulls.value.length) return 'N/A'
  return Math.min(...urPulls.value.map(p => p.pity_before))
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
}

.btn-primary, .btn-secondary, .btn-page {
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
.timeline-chart {
  position: relative;
  height: 80px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  margin-bottom: 12px;
}

.timeline-item {
  position: absolute;
  transform: translateX(-50%);
  text-align: center;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  background: #f44;
  border-radius: 50%;
  margin: 0 auto 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.timeline-dot:hover {
  transform: scale(1.5);
}

.timeline-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.timeline-legend {
  text-align: center;
  font-size: 14px;
  color: var(--vp-c-text-2);
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
}
</style>
