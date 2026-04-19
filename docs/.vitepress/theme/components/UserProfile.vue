<template>
  <div class="user-profile-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载用户信息...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <button @click="loadUserData" class="retry-btn">重试</button>
    </div>
    
    <!-- 已登录状态 -->
    <div v-else-if="user" class="user-profile">
      <!-- 基本信息卡片 -->
      <div class="profile-card main-card">
        <div class="avatar-section">
          <div class="user-avatar-large">
            {{ user.email?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>
        <div class="info-section">
  <h2 class="user-name">{{ userData?.username || user.email.split('@')[0] }}</h2>
  <p class="user-email-sub">{{ user.email }}</p>
          <div class="user-meta">
            <span class="meta-item">
              <span class="meta-label">UID:</span>
              <span class="meta-value">{{ formattedUID }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">注册时间:</span>
              <span class="meta-value">{{ formatDate(user.created_at) }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">最后登录:</span>
              <span class="meta-value">{{ formatDate(user.last_sign_in_at) }}</span>
            </span>
          </div>
        </div>
      </div>
      
      <!-- 游戏数据统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎲</div>
          <div class="stat-content">
            <div class="stat-value">{{ userData?.total_pulls || 0 }}</div>
            <div class="stat-label">总抽卡数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔴</div>
          <div class="stat-content">
            <div class="stat-value">{{ userData?.ur_count || 0 }}</div>
            <div class="stat-label">UR 获得</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🟡</div>
          <div class="stat-content">
            <div class="stat-value">{{ userData?.ssr_count || 0 }}</div>
            <div class="stat-label">SSR 获得</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-value">{{ formatPlayTime(userData?.play_time_seconds) }}</div>
            <div class="stat-label">游戏时长</div>
          </div>
        </div>
      </div>
      
      <!-- 快速操作 -->
      <div class="quick-actions">
        <h3>快速操作</h3>
        <div class="action-buttons">
          <a href="/gacha-analyzer" class="action-btn primary">
            <span class="btn-icon">📊</span>
            <span class="btn-text">查看抽卡分析</span>
          </a>
          <a href="/download" class="action-btn">
            <span class="btn-icon">⬇️</span>
            <span class="btn-text">下载游戏</span>
          </a>
        </div>
      </div>
    </div>
    
    <!-- 未登录状态 -->
    <div v-else class="guest-state">
      <div class="guest-icon">👤</div>
      <h3>游客模式</h3>
      <p>登录后可以同步游戏数据、查看抽卡记录等</p>
      <button @click="emitLogin" class="login-prompt-btn">立即登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  showLoginModal: Function
})
// UID 补全为7位
const formattedUID = computed(() => {
  const uid = userData.value?.uid
  if (!uid && uid !== 0) return '未知'
  return String(uid).padStart(7, '0')
})
const user = ref(null)
const userData = ref(null)
const loading = ref(true)
const error = ref('')

let supabase = null

// 初始化 Supabase
async function initSupabase() {
  if (typeof window === 'undefined') return
  
  const { createClient } = await import('@supabase/supabase-js')
  const SUPABASE_URL = 'https://ornvxqtykdmafokmwwnr.supabase.co'
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTAzNDAsImV4cCI6MjA5MTUyNjM0MH0.1zFgq_EC6JHmMTzRPDW11JKl7ltBzdjH2EMXvioJPqI'
  
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
}

// 加载用户数据
async function loadUserData() {
  loading.value = true
  error.value = ''
  
  try {
    await initSupabase()
    if (!supabase) return
    
    // 获取当前会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    
    if (session) {
      user.value = session.user
      
      // 初始化用户数据对象
      const combinedData = {
        uid: null,
        play_time_seconds: 0,
        total_pulls: 0,
        ur_count: 0,
        ssr_count: 0
      }
      
      // 1. 从 users 表获取 UID 和用户名
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('uid, username')
        .eq('id', session.user.id)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        console.warn('获取用户数据失败:', userError)
      }

      if (userRecord) {
        combinedData.uid = userRecord.uid
        combinedData.username = userRecord.username || session.user.email.split('@')[0]
      }
      // 2. 从 user_data 表获取游戏时长
      const { data: gameData, error: gameError } = await supabase
        .from('user_data')
        .select('play_time_seconds')
        .eq('user_id', session.user.id)
        .single()
      
      if (gameError && gameError.code !== 'PGRST116') {
        console.warn('获取游戏数据失败:', gameError)
      }
      
      if (gameData) {
        combinedData.play_time_seconds = gameData.play_time_seconds || 0
      }
      
      // 3. 从 gacha_history 表统计抽卡数据
      const { data: gachaRecords, error: gachaError } = await supabase
        .from('gacha_history')
        .select('rarity')
        .eq('user_id', session.user.id)
      
      if (gachaError) {
        console.warn('获取抽卡记录失败:', gachaError)
      }
      
      if (gachaRecords) {
        combinedData.total_pulls = gachaRecords.length
        combinedData.ur_count = gachaRecords.filter(r => r.rarity === 'UR').length
        combinedData.ssr_count = gachaRecords.filter(r => r.rarity === 'SSR').length
      }
      
      userData.value = combinedData
    }
    else{
      user.value = null
      userData.value = null
    }
  } catch (err) {
    console.error('加载用户数据失败:', err)
    error.value = '加载用户信息失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化游戏时长
function formatPlayTime(seconds) {
  if (!seconds) return '0小时'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分`
  }
  return `${minutes}分钟`
}

// 触发登录
function emitLogin() {
  // 触发自定义事件，让 UserAuth 组件打开登录弹窗
  window.dispatchEvent(new CustomEvent('show-login-modal'))
}

onMounted(async () => {
  // 先初始化 Supabase
  await initSupabase()
  
  // 尝试刷新会话，确保会话有效
  if (supabase) {
    const { error } = await supabase.auth.refreshSession()
    if (error) {
      console.log('会话刷新失败:', error)
      // 如果刷新失败，尝试登出
      await supabase.auth.signOut()
    }
  }
  
  loadUserData()
})
</script>

<style scoped>
.user-name {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: var(--vp-c-text-1);
}

.user-email-sub {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.user-profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--vp-c-danger);
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 20px;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* 主卡片 */
.profile-card {
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.main-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-section {
  position: relative;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
}

.user-status-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid var(--vp-c-bg-soft);
}

.info-section {
  flex: 1;
}

.user-email {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: var(--vp-c-text-1);
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  font-size: 13px;
}

.meta-label {
  color: var(--vp-c-text-2);
  margin-right: 4px;
}

.meta-value {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 28px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.stat-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* 快速操作 */
.quick-actions {
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  padding: 24px;
}

.quick-actions h3 {
  margin: 0 0 16px 0;
  color: var(--vp-c-text-1);
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  font-size: 18px;
}

/* 游客状态 */
.guest-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
}

.guest-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.guest-state h3 {
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
}

.guest-state p {
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
}

.login-prompt-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.login-prompt-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 600px) {
  .main-card {
    flex-direction: column;
    text-align: center;
  }
  
  .user-meta {
    justify-content: center;
  }
}
</style>
