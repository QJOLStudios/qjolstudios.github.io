<template>
  <div class="oauth-consent-page" :class="{ 'dark-theme': isDark }">
    <!-- 未登录-内联登录（默认显示，不依赖加载状态） -->
    <div v-if="showLoginForm" class="consent-container">
      <div class="header">
        <div class="app-icon">🎮</div>
        <h1>婵之云游戏</h1>
        <p>QJOL Studios 开发</p>
      </div>
      <div class="content">
        <div class="login-prompt">
          <h3>请先登录</h3>
          <p>登录后即可授权游戏访问您的数据</p>
        </div>
        <div v-if="loginError" class="error-message">{{ loginError }}</div>
        <div class="form-group">
          <input v-model="loginEmail" type="email" placeholder="邮箱地址" @keyup.enter="handleLogin" />
        </div>
        <div class="form-group">
          <input v-model="loginPassword" type="password" placeholder="密码" @keyup.enter="handleLogin" />
        </div>
        <button class="btn btn-primary login-submit-btn" @click="handleLogin" :disabled="loginLoading">
          {{ loginLoading ? '登录中...' : '登录' }}
        </button>
        <p class="login-hint">登录即表示同意婵之云使用您的数据</p>
      </div>
    </div>

    <!-- 已登录-授权内容 -->
    <div v-else class="consent-container">
      <div class="header">
        <div class="app-icon">🎮</div>
        <h1>婵之云游戏</h1>
        <p>QJOL Studios 开发</p>
      </div>

      <div class="content">
        <!-- 错误提示 -->
        <div v-if="error" class="error-message">{{ error }}</div>

        <!-- 成功提示 - 显示授权码 -->
        <div v-if="success" class="success-state">
          <div class="success-icon">✅</div>
          <h3>授权成功！</h3>
          <p>请将以下授权码复制到游戏中：</p>

          <div class="auth-code-box">
            <code>{{ authCode }}</code>
            <button @click="copyCode" class="copy-btn">📋 复制</button>
          </div>

          <p class="hint">授权码有效期：10分钟</p>
          <p class="hint">复制后返回游戏，在登录界面粘贴授权码</p>
        </div>

        <!-- 用户信息 -->
        <div v-if="!success" class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-details">
            <h3>{{ userName }}</h3>
            <p>{{ userEmail }}</p>
          </div>
        </div>

        <!-- 权限列表 -->
        <div v-if="!success" class="permissions">
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
        <div v-if="!success" class="security-notice">
          <p>
            <strong>安全提示：</strong>婵之云不会获取您的密码。您随时可以取消授权。
          </p>
        </div>

        <!-- 操作按钮 -->
        <div v-if="!success" class="actions">
          <button class="btn btn-secondary" @click="denyAccess">拒绝</button>
          <button class="btn btn-primary" @click="approveAccess">同意授权</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const SUPABASE_URL = 'https://ornvxqtykdmafokmwwnr.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTAzNDAsImV4cCI6MjA5MTUyNjM0MH0.1zFgq_EC6JHmMTzRPDW11JKl7ltBzdjH2EMXvioJPqI'

let supabase = null

const error = ref('')
const success = ref(false)
const authCode = ref('')
const currentUser = ref(null)
const isDark = ref(false)

// 内联登录状态（默认显示登录表单，不依赖异步加载）
const showLoginForm = ref(true)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)

// URL参数（在onMounted中初始化，避免SSR错误）
const clientId = ref('')
const redirectUri = ref('')
const state = ref('')
const codeChallenge = ref('')

// 检测系统主题
function checkTheme() {
  if (typeof window === 'undefined') return

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = prefersDark

  // 监听主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDark.value = e.matches
  })
}

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
  // 登录表单默认已显示（showLoginForm = true），无需等待
  // 异步检查会话，如果已登录则切换到授权面板

  // 仅在浏览器环境初始化 Supabase（避免 SSR 水合失败）
  if (typeof window === 'undefined') return

  try {
    // 动态加载 Supabase（如果失败不影响登录表单显示）
    let createClient
    try {
      const mod = await import('@supabase/supabase-js')
      createClient = mod.createClient
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    } catch (importErr) {
      console.error('加载 Supabase SDK 失败:', importErr)
      loginError.value = '登录服务加载失败，请刷新页面重试'
      return
    }

    // 解析URL参数
    const urlParams = new URLSearchParams(window.location.search)
    clientId.value = urlParams.get('client_id') || ''
    redirectUri.value = urlParams.get('redirect_uri') || ''
    state.value = urlParams.get('state') || ''
    codeChallenge.value = urlParams.get('code_challenge') || ''

    // 检测主题
    checkTheme()

    // 验证必要参数
    if (!clientId.value || !redirectUri.value || !state.value) {
      error.value = '缺少必要的授权参数'
      return
    }

    // 获取当前会话（带重试，最多等 3 秒）
    let session = null
    let sessionError = null
    const maxWaitMs = 3000
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitMs) {
      const result = await supabase.auth.getSession()
      session = result.data.session
      sessionError = result.error

      if (session || sessionError) break

      console.log('会话为空，尝试刷新...')
      await supabase.auth.refreshSession()
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    if (sessionError) {
      console.error('获取会话失败:', sessionError)
      error.value = '获取登录状态失败'
      return
    }

    if (!session) {
      // 无会话 → 保持显示登录表单
      showLoginForm.value = true
      return
    }

    if (!session.user || !session.user.id) {
      error.value = '用户信息不完整，请重新登录'
      return
    }

    // 已登录，切换到授权面板
    currentUser.value = session.user
    showLoginForm.value = false

    // 监听登录状态变化
    supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN' && newSession) {
        currentUser.value = newSession.user
        showLoginForm.value = false
      } else if (event === 'SIGNED_OUT') {
        currentUser.value = null
        showLoginForm.value = true
      }
    })

  } catch (err) {
    console.error('初始化错误:', err)
    error.value = '加载失败，请刷新页面重试'
  }
})

