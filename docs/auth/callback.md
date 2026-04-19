---
layout: false
---

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>验证中... - QJOL Studios</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    
    .loading {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    h2 {
      color: #333;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
      margin-bottom: 20px;
    }
    
    .success {
      color: #22c55e;
    }
    
    .error {
      color: #ef4444;
    }
    
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.3s;
    }
    
    .btn:hover {
      background: #5a67d8;
    }
    
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- 加载中 -->
    <div id="loading-state">
      <div class="loading"></div>
      <h2>正在验证...</h2>
      <p>请稍候，正在完成登录验证</p>
    </div>
    
    <!-- 成功 -->
    <div id="success-state" class="hidden">
      <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
      <h2 class="success">登录成功！</h2>
      <p>您已成功登录，即将跳转到首页...</p>
      <a href="/" class="btn">立即进入</a>
    </div>
    
    <!-- 失败 -->
    <div id="error-state" class="hidden">
      <div style="font-size: 48px; margin-bottom: 10px;">❌</div>
      <h2 class="error">验证失败</h2>
      <p id="error-message">验证链接已过期或无效</p>
      <a href="/" class="btn">返回首页</a>
    </div>
  </div>

  <script type="module">
    async function init() {
      // 动态导入，避免 SSR 问题
      const { createClient } = await import('@supabase/supabase-js')
      
      const SUPABASE_URL = 'https://ornvxqtykdmafokmwwnr.supabase.co'
      // 使用和游戏相同的 API Key
      const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTAzNDAsImV4cCI6MjA5MTUyNjM0MH0.1zFgq_EC6JHmMTzRPDW11JKl7ltBzdjH2EMXvioJPqI'
      
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      
      await handleCallback(supabase)
    }
    
    async function handleCallback(supabase) {
      const loadingState = document.getElementById('loading-state')
      const successState = document.getElementById('success-state')
      const errorState = document.getElementById('error-state')
      const errorMessage = document.getElementById('error-message')
      
      try {
        // 获取 URL hash 参数（用于邮箱验证回调）
        const hash = window.location.hash
        const params = new URLSearchParams(hash.substring(1))
        
        const error = params.get('error')
        const errorDescription = params.get('error_description')
        
        // 检查是否有错误
        if (error) {
          loadingState.classList.add('hidden')
          errorState.classList.remove('hidden')
          errorMessage.textContent = decodeURIComponent(errorDescription || '验证失败')
          return
        }
        
        // 使用 Supabase 处理回调
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (data.session) {
          // 已有 session，说明是通过 OAuth 或 Magic Link 登录
          loadingState.classList.add('hidden')
          successState.classList.remove('hidden')
          
          // 3秒后自动跳转
          setTimeout(() => {
            window.location.href = '/'
          }, 3000)
          return
        }
        
        // 尝试从 URL 获取并设置 session（邮箱验证流程）
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        
        if (access_token && refresh_token) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })
          
          if (setSessionError) {
            throw setSessionError
          }
          
          // 验证成功
          loadingState.classList.add('hidden')
          successState.classList.remove('hidden')
          
          // 3秒后自动跳转
          setTimeout(() => {
            window.location.href = '/'
          }, 3000)
        } else {
          // 检查是否是 OAuth 回调
          const { data: oauthData, error: oauthError } = await supabase.auth.exchangeCodeForSession(window.location.href)
          
          if (oauthError) {
            // 没有有效的认证信息
            loadingState.classList.add('hidden')
            errorState.classList.remove('hidden')
            errorMessage.textContent = '无效的验证链接或会话已过期'
          } else {
            loadingState.classList.add('hidden')
            successState.classList.remove('hidden')
            
            setTimeout(() => {
              window.location.href = '/'
            }, 3000)
          }
        }
        
      } catch (err) {
        console.error('验证处理错误:', err)
        loadingState.classList.add('hidden')
        errorState.classList.remove('hidden')
        errorMessage.textContent = err.message || '验证过程中发生错误'
      }
    }
    
    // 页面加载完成后处理
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  </script>
</body>
</html>
