import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderComponent, renderToString } from "vue/server-renderer";
import { L as Layout, _ as _sfc_main$4 } from "./VPTeamPageTitle.Dti_cNVl.js";
import { i as inBrowser, c as createTitle, m as mergeHead, u as useRoute, p as pathToFile, a as useData, R as RouterSymbol, b as initData, d as dataSymbol, C as Content, s as siteDataRef, e as createRouter } from "./Content.Dc2Ksrw_.js";
import { ref, onMounted, onUnmounted, mergeProps, useSSRContext, computed, unref, withCtx, createVNode, defineComponent, watchEffect, watch, h, createSSRApp } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
import { U as UserProfile } from "./UserProfile.C895egQx.js";
import "@vueuse/core";
const theme = {
  Layout,
  enhanceApp: ({ app }) => {
    app.component("Badge", _sfc_main$4);
  }
};
const _sfc_main$3 = {
  __name: "Timer",
  __ssrInlineRender: true,
  setup(__props) {
    const timerText = ref("计算中...");
    let intervalId = null;
    function updateTimer() {
      const startDate = /* @__PURE__ */ new Date("2026-03-22T00:00:00");
      const now = /* @__PURE__ */ new Date();
      const diff = now - startDate;
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
      const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
      const seconds = Math.floor(diff % (1e3 * 60) / 1e3);
      timerText.value = `${days}天${hours}时${minutes}分${seconds}秒`;
    }
    onMounted(() => {
      updateTimer();
      intervalId = setInterval(updateTimer, 1e3);
    });
    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "timer-section" }, _attrs))} data-v-53095754><div class="timer-label" data-v-53095754>我们已经坚持了</div><div class="timer-display" data-v-53095754>${ssrInterpolate(timerText.value)}</div></div>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/Timer.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const Timer = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-53095754"]]);
