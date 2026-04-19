<template>
  <div class="user-auth">
    <!-- 未登录状态 -->
    <div v-if="!user" class="auth-buttons">
      <button class="login-btn" @click="showLoginModal = true">
        登录
      </button>
    </div>
    
    <!-- 已登录状态 - 带下拉菜单 -->
    <div v-else class="user-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
      <div class="user-trigger" @click="showDropdown = !showDropdown">
        <div class="user-avatar">
          {{ user.email?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <span class="username">{{ displayName }}</span>
        <span class="dropdown-arrow" :class="{ 'is-open': showDropdown }">▼</span>
      </div>
      
      <!-- 下拉菜单 -->
      <Transition name="dropdown">
        <div v-show="showDropdown" class="dropdown-menu">
          <!-- 用户信息头部 -->
          <div class="dropdown-header">
            <div class="user-avatar-large">
              {{ user.email?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="user-details">
              <div class="user-email">{{ user.email }}</div>
              <div class="user-status">已登录</div>
            </div>
          </div>
          
          <div class="dropdown-divider"></div>
          
          <!-- 菜单项 -->
          <div class="dropdown-items">
            <a href="/user" class="dropdown-item">
              <span class="item-icon">👤</span>
              <span class="item-text">用户中心</span>
            </a>
          </div>
          
          <div class="dropdown-divider"></div>
          
          <!-- 设置和退出 -->
          <div class="dropdown-items">
            <div class="dropdown-item" @click="openSettingsModal('account')">
              <span class="item-icon">⚙️</span>
              <span class="item-text">设置</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout-item" @click="logout">
              <span class="item-icon">🚪</span>
              <span class="item-text">退出登录</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    
    <!-- 登录弹窗 -->
    <Teleport to="body">
      <div v-if="showLoginModal" class="modal-overlay" @click.self="showLoginModal = false">
        <div class="modal-content">
          <h3>登录 / 注册</h3>
          
          <div class="form-group">
            <input 
              v-model="email" 
              type="email" 
              placeholder="邮箱地址"
              @keyup.enter="handleLogin"
            />
          </div>
          
          <div class="form-group">
            <input 
              v-model="password" 
              type="password" 
              placeholder="密码"
              @keyup.enter="handleLogin"
            />
          </div>
          
          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="message" class="success-message">{{ message }}</div>
          
          <div class="button-group">
            <button 
              class="primary-btn" 
              @click="handleLogin"
              :disabled="loading"
            >
              {{ loading ? '登录中...' : '登录' }}
            </button>
            <button 
              class="secondary-btn" 
              @click="handleRegister"
              :disabled="loading"
            >
              {{ loading ? '注册中...' : '注册' }}
            </button>
          </div>
          
          <button class="close-btn" @click="showLoginModal = false">×</button>
        </div>
      </div>
    </Teleport>

    <!-- 设置弹窗 -->
    <Teleport to="body">
      <div v-if="showSettingsModal" class="modal-overlay" @click.self="closeSettingsModal">
        <div class="settings-modal-content">
          <button class="close-btn" @click="closeSettingsModal">×</button>
          
          <div class="settings-layout">
            <!-- 侧边栏导航 -->
            <div class="settings-sidebar">
              <h3 class="settings-title">设置</h3>
              <nav class="settings-nav">
                <div 
                  class="nav-item" 
                  :class="{ active: settingsType === 'account' }"
                  @click="settingsType = 'account'"
                >
                  <span class="nav-icon">👤</span>
                  <span class="nav-text">账号信息</span>
                </div>
                <div 
                  class="nav-item" 
                  :class="{ active: settingsType === 'password' }"
                  @click="settingsType = 'password'"
                >
                  <span class="nav-icon">🔒</span>
                  <span class="nav-text">修改密码</span>
                </div>
                <div 
                  class="nav-item" 
                  :class="{ active: settingsType === 'privacy' }"
                  @click="settingsType = 'privacy'"
                >
                  <span class="nav-icon">🛡️</span>
                  <span class="nav-text">隐私设置</span>
                </div>
              </nav>
            </div>
            
            <!-- 内容区域 -->
            <div class="settings-body">
              <!-- 账号信息 -->
              <template v-if="settingsType === 'account'">
                <h4 class="section-title">账号信息</h4>
                <div class="settings-section">
                  <div class="form-group">
                    <label class="form-label">当前用户名</label>
                    <input 
                      v-model="newUsername" 
                      type="text" 
                      placeholder="请输入新用户名"
                      maxlength="20"
                    />
                  </div>
                  <div v-if="settingsError" class="error-message">{{ settingsError }}</div>
                  <div v-if="settingsMessage" class="success-message">{{ settingsMessage }}</div>
                  <button 
                    class="primary-btn" 
                    @click="updateUsername"
                    :disabled="settingsLoading"
                  >
                    {{ settingsLoading ? '保存中...' : '保存用户名' }}
                  </button>
                </div>
                
                <div class="info-section">
                  <div class="info-item">
                    <span class="info-label">邮箱</span>
                    <span class="info-value">{{ user?.email }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">用户ID</span>
                    <span class="info-value user-id">{{ user?.id?.substring(0, 8) }}...</span>
                  </div>
                </div>
              </template>

              <!-- 修改密码 -->
              <template v-if="settingsType === 'password'">
                <h4 class="section-title">修改密码</h4>
                <div class="settings-section">
                  <div class="form-group">
                    <label class="form-label">当前密码</label>
                    <input 
                      v-model="currentPassword" 
                      type="password" 
                      placeholder="请输入当前密码"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">新密码</label>
                    <input 
                      v-model="newPassword" 
                      type="password" 
                      placeholder="新密码（至少6位）"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">确认新密码</label>
                    <input 
                      v-model="confirmPassword" 
                      type="password" 
                      placeholder="请再次输入新密码"
                    />
                  </div>
                  <div v-if="settingsError" class="error-message">{{ settingsError }}</div>
                  <div v-if="settingsMessage" class="success-message">{{ settingsMessage }}</div>
                  <button 
                    class="primary-btn" 
                    @click="updatePassword"
                    :disabled="settingsLoading"
                  >
                    {{ settingsLoading ? '修改中...' : '修改密码' }}
                  </button>
                </div>
              </template>

              <!-- 隐私设置 -->
              <template v-if="settingsType === 'privacy'">
                <h4 class="section-title">隐私设置</h4>
                <div class="settings-section">
                  <div class="privacy-options">
                    <label class="privacy-item">
                      <input 
                        type="checkbox" 
                        v-model="privacySettings.showEmail"
                      />
                      <div class="privacy-info">
                        <span class="privacy-title">显示邮箱</span>
                        <span class="privacy-desc">在个人资料中公开显示邮箱地址</span>
                      </div>
                    </label>
                    <label class="privacy-item">
                      <input 
                        type="checkbox" 
                        v-model="privacySettings.showStats"
                      />
                      <div class="privacy-info">
                        <span class="privacy-title">游戏数据</span>
                        <span class="privacy-desc">允许他人查看我的游戏统计数据</span>
                      </div>
                    </label>
                    <label class="privacy-item">
                      <input 
                        type="checkbox" 
                        v-model="privacySettings.publicProfile"
                      />
                      <div class="privacy-info">
                        <span class="privacy-title">公开资料</span>
                        <span class="privacy-desc">任何人都可以查看我的个人资料</span>
                      </div>
                    </label>
                  </div>
                  <div v-if="settingsError" class="error-message">{{ settingsError }}</div>
                  <div v-if="settingsMessage" class="success-message">{{ settingsMessage }}</div>
                  <button 
                    class="primary-btn" 
                    @click="savePrivacySettings"
                    :disabled="settingsLoading"
                  >
                    {{ settingsLoading ? '保存中...' : '保存设置' }}
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const user = ref(null)
const showLoginModal = ref(false)
const showDropdown = ref(false)
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')

// 设置弹窗相关
const showSettingsModal = ref(false)
const settingsType = ref('')
const settingsLoading = ref(false)
const settingsError = ref('')
const settingsMessage = ref('')

// 修改用户名
const newUsername = ref('')

// 修改密码
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// 隐私设置
const privacySettings = ref({
  showEmail: true,
  showStats: true,
  publicProfile: false
})

let supabase = null

// 计算显示的用户名（截断过长的邮箱）
const displayName = computed(() => {
  if (!user.value?.email) return ''
  const email = user.value.email
  if (email.length > 10) {
    return email.substring(0, 8) + '...'
  }
  return email
})

// 初始化 Supabase 客户端
async function initSupabase() {
  if (typeof window === 'undefined') return
  
  const { createClient } = await import('@supabase/supabase-js')
  const SUPABASE_URL = 'https://ornvxqtykdmafokmwwnr.supabase.co'
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTAzNDAsImV4cCI6MjA5MTUyNjM0MH0.1zFgq_EC6JHmMTzRPDW11JKl7ltBzdjH2EMXvioJPqI'
  
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
}

// 检查登录状态
onMounted(async () => {
  await initSupabase()
  
  if (supabase) {
    // 获取当前会话
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      user.value = session.user
    }
    
    // 监听登录状态变化
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        user.value = session.user
      } else if (event === 'SIGNED_OUT') {
        user.value = null
      }
    })
  }
  
  // 监听显示登录弹窗事件
  window.addEventListener('show-login-modal', handleShowLoginModal)
})

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('show-login-modal', handleShowLoginModal)
})