// 内联登录
async function handleLogin() {
  if (!supabase) {
    loginError.value = '客户端正在初始化，请稍后再试'
    return
  }

  if (!loginEmail.value || !loginPassword.value) {
    loginError.value = '请输入邮箱和密码'
    return
  }

  loginLoading.value = true
  loginError.value = ''

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail.value,
      password: loginPassword.value
    })

    if (authError) {
      loginError.value = authError.message
      loginLoading.value = false
      return
    }

    currentUser.value = data.user
    showLoginForm.value = false
    loginLoading.value = false
    loginEmail.value = ''
    loginPassword.value = ''
  } catch (err) {
    console.error('登录网络错误:', err)
    loginError.value = '网络请求失败，请检查网络连接后重试'
    loginLoading.value = false
  }
}

async function approveAccess() {
  try {
    if (!supabase) {
      error.value = '客户端未初始化'
      return
    }

    // 检查用户是否已登录
    if (!currentUser.value) {
      error.value = '用户未登录，请先在官网登录'
      console.error('用户未登录:', currentUser.value)
      return
    }

    // 检查必要参数
    if (!clientId.value || !redirectUri.value || !state.value) {
      error.value = '缺少必要的授权参数'
      console.error('缺少参数:', { clientId: clientId.value, redirectUri: redirectUri.value, state: state.value })
      return
    }

    // 生成授权码
    authCode.value = generateRandomString(32)
    console.log('生成的授权码:', authCode.value)

    // 存储授权码信息
    const { error: insertError, data } = await supabase
      .from('oauth_codes')
      .insert({
        code: authCode.value,
        user_id: currentUser.value.id,
        client_id: clientId.value,
        redirect_uri: redirectUri.value,
        code_challenge: codeChallenge.value,
        state: state.value,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      })
      .select()

    if (insertError) {
      console.error('插入授权码失败:', insertError)
      error.value = `授权失败: ${insertError.message}`
      return
    }

    console.log('授权码已存储，准备显示')

    // 显示成功状态
    success.value = true

  } catch (err) {
    console.error('授权错误:', err)
    error.value = `授权过程中发生错误: ${err.message}`
  }
}

function denyAccess() {
  // 用户拒绝
  error.value = '授权已取消'
}

function copyCode() {
  navigator.clipboard.writeText(authCode.value).then(() => {
    alert('授权码已复制到剪贴板！\n请返回游戏并粘贴授权码。')
  }).catch(() => {
    // 降级方案：选中文本
    const codeElement = document.querySelector('.auth-code-box code')
    const range = document.createRange()
    range.selectNodeContents(codeElement)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
    alert('请手动复制选中的授权码！')
  })
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
  background: #0f172a;
}

.consent-container {
  background: #1e293b;
  border-radius: 12px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.3);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
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
  border-radius: 16px;
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
  background: #0f172a;
  border-radius: 12px;
  margin-bottom: 25px;
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
  color: #f1f5f9;
  margin-bottom: 4px;
}

.user-details p {
  font-size: 13px;
  color: #94a3b8;
}

.permissions {
  margin-bottom: 25px;
}

.permissions h3 {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #334155;
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.permission-item:hover {
  border-color: #667eea;
  background: #0f172a;
}

.permission-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.permission-text h4 {
  font-size: 14px;
  color: #f1f5f9;
  margin-bottom: 3px;
}

.permission-text p {
  font-size: 12px;
  color: #94a3b8;
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
  border-radius: 8px;
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
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.btn-secondary {
  background: #334155;
  color: #f1f5f9;
}

.btn-secondary:hover {
  background: #475569;
}

.loading-state {
  text-align: center;
  padding: 40px;
  background: #1e293b;
  border-radius: 12px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.3);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
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
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.success-state {
  text-align: center;
  padding: 20px;
}

.success-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.success-state h3 {
  font-size: 20px;
  color: #f1f5f9;
  margin-bottom: 10px;
}

.success-state p {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 20px;
}

.auth-code-box {
  background: #0f172a;
  border: 2px solid #667eea;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.auth-code-box code {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #667eea;
  word-break: break-all;
}

.copy-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #764ba2;
}

.hint {
  font-size: 12px;
  color: #64748b;
  margin-top: 10px;
}

/* 内联登录表单 */
.login-prompt {
  text-align: center;
  margin-bottom: 24px;
}

.login-prompt h3 {
  font-size: 20px;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.login-prompt p {
  font-size: 14px;
  color: #94a3b8;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #334155;
  border-radius: 8px;
  font-size: 15px;
  background: #0f172a;
  color: #f1f5f9;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #667eea;
}

.form-group input::placeholder {
  color: #64748b;
}

.login-submit-btn {
  width: 100%;
  margin-top: 8px;
}

.login-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-hint {
  text-align: center;
  font-size: 12px;
  color: #64748b;
  margin-top: 16px;
}
</style>
