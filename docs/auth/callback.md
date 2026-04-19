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
      <p>请稍候，正在完成邮箱验证</p>
    </div>
    
    <!-- 成功 -->
    <div id="success-state" class="hidden">
      <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
      <h2 class="success">验证成功！</h2>
      <p>您的邮箱已成功验证，即将跳转到首页...</p>
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

  <script>
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      const SUPABASE_URL = 'https://ornvxqtykdmafokmwwnr.supabase.co'
      const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MjI4MjEsImV4cCI6MjA2MDM5ODgyMX0.lH1af9y4qyX8aY3JyOOFj4yC1MhXzD5p6qE8rF9s2tU'
      
      async function handleCallback() {
        const loadingState = document.getElementById('loading-state')
        const successState = document.getElementById('success-state')
        const errorState = document.getElementById('error-state')
        const errorMessage = document.getElementById('error-message')
        
        try {
          // 获取 URL 参数
          const hash = window.location.hash
          const params = new URLSearchParams(hash.substring(1))
          
          const error = params.get('error')
          const errorCode = params.get('error_code')
          const errorDescription = params.get('error_description')
          
          // 检查是否有错误
          if (error) {
            loadingState.classList.add('hidden')
            errorState.classList.remove('hidden')
            errorMessage.textContent = decodeURIComponent(errorDescription || '验证失败')
            return
          }
          
          // 获取 access_token 和 refresh_token
          const access_token = params.get('access_token')
          const refresh_token = params.get('refresh_token')
          
          if (!access_token || !refresh_token) {
            loadingState.classList.add('hidden')
            errorState.classList.remove('hidden')
            errorMessage.textContent = '无效的验证链接'
            return
          }
          
          // 使用 fetch API 直接设置 session
          const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token })
          })
          
          if (!response.ok) {
            throw new Error('验证失败')
          }
          
          // 验证成功
          loadingState.classList.add('hidden')
          successState.classList.remove('hidden')
          
          // 3秒后自动跳转
          setTimeout(() => {
            window.location.href = '/'
          }, 3000)
          
        } catch (err) {
          console.error('验证处理错误:', err)
          loadingState.classList.add('hidden')
          errorState.classList.remove('hidden')
          errorMessage.textContent = err.message || '验证过程中发生错误'
        }
      }
      
      // 页面加载完成后处理
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleCallback)
      } else {
        handleCallback()
      }
    }
  </script>
</body>
</html>