// 处理显示登录弹窗事件
function handleShowLoginModal() {
  showLoginModal.value = true
}

// 打开设置弹窗
async function openSettingsModal(type) {
  settingsType.value = type
  showSettingsModal.value = true
  showDropdown.value = false
  
  // 重置设置表单
  settingsError.value = ''
  settingsMessage.value = ''
  newUsername.value = ''
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  
  // 如果是隐私设置，加载已有的设置
  if (type === 'privacy' && supabase && user.value) {
    await loadPrivacySettings()
  }
}

// 加载隐私设置
async function loadPrivacySettings() {
  if (!supabase || !user.value) return
  
  try {
    // 从 users 表读取隐私设置
    const { data, error } = await supabase
      .from('users')
      .select('settings')
      .eq('id', user.value.id)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.log('加载隐私设置失败:', error)
      return
    }
    
    // 从 settings 列中读取隐私设置
    const privacyData = data?.settings?.privacy
    if (privacyData) {
      privacySettings.value = {
        showEmail: privacyData.showEmail ?? true,
        showStats: privacyData.showStats ?? true,
        publicProfile: privacyData.publicProfile ?? false
      }
    }
    
    // 如果有 localStorage 的数据，迁移到数据库
    const storageKey = `privacy_settings_${user.value.id}`
    const stored = localStorage.getItem(storageKey)
    if (stored && !privacyData) {
      const localData = JSON.parse(stored)
      privacySettings.value = {
        showEmail: localData.showEmail ?? true,
        showStats: localData.showStats ?? true,
        publicProfile: localData.publicProfile ?? false
      }
      // 保存到数据库
      await savePrivacySettings()
      // 清除 localStorage
      localStorage.removeItem(storageKey)
    }
  } catch (err) {
    console.log('加载隐私设置出错:', err)
  }
}