const _sfc_main$2 = {
  __name: "UserAuth",
  __ssrInlineRender: true,
  setup(__props) {
    const user = ref(null);
    const showLoginModal = ref(false);
    const showDropdown = ref(false);
    const email = ref("");
    const password = ref("");
    const loading = ref(false);
    const error = ref("");
    const message = ref("");
    const showSettingsModal = ref(false);
    const settingsType = ref("");
    const settingsLoading = ref(false);
    const settingsError = ref("");
    const settingsMessage = ref("");
    const newUsername = ref("");
    ref(null);
    const avatarUrl = ref("");
    const avatarUploadStatus = ref("");
    const currentPassword = ref("");
    const newPassword = ref("");
    const confirmPassword = ref("");
    const privacySettings = ref({
      showEmail: true,
      showStats: true,
      publicProfile: false
    });
    let supabase = null;
    const displayName = computed(() => {
      var _a;
      if (!((_a = user.value) == null ? void 0 : _a.email)) return "";
      const email2 = user.value.email;
      if (email2.length > 10) {
        return email2.substring(0, 8) + "...";
      }
      return email2;
    });
    async function initSupabase() {
      if (typeof window === "undefined") return;
      const { createClient } = await import("./index.DLboA9mS.js");
      const SUPABASE_URL = "https://ornvxqtykdmafokmwwnr.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTAzNDAsImV4cCI6MjA5MTUyNjM0MH0.1zFgq_EC6JHmMTzRPDW11JKl7ltBzdjH2EMXvioJPqI";
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    onMounted(async () => {
      await initSupabase();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          user.value = session.user;
        }
        supabase.auth.onAuthStateChange((event, session2) => {
          if (event === "SIGNED_IN" && session2) {
            user.value = session2.user;
          } else if (event === "SIGNED_OUT") {
            user.value = null;
          }
        });
      }
      window.addEventListener("show-login-modal", handleShowLoginModal);
      if (user.value) {
        await loadAvatar();
      }
    });
    onUnmounted(() => {
      window.removeEventListener("show-login-modal", handleShowLoginModal);
    });
    function handleShowLoginModal() {
      showLoginModal.value = true;
    }
    async function loadAvatar() {
      if (!supabase || !user.value) return;
      try {
        const { data } = await supabase.from("users").select("avatar_url").eq("id", user.value.id).single();
        if (data == null ? void 0 : data.avatar_url) {
          avatarUrl.value = data.avatar_url;
        }
      } catch (err) {
        console.log("加载头像失败:", err);
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "user-auth" }, _attrs))} data-v-2129aae7>`);
      if (!user.value) {
        _push(`<div class="auth-buttons" data-v-2129aae7><button class="login-btn" data-v-2129aae7> 登录 </button></div>`);
      } else {
        _push(`<div class="user-dropdown" data-v-2129aae7><div class="user-trigger" data-v-2129aae7><div class="user-avatar" data-v-2129aae7>${ssrInterpolate(((_a = user.value.email) == null ? void 0 : _a.charAt(0).toUpperCase()) || "U")}</div><span class="username" data-v-2129aae7>${ssrInterpolate(displayName.value)}</span><span class="${ssrRenderClass([{ "is-open": showDropdown.value }, "dropdown-arrow"])}" data-v-2129aae7>▼</span></div><div class="dropdown-menu" style="${ssrRenderStyle(showDropdown.value ? null : { display: "none" })}" data-v-2129aae7><div class="dropdown-header" data-v-2129aae7><div class="user-avatar-large" data-v-2129aae7>${ssrInterpolate(((_b = user.value.email) == null ? void 0 : _b.charAt(0).toUpperCase()) || "U")}</div><div class="user-details" data-v-2129aae7><div class="user-email" data-v-2129aae7>${ssrInterpolate(user.value.email)}</div><div class="user-status" data-v-2129aae7>已登录</div></div></div><div class="dropdown-divider" data-v-2129aae7></div><div class="dropdown-items" data-v-2129aae7><a href="/user" class="dropdown-item" data-v-2129aae7><span class="item-icon" data-v-2129aae7>👤</span><span class="item-text" data-v-2129aae7>用户中心</span></a></div><div class="dropdown-divider" data-v-2129aae7></div><div class="dropdown-items" data-v-2129aae7><div class="dropdown-item" data-v-2129aae7><span class="item-icon" data-v-2129aae7>⚙️</span><span class="item-text" data-v-2129aae7>设置</span></div><div class="dropdown-divider" data-v-2129aae7></div><div class="dropdown-item logout-item" data-v-2129aae7><span class="item-icon" data-v-2129aae7>🚪</span><span class="item-text" data-v-2129aae7>退出登录</span></div></div></div></div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (showLoginModal.value) {
          _push2(`<div class="modal-overlay" data-v-2129aae7><div class="modal-content" data-v-2129aae7><h3 data-v-2129aae7>登录 / 注册</h3><div class="form-group" data-v-2129aae7><input${ssrRenderAttr("value", email.value)} type="email" placeholder="邮箱地址" data-v-2129aae7></div><div class="form-group" data-v-2129aae7><input${ssrRenderAttr("value", password.value)} type="password" placeholder="密码" data-v-2129aae7></div>`);
          if (error.value) {
            _push2(`<div class="error-message" data-v-2129aae7>${ssrInterpolate(error.value)}</div>`);
          } else {
            _push2(`<!---->`);
          }
          if (message.value) {
            _push2(`<div class="success-message" data-v-2129aae7>${ssrInterpolate(message.value)}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="button-group" data-v-2129aae7><button class="primary-btn"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-2129aae7>${ssrInterpolate(loading.value ? "登录中..." : "登录")}</button><button class="secondary-btn"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-2129aae7>${ssrInterpolate(loading.value ? "注册中..." : "注册")}</button></div><button class="close-btn" data-v-2129aae7>×</button></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        var _a2, _b2, _c, _d, _e;
        if (showSettingsModal.value) {
          _push2(`<div class="modal-overlay" data-v-2129aae7><div class="settings-modal-content" data-v-2129aae7><button class="close-btn" data-v-2129aae7>×</button><div class="settings-layout" data-v-2129aae7><div class="settings-sidebar" data-v-2129aae7><h3 class="settings-title" data-v-2129aae7>设置</h3><nav class="settings-nav" data-v-2129aae7><div class="${ssrRenderClass([{ active: settingsType.value === "account" }, "nav-item"])}" data-v-2129aae7><span class="nav-icon" data-v-2129aae7>👤</span><span class="nav-text" data-v-2129aae7>账号信息</span></div><div class="${ssrRenderClass([{ active: settingsType.value === "password" }, "nav-item"])}" data-v-2129aae7><span class="nav-icon" data-v-2129aae7>🔒</span><span class="nav-text" data-v-2129aae7>修改密码</span></div><div class="${ssrRenderClass([{ active: settingsType.value === "privacy" }, "nav-item"])}" data-v-2129aae7><span class="nav-icon" data-v-2129aae7>🛡️</span><span class="nav-text" data-v-2129aae7>隐私设置</span></div></nav></div><div class="settings-body" data-v-2129aae7>`);
          if (settingsType.value === "account") {
            _push2(`<!--[--><h4 class="section-title" data-v-2129aae7>账号信息</h4><div class="settings-section" data-v-2129aae7><div class="avatar-section" data-v-2129aae7><div class="avatar-preview" data-v-2129aae7>`);
            if (avatarUrl.value) {
              _push2(`<img${ssrRenderAttr("src", avatarUrl.value)} alt="头像" class="avatar-img" data-v-2129aae7>`);
            } else {
              _push2(`<div class="avatar-placeholder" data-v-2129aae7>${ssrInterpolate(((_b2 = (_a2 = user.value) == null ? void 0 : _a2.email) == null ? void 0 : _b2.charAt(0).toUpperCase()) || "U")}</div>`);
            }
            _push2(`<div class="avatar-overlay" data-v-2129aae7><span data-v-2129aae7>更换头像</span></div></div><input type="file" accept="image/png,image/jpeg,image/gif,image/webp" style="${ssrRenderStyle({ "display": "none" })}" data-v-2129aae7>`);
            if (avatarUploadStatus.value) {
              _push2(`<div class="avatar-status" data-v-2129aae7>${ssrInterpolate(avatarUploadStatus.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="form-group" data-v-2129aae7><label class="form-label" data-v-2129aae7>当前用户名</label><input${ssrRenderAttr("value", newUsername.value)} type="text" placeholder="请输入新用户名" maxlength="20" data-v-2129aae7></div>`);
            if (settingsError.value) {
              _push2(`<div class="error-message" data-v-2129aae7>${ssrInterpolate(settingsError.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (settingsMessage.value) {
              _push2(`<div class="success-message" data-v-2129aae7>${ssrInterpolate(settingsMessage.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="primary-btn"${ssrIncludeBooleanAttr(settingsLoading.value) ? " disabled" : ""} data-v-2129aae7>${ssrInterpolate(settingsLoading.value ? "保存中..." : "保存用户名")}</button></div><div class="info-section" data-v-2129aae7><div class="info-item" data-v-2129aae7><span class="info-label" data-v-2129aae7>邮箱</span><span class="info-value" data-v-2129aae7>${ssrInterpolate((_c = user.value) == null ? void 0 : _c.email)}</span></div><div class="info-item" data-v-2129aae7><span class="info-label" data-v-2129aae7>用户ID</span><span class="info-value user-id" data-v-2129aae7>${ssrInterpolate((_e = (_d = user.value) == null ? void 0 : _d.id) == null ? void 0 : _e.substring(0, 8))}...</span></div></div><!--]-->`);
          } else {
            _push2(`<!---->`);
          }
          if (settingsType.value === "password") {
            _push2(`<!--[--><h4 class="section-title" data-v-2129aae7>修改密码</h4><div class="settings-section" data-v-2129aae7><div class="form-group" data-v-2129aae7><label class="form-label" data-v-2129aae7>当前密码</label><input${ssrRenderAttr("value", currentPassword.value)} type="password" placeholder="请输入当前密码" data-v-2129aae7></div><div class="form-group" data-v-2129aae7><label class="form-label" data-v-2129aae7>新密码</label><input${ssrRenderAttr("value", newPassword.value)} type="password" placeholder="新密码（至少6位）" data-v-2129aae7></div><div class="form-group" data-v-2129aae7><label class="form-label" data-v-2129aae7>确认新密码</label><input${ssrRenderAttr("value", confirmPassword.value)} type="password" placeholder="请再次输入新密码" data-v-2129aae7></div>`);
            if (settingsError.value) {
              _push2(`<div class="error-message" data-v-2129aae7>${ssrInterpolate(settingsError.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (settingsMessage.value) {
              _push2(`<div class="success-message" data-v-2129aae7>${ssrInterpolate(settingsMessage.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="primary-btn"${ssrIncludeBooleanAttr(settingsLoading.value) ? " disabled" : ""} data-v-2129aae7>${ssrInterpolate(settingsLoading.value ? "修改中..." : "修改密码")}</button></div><!--]-->`);
          } else {
            _push2(`<!---->`);
          }
          if (settingsType.value === "privacy") {
            _push2(`<!--[--><h4 class="section-title" data-v-2129aae7>隐私设置</h4><div class="settings-section" data-v-2129aae7><div class="privacy-options" data-v-2129aae7><label class="privacy-item" data-v-2129aae7><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(privacySettings.value.showEmail) ? ssrLooseContain(privacySettings.value.showEmail, null) : privacySettings.value.showEmail) ? " checked" : ""} data-v-2129aae7><div class="privacy-info" data-v-2129aae7><span class="privacy-title" data-v-2129aae7>显示邮箱</span><span class="privacy-desc" data-v-2129aae7>在个人资料中公开显示邮箱地址</span></div></label><label class="privacy-item" data-v-2129aae7><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(privacySettings.value.showStats) ? ssrLooseContain(privacySettings.value.showStats, null) : privacySettings.value.showStats) ? " checked" : ""} data-v-2129aae7><div class="privacy-info" data-v-2129aae7><span class="privacy-title" data-v-2129aae7>游戏数据</span><span class="privacy-desc" data-v-2129aae7>允许他人查看我的游戏统计数据</span></div></label><label class="privacy-item" data-v-2129aae7><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(privacySettings.value.publicProfile) ? ssrLooseContain(privacySettings.value.publicProfile, null) : privacySettings.value.publicProfile) ? " checked" : ""} data-v-2129aae7><div class="privacy-info" data-v-2129aae7><span class="privacy-title" data-v-2129aae7>公开资料</span><span class="privacy-desc" data-v-2129aae7>任何人都可以查看我的个人资料</span></div></label></div>`);
            if (settingsError.value) {
              _push2(`<div class="error-message" data-v-2129aae7>${ssrInterpolate(settingsError.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (settingsMessage.value) {
              _push2(`<div class="success-message" data-v-2129aae7>${ssrInterpolate(settingsMessage.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="primary-btn"${ssrIncludeBooleanAttr(settingsLoading.value) ? " disabled" : ""} data-v-2129aae7>${ssrInterpolate(settingsLoading.value ? "保存中..." : "保存设置")}</button></div><!--]-->`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/UserAuth.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const UserAuth = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-2129aae7"]]);
const _sfc_main$1 = {
  __name: "NavBarAuth",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "nav-bar-auth" }, _attrs))} data-v-2052dfab>`);
      _push(ssrRenderComponent(UserAuth, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/NavBarAuth.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const NavBarAuth = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-2052dfab"]]);
const _sfc_main = {
  __name: "Layout",
  __ssrInlineRender: true,
  setup(__props) {
    const { Layout: Layout2 } = theme;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Layout2), _attrs, {
        "nav-bar-content-after": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(NavBarAuth, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(NavBarAuth)
            ];
          }
        }),
        "layout-bottom": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(Timer, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(Timer)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/Layout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const RawTheme = {
  extends: theme,
  Layout: _sfc_main,
  enhanceApp({ app }) {
    app.component("Timer", Timer);
    app.component("UserAuth", UserAuth);
    app.component("NavBarAuth", NavBarAuth);
    app.component("UserProfile", UserProfile);
  }
};
const ClientOnly = defineComponent({
  setup(_, { slots }) {
    const show = ref(false);
    onMounted(() => {
      show.value = true;
    });
    return () => show.value && slots.default ? slots.default() : null;
  }
});
function useCodeGroups() {
  if (inBrowser) {
    window.addEventListener("click", (e) => {
      var _a;
      const el = e.target;
      if (el.matches(".vp-code-group input")) {
        const group = (_a = el.parentElement) == null ? void 0 : _a.parentElement;
        if (!group)
          return;
        const i = Array.from(group.querySelectorAll("input")).indexOf(el);
        if (i < 0)
          return;
        const blocks = group.querySelector(".blocks");
        if (!blocks)
          return;
        const current = Array.from(blocks.children).find((child) => child.classList.contains("active"));
        if (!current)
          return;
        const next = blocks.children[i];
        if (!next || current === next)
          return;
        current.classList.remove("active");
        next.classList.add("active");
        const label = group == null ? void 0 : group.querySelector(`label[for="${el.id}"]`);
        label == null ? void 0 : label.scrollIntoView({ block: "nearest" });
      }
    });
  }
}
function useCopyCode() {
  if (inBrowser) {
    const timeoutIdMap = /* @__PURE__ */ new WeakMap();
    window.addEventListener("click", (e) => {
      var _a;
      const el = e.target;
      if (el.matches('div[class*="language-"] > button.copy')) {
        const parent = el.parentElement;
        const sibling = (_a = el.nextElementSibling) == null ? void 0 : _a.nextElementSibling;
        if (!parent || !sibling) {
          return;
        }
        const isShell = /language-(shellscript|shell|bash|sh|zsh)/.test(parent.className);
        const ignoredNodes = [".vp-copy-ignore", ".diff.remove"];
        const clone = sibling.cloneNode(true);
        clone.querySelectorAll(ignoredNodes.join(",")).forEach((node) => node.remove());
        let text = clone.textContent || "";
        if (isShell) {
          text = text.replace(/^ *(\$|>) /gm, "").trim();
        }
        copyToClipboard(text).then(() => {
          el.classList.add("copied");
          clearTimeout(timeoutIdMap.get(el));
          const timeoutId = setTimeout(() => {
            el.classList.remove("copied");
            el.blur();
            timeoutIdMap.delete(el);
          }, 2e3);
          timeoutIdMap.set(el, timeoutId);
        });
      }
    });
  }
}
async function copyToClipboard(text) {
  try {
    return navigator.clipboard.writeText(text);
  } catch {
    const element = document.createElement("textarea");
    const previouslyFocusedElement = document.activeElement;
    element.value = text;
    element.setAttribute("readonly", "");
    element.style.contain = "strict";
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.style.fontSize = "12pt";
    const selection = document.getSelection();
    const originalRange = selection ? selection.rangeCount > 0 && selection.getRangeAt(0) : null;
    document.body.appendChild(element);
    element.select();
    element.selectionStart = 0;
    element.selectionEnd = text.length;
    document.execCommand("copy");
    document.body.removeChild(element);
    if (originalRange) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }
}
function useUpdateHead(route, siteDataByRouteRef) {
  let isFirstUpdate = true;
  let managedHeadElements = [];
  const updateHeadTags = (newTags) => {
    if (isFirstUpdate) {
      isFirstUpdate = false;
      newTags.forEach((tag) => {
        const headEl = createHeadElement(tag);
        for (const el of document.head.children) {
          if (el.isEqualNode(headEl)) {
            managedHeadElements.push(el);
            return;
          }
        }
      });
      return;
    }
    const newElements = newTags.map(createHeadElement);
    managedHeadElements.forEach((oldEl, oldIndex) => {
      const matchedIndex = newElements.findIndex((newEl) => newEl == null ? void 0 : newEl.isEqualNode(oldEl ?? null));
      if (matchedIndex !== -1) {
        delete newElements[matchedIndex];
      } else {
        oldEl == null ? void 0 : oldEl.remove();
        delete managedHeadElements[oldIndex];
      }
    });
    newElements.forEach((el) => el && document.head.appendChild(el));
    managedHeadElements = [...managedHeadElements, ...newElements].filter(Boolean);
  };
  watchEffect(() => {
    const pageData = route.data;
    const siteData = siteDataByRouteRef.value;
    const pageDescription = pageData && pageData.description;
    const frontmatterHead = pageData && pageData.frontmatter.head || [];
    const title = createTitle(siteData, pageData);
    if (title !== document.title) {
      document.title = title;
    }
    const description = pageDescription || siteData.description;
    let metaDescriptionElement = document.querySelector(`meta[name=description]`);
    if (metaDescriptionElement) {
      if (metaDescriptionElement.getAttribute("content") !== description) {
        metaDescriptionElement.setAttribute("content", description);
      }
    } else {
      createHeadElement(["meta", { name: "description", content: description }]);
    }
    updateHeadTags(mergeHead(siteData.head, filterOutHeadDescription(frontmatterHead)));
  });
}
function createHeadElement([tag, attrs, innerHTML]) {
  const el = document.createElement(tag);
  for (const key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  if (innerHTML) {
    el.innerHTML = innerHTML;
  }
  if (tag === "script" && attrs.async == null) {
    el.async = false;
  }
  return el;
}
function isMetaDescription(headConfig) {
  return headConfig[0] === "meta" && headConfig[1] && headConfig[1].name === "description";
}
function filterOutHeadDescription(head) {
  return head.filter((h2) => !isMetaDescription(h2));
}
const hasFetched = /* @__PURE__ */ new Set();
const createLink = () => document.createElement("link");
const viaDOM = (url) => {
  const link2 = createLink();
  link2.rel = `prefetch`;
  link2.href = url;
  document.head.appendChild(link2);
};
const viaXHR = (url) => {
  const req = new XMLHttpRequest();
  req.open("GET", url, req.withCredentials = true);
  req.send();
};
let link;
const doFetch = inBrowser && (link = createLink()) && link.relList && link.relList.supports && link.relList.supports("prefetch") ? viaDOM : viaXHR;
function usePrefetch() {
  if (!inBrowser) {
    return;
  }
  if (!window.IntersectionObserver) {
    return;
  }
  let conn;
  if ((conn = navigator.connection) && (conn.saveData || /2g/.test(conn.effectiveType))) {
    return;
  }
  const rIC = window.requestIdleCallback || setTimeout;
  let observer = null;
  const observeLinks = () => {
    if (observer) {
      observer.disconnect();
    }
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link2 = entry.target;
          observer.unobserve(link2);
          const { pathname } = link2;
          if (!hasFetched.has(pathname)) {
            hasFetched.add(pathname);
            const pageChunkPath = pathToFile(pathname);
            if (pageChunkPath)
              doFetch(pageChunkPath);
          }
        }
      });
    });
    rIC(() => {
      document.querySelectorAll("#app a").forEach((link2) => {
        const { hostname, pathname } = new URL(link2.href instanceof SVGAnimatedString ? link2.href.animVal : link2.href, link2.baseURI);
        const extMatch = pathname.match(/\.\w+$/);
        if (extMatch && extMatch[0] !== ".html") {
          return;
        }
        if (
          // only prefetch same tab navigation, since a new tab will load
          // the lean js chunk instead.
          link2.target !== "_blank" && // only prefetch inbound links
          hostname === location.hostname
        ) {
          if (pathname !== location.pathname) {
            observer.observe(link2);
          } else {
            hasFetched.add(pathname);
          }
        }
      });
    });
  };
  onMounted(observeLinks);
  const route = useRoute();
  watch(() => route.path, observeLinks);
  onUnmounted(() => {
    observer && observer.disconnect();
  });
}
function resolveThemeExtends(theme2) {
  if (theme2.extends) {
    const base = resolveThemeExtends(theme2.extends);
    return {
      ...base,
      ...theme2,
      async enhanceApp(ctx) {
        if (base.enhanceApp)
          await base.enhanceApp(ctx);
        if (theme2.enhanceApp)
          await theme2.enhanceApp(ctx);
      }
    };
  }
  return theme2;
}
const Theme = resolveThemeExtends(RawTheme);
const VitePressApp = defineComponent({
  name: "VitePressApp",
  setup() {
    const { site, lang, dir } = useData();
    onMounted(() => {
      watchEffect(() => {
        document.documentElement.lang = lang.value;
        document.documentElement.dir = dir.value;
      });
    });
    if (site.value.router.prefetchLinks) {
      usePrefetch();
    }
    useCopyCode();
    useCodeGroups();
    if (Theme.setup)
      Theme.setup();
    return () => h(Theme.Layout);
  }
});
async function createApp() {
  globalThis.__VITEPRESS__ = true;
  const router = newRouter();
  const app = newApp();
  app.provide(RouterSymbol, router);
  const data = initData(router.route);
  app.provide(dataSymbol, data);
  app.component("Content", Content);
  app.component("ClientOnly", ClientOnly);
  Object.defineProperties(app.config.globalProperties, {
    $frontmatter: {
      get() {
        return data.frontmatter.value;
      }
    },
    $params: {
      get() {
        return data.page.value.params;
      }
    }
  });
  if (Theme.enhanceApp) {
    await Theme.enhanceApp({
      app,
      router,
      siteData: siteDataRef
    });
  }
  return { app, router, data };
}
function newApp() {
  return createSSRApp(VitePressApp);
}
function newRouter() {
  let isInitialPageLoad = inBrowser;
  return createRouter((path) => {
    let pageFilePath = pathToFile(path);
    let pageModule = null;
    if (pageFilePath) {
      if (isInitialPageLoad) {
        pageFilePath = pageFilePath.replace(/\.js$/, ".lean.js");
      }
      if (false) ;
      else {
        pageModule = import(
          /*@vite-ignore*/
          pageFilePath
        );
      }
    }
    if (inBrowser) {
      isInitialPageLoad = false;
    }
    return pageModule;
  }, Theme.NotFound);
}
if (inBrowser) {
  createApp().then(({ app, router, data }) => {
    router.go().then(() => {
      useUpdateHead(router.route, data.site);
      app.mount("#app");
    });
  });
}
async function render(path) {
  const { app, router } = await createApp();
  await router.go(path);
  const ctx = { content: "", vpSocialIcons: /* @__PURE__ */ new Set() };
  ctx.content = await renderToString(app, ctx);
  return ctx;
}
export {
  render
};
