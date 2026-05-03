<template>
  <div class="oauth-consent-page" :class="{ 'dark-theme': isDark }">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载授权信息...</p>
    </div>
    
    <!-- 授权内容 -->
    <div v-else class="consent-container">
      <div class="header">
        <div class="app-icon">🎮</div>
        <h1>婵之云游戏</h1>
        <p>QJOL Studios 开发</p>
      </div>
      
      <div class="content">
        <!-- 错误提示 -->
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <!-- 用户信息 -->
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-details">
            <h3>{{ userName }}</h3>
            <p>{{ userEmail }}</p>
          </div>
        </div>
        
        <!-- 权限列表 -->
        <div class="permissions">
          <h3>请求权限</h3>
          
          <div class="permission-item">
            <div class="permission-icon">👤</div>
            <div class="permission-text">
              <h4>基本信息</h4>
              <p>读取您的用户ID、用户名和头像</p>
            </div>
          </div>
          
          <div class="permission-item">
            <div class="permission-icon">☁️</div>
            <div class="permission-text">
              <h4>游戏数据同步</h4>
              <p>保存和读取游戏进度、抽卡记录等数据</p>
            </div>
          </div>
          
          <div class="permission-item">
            <div class="permission-icon">💰</div>
            <div class="permission-text">
              <h4>货币信息</h4>
              <p>读取和管理游戏内货币</p>
            </div>
          </div>
        </div>
        
        <!-- 安全提示 -->
        <div class="security-notice">
          <p>
            <strong>安全提示：</strong>婵之云不会获取您的密码。您随时可以取消授权。
          </p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="actions">
          <button class="btn btn-secondary" @click="denyAccess">拒绝</button>
          <button class="btn btn-primary" @click="approveAccess">同意授权</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ornvxqtykdmafokmwwnr.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTAzNDAsImV4cCI6MjA5MTUyNjM0MH0.1zFgq_EC6JHmMTzRPDW11JKl7ltBzdjH2EMXvioJPqI'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const loading = ref(true)
const error = ref('')
const currentUser = ref(null)
const isDark = ref(false)

// 检测系统主题
function checkTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = prefersDark
  
  // 监听主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDark.value = e.matches
  })
}

// URL参数
const urlParams = new URLSearchParams(window.location.search)
const clientId = urlParams.get('client_id')
const redirectUri = urlParams.get('redirect_uri')
const state = urlParams.get('state')
const codeChallenge = urlParams.get('code_challenge')

// 计算属性
const userName = computed(() => {
  if (!currentUser.value) return '加载中...'
  return currentUser.value.user_metadata?.username || currentUser.value.email?.split('@')[0] || '用户'
})

const userEmail = computed(() => {
  if (!currentUser.value) return '请稍候'
  return currentUser.value.email || ''
})

const userInitial = computed(() => {
  const name = userName.value
  return name.charAt(0).toUpperCase()
})

onMounted(async () => {
  // 检测主题
  checkTheme()
  
  try {
    // 验证必要参数
    if (!clientId || !redirectUri || !state) {
      error.value = '缺少必要的授权参数'
      loading.value = false
      return
    }
    
    // 获取当前会话
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // 未登录，重定向到登录页
      const currentUrl = encodeURIComponent(window.location.href)
      window.location.href = `/user?redirect=${currentUrl}`
      return
    }
    
    currentUser.value = session.user
    loading.value = false
    
  } catch (err) {
    console.error('初始化错误:', err)
    error.value = '加载失败，请刷新页面重试'
    loading.value = false
  }
})

async function approveAccess() {
  try {
    // 生成授权码
    const authCode = generateRandomString(32)
    
    // 存储授权码信息
    const { error: insertError } = await supabase.from('oauth_codes').insert({
      code: authCode,
      user_id: currentUser.value.id,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      state: state,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    })
    
    if (insertError) {
      error.value = '授权失败，请重试'
      return
    }
    
    // 重定向回游戏，携带授权码
    const callbackUrl = new URL(redirectUri)
    callbackUrl.searchParams.set('code', authCode)
    callbackUrl.searchParams.set('state', state)
    
    window.location.href = callbackUrl.toString()
    
  } catch (err) {
    console.error('授权错误:', err)
    error.value = '授权过程中发生错误'
  }
}

function denyAccess() {
  // 用户拒绝，返回错误
  const callbackUrl = new URL(redirectUri)
  callbackUrl.searchParams.set('error', 'access_denied')
  callbackUrl.searchParams.set('error_description', '用户拒绝了授权请求')
  callbackUrl.searchParams.set('state', state)
  
  window.location.href = callbackUrl.toString()
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
</script>

<style scoped>
.oauth-consent-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--vp-c-bg);
  transition: background 0.3s ease;
}

.consent-container {
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.3);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  text-align: center;
  color: white;
}

.app-icon {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 40px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.header h1 {
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 600;
}

.header p {
  opacity: 0.9;
  font-size: 14px;
}

.content {
  padding: 30px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: var(--vp-c-bg);
  border-radius: 12px;
  margin-bottom: 25px;
  transition: background 0.3s ease;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.user-details h3 {
  font-size: 16px;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.user-details p {
  font-size: 13px;
  color: var(--vp-c-text-2);
  transition: color 0.3s ease;
}

.permissions {
  margin-bottom: 25px;
}

.permissions h3 {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.permission-item:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.permission-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.permission-text h4 {
  font-size: 14px;
  color: var(--vp-c-text-1);
  margin-bottom: 3px;
}

.permission-text p {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.security-notice {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 15px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 25px;
}

.security-notice p {
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-secondary:hover {
  background: var(--vp-c-bg-soft);
}

.loading-state {
  text-align: center;
  padding: 40px;
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.3);
  transition: background 0.3s ease;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
}
</style>