// 关闭设置弹窗
function closeSettingsModal() {
  showSettingsModal.value = false
  settingsType.value = ''
  settingsError.value = ''
  settingsMessage.value = ''
}

// 更新用户名（通过 Edge Function，含7天限制）
async function updateUsername() {
  if (!supabase || !user.value) return
  
  if (!newUsername.value.trim()) {
    settingsError.value = '请输入用户名'
    return
  }
  
  settingsLoading.value = true
  settingsError.value = ''
  settingsMessage.value = ''
  
  try {
    // 获取当前 session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session:', session, 'Error:', sessionError)
    console.log('User:', user.value)
    
    if (sessionError) {
      throw new Error('获取会话失败: ' + sessionError.message)
    }
    
    if (!session?.access_token) {
      throw new Error('未登录或会话已过期')
    }
    
    console.log('Access Token:', session.access_token ? '存在' : '不存在')
    
    // 调用 Edge Function，使用 Bearer token
    const response = await fetch('https://ornvxqtykdmafokmwwnr.supabase.co/functions/v1/update-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTAzNDAsImV4cCI6MjA5MTUyNjM0MH0.1zFgq_EC6JHmMTzRPDW11JKl7ltBzdjH2EMXvioJPqI'
      },
      body: JSON.stringify({
        user_id: user.value.id,
        new_username: newUsername.value.trim()
      })
    })
    
    const result = await response.json()
    console.log('Edge Function 响应:', response.status, result)
    
    if (!response.ok) {
      throw new Error(result.error || `修改失败 (${response.status})`)
    }
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    settingsMessage.value = '用户名修改成功！'
    setTimeout(() => {
      closeSettingsModal()
    }, 1500)
  } catch (err) {
    console.error('修改用户名错误:', err)
    settingsError.value = err.message || '修改失败'
  } finally {
    settingsLoading.value = false
  }
}

