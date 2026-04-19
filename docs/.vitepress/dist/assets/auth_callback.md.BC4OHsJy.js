import{createClient as f}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";import{_ as q,o as _,c as v,a2 as I}from"./chunks/framework.9OEo8FlG.js";const w="https://ornvxqtykdmafokmwwnr.supabase.co",y="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MjI4MjEsImV4cCI6MjA2MDM5ODgyMX0.lH1af9y4qyX8aY3JyOOFj4yC1MhXzD5p6qE8rF9s2tU",r=f(w,y);async function u(){const t=document.getElementById("loading-state"),e=document.getElementById("success-state"),a=document.getElementById("error-state"),n=document.getElementById("error-message");try{const s=window.location.hash,o=new URLSearchParams(s.substring(1)),h=o.get("error"),m=o.get("error_description");if(h){t.classList.add("hidden"),a.classList.remove("hidden"),n.textContent=decodeURIComponent(m||"验证失败");return}const{data:g,error:d}=await r.auth.getSession();if(d)throw d;if(g.session){t.classList.add("hidden"),e.classList.remove("hidden"),setTimeout(()=>{window.location.href="/"},3e3);return}const c=o.get("access_token"),l=o.get("refresh_token");if(c&&l){const{error:i}=await r.auth.setSession({access_token:c,refresh_token:l});if(i)throw i;t.classList.add("hidden"),e.classList.remove("hidden"),setTimeout(()=>{window.location.href="/"},3e3)}else{const{data:i,error:p}=await r.auth.exchangeCodeForSession(window.location.href);p?(t.classList.add("hidden"),a.classList.remove("hidden"),n.textContent="无效的验证链接或会话已过期"):(t.classList.add("hidden"),e.classList.remove("hidden"),setTimeout(()=>{window.location.href="/"},3e3))}}catch(s){console.error("验证处理错误:",s),t.classList.add("hidden"),a.classList.remove("hidden"),n.textContent=s.message||"验证过程中发生错误"}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",u):u();const C=JSON.parse('{"title":"","description":"","frontmatter":{"layout":false},"headers":[],"relativePath":"auth/callback.md","filePath":"auth/callback.md"}'),S={name:"auth/callback.md"};function L(t,e,a,n,s,o){return _(),v("div",null,[...e[0]||(e[0]=[I(`<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>验证中... - QJOL Studios</title></head><body><div class="container"><div id="loading-state"><div class="loading"></div><h2>正在验证...</h2><p>请稍候，正在完成登录验证</p></div><pre><code>&lt;!-- 成功 --&gt;
&lt;div id=&quot;success-state&quot; class=&quot;hidden&quot;&gt;
  &lt;div style=&quot;font-size: 48px; margin-bottom: 10px;&quot;&gt;✅&lt;/div&gt;
  &lt;h2 class=&quot;success&quot;&gt;登录成功！&lt;/h2&gt;
  &lt;p&gt;您已成功登录，即将跳转到首页...&lt;/p&gt;
  &lt;a href=&quot;/&quot; class=&quot;btn&quot;&gt;立即进入&lt;/a&gt;
&lt;/div&gt;

&lt;!-- 失败 --&gt;
&lt;div id=&quot;error-state&quot; class=&quot;hidden&quot;&gt;
  &lt;div style=&quot;font-size: 48px; margin-bottom: 10px;&quot;&gt;❌&lt;/div&gt;
  &lt;h2 class=&quot;error&quot;&gt;验证失败&lt;/h2&gt;
  &lt;p id=&quot;error-message&quot;&gt;验证链接已过期或无效&lt;/p&gt;
  &lt;a href=&quot;/&quot; class=&quot;btn&quot;&gt;返回首页&lt;/a&gt;
&lt;/div&gt;
</code></pre></div></body></html>`,1)])])}const k=q(S,[["render",L]]);export{C as __pageData,k as default};