// 更新密码
async function updatePassword() {
  if (!supabase) return
  
  if (!currentPassword.value) {
    settingsError.value = '请输入当前密码'
    return
  }
  
  if (!newPassword.value || newPassword.value.length < 6) {
    settingsError.value = '新密码至少需要6位'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    settingsError.value = '两次输入的新密码不一致'
    return
  }
  
  settingsLoading.value = true
  settingsError.value = ''
  settingsMessage.value = ''
  
  try {
    // 先验证当前密码
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: currentPassword.value
    })
    
    if (signInError) {
      settingsError.value = '当前密码错误'
      settingsLoading.value = false
      return
    }
    
    // 更新密码
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })
    
    if (error) throw error
    
    settingsMessage.value = '密码修改成功！请使用新密码重新登录'
    setTimeout(() => {
      closeSettingsModal()
      logout()
    }, 2000)
  } catch (err) {
    settingsError.value = '修改失败: ' + err.message
  } finally {
    settingsLoading.value = false
  }
}

// 保存隐私设置
async function savePrivacySettings() {
  if (!supabase || !user.value) return
  
  settingsLoading.value = true
  settingsError.value = ''
  settingsMessage.value = ''
  
  try {
    // 先获取现有的 settings
    const { data: existingData, error: fetchError } = await supabase
      .from('users')
      .select('settings')
      .eq('id', user.value.id)
      .single()
    
    // 合并现有设置和隐私设置
    const mergedSettings = {
      ...(existingData?.settings || {}),
      privacy: privacySettings.value
    }
    
    // 保存到 users 表的 settings 列
    const { error } = await supabase
      .from('users')
      .update({
        settings: mergedSettings
      })
      .eq('id', user.value.id)
    
    if (error) throw error
    
    // 清除 localStorage 中的旧数据
    const storageKey = `privacy_settings_${user.value.id}`
    localStorage.removeItem(storageKey)
    
    settingsMessage.value = '隐私设置已保存！'
    setTimeout(() => {
      closeSettingsModal()
    }, 1500)
  } catch (err) {
    settingsError.value = '保存失败: ' + err.message
  } finally {
    settingsLoading.value = false
  }
}
// 跳转到抽卡分析
function goToGacha() {
  window.location.href = '/gacha-analyzer'
}

// 登录
async function handleLogin() {
  if (!supabase) {
    error.value = '客户端未初始化'
    return
  }
  
  if (!email.value || !password.value) {
    error.value = '请输入邮箱和密码'
    return
  }
  
  loading.value = true
  error.value = ''
  message.value = ''
  
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  
  loading.value = false
  
  if (authError) {
    error.value = authError.message
  } else {
    user.value = data.user
    message.value = '登录成功！'
    setTimeout(() => {
      showLoginModal.value = false
      email.value = ''
      password.value = ''
      message.value = ''
    }, 1000)
  }
}

// 注册
async function handleRegister() {
  if (!supabase) {
    error.value = '客户端未初始化'
    return
  }
  
  if (!email.value || !password.value) {
    error.value = '请输入邮箱和密码'
    return
  }
  
  if (password.value.length < 6) {
    error.value = '密码至少需要6位'
    return
  }
  
  loading.value = true
  error.value = ''
  message.value = ''
  
  const { data, error: authError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  loading.value = false
  
  if (authError) {
    error.value = authError.message
  } else {
    message.value = '注册成功！请检查邮箱完成验证~'
    email.value = ''
    password.value = ''
  }
}

// 退出登录
async function logout() {
  if (!supabase) return
  
  await supabase.auth.signOut()
  user.value = null
  showDropdown.value = false
}
</script>

<style scoped>
.user-auth {
  display: flex;
  align-items: center;
}

.login-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 用户下拉菜单 */
.user-dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.user-trigger:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand);
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.username {
  font-size: 13px;
  color: var(--vp-c-text-1);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  color: var(--vp-c-text-2);
  transition: transform 0.3s ease;
}

.dropdown-arrow.is-open {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
}

/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
}

.user-avatar-large {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-email {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-status {
  font-size: 12px;
  color: var(--vp-c-success);
  margin-top: 2px;
}

.dropdown-divider {
  height: 1px;
  background: var(--vp-c-divider);
  margin: 0;
}

.dropdown-items {
  padding: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.dropdown-item:hover {
  background: var(--vp-c-bg-soft);
}

.item-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.item-text {
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.logout-item:hover {
  background: var(--vp-c-danger-soft);
}

.logout-item:hover .item-text {
  color: var(--vp-c-danger);
}

/* 弹窗内容样式 */
.modal-content h3 {
  margin: 0 0 24px 0;
  text-align: center;
  color: var(--vp-c-text-1);
  font-size: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  color: var(--vp-c-danger);
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
}

.success-message {
  color: var(--vp-c-success);
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 12px;
}

.primary-btn, .secondary-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.secondary-btn {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.secondary-btn:hover:not(:disabled) {
  background: var(--vp-c-bg-mute);
}

.primary-btn:disabled, .secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

/* 设置弹窗样式 */
.settings-modal-content {
  position: relative;
  background: var(--vp-c-bg);
  border-radius: 16px;
  width: 700px;
  max-width: 90vw;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.settings-layout {
  display: flex;
  height: 100%;
  min-height: 500px;
}

/* 侧边栏 */
.settings-sidebar {
  width: 200px;
  background: var(--vp-c-bg-soft);
  border-right: 1px solid var(--vp-c-divider);
  padding: 24px 16px;
  flex-shrink: 0;
}

.settings-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  padding: 0 8px;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--vp-c-text-2);
}

.nav-item:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

/* 内容区域 */
.settings-body {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  max-height: 85vh;
}

.section-title {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.settings-section {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

/* 信息展示区域 */
.info-section {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-item:first-child {
  padding-top: 0;
}

.info-label {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.info-value {
  font-size: 14px;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.info-value.user-id {
  font-family: monospace;
  background: var(--vp-c-bg-mute);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 隐私设置样式 */
.privacy-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.privacy-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.2s ease;
  background: var(--vp-c-bg-soft);
}

.privacy-item:hover {
  border-color: #667eea;
  background: var(--vp-c-bg);
}

.privacy-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
  margin-top: 2px;
  flex-shrink: 0;
}

.privacy-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.privacy-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.privacy-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* 弹窗遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  position: relative;
  background: var(--vp-c-bg);
  border-radius: 16px;
  padding: 32px;
  min-width: 360px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 响应式 */
@media (max-width: 640px) {
  .settings-layout {
    flex-direction: column;
  }
  
  .settings-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
    padding: 16px;
  }
  
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 8px;
  }
  
  .nav-item {
    white-space: nowrap;
  }
  
  .settings-body {
    padding: 20px;
  }
}
</style>
