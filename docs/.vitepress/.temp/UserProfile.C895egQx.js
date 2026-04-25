import { computed, ref, onMounted, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const _sfc_main = {
  __name: "UserProfile",
  __ssrInlineRender: true,
  props: {
    showLoginModal: Function
  },
  setup(__props) {
    const formattedUID = computed(() => {
      var _a;
      const uid = (_a = userData.value) == null ? void 0 : _a.uid;
      if (!uid && uid !== 0) return "未知";
      return String(uid).padStart(7, "0");
    });
    const user = ref(null);
    const userData = ref(null);
    const loading = ref(true);
    const error = ref("");
    const avatarUrl = ref("");
    let supabase = null;
    async function initSupabase() {
      if (typeof window === "undefined") return;
      const { createClient } = await import("./index.DLboA9mS.js");
      const SUPABASE_URL = "https://ornvxqtykdmafokmwwnr.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnZ4cXR5a2RtYWZva213d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTAzNDAsImV4cCI6MjA5MTUyNjM0MH0.1zFgq_EC6JHmMTzRPDW11JKl7ltBzdjH2EMXvioJPqI";
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    async function loadUserData() {
      loading.value = true;
      error.value = "";
      try {
        await initSupabase();
        if (!supabase) return;
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (session) {
          user.value = session.user;
          const combinedData = {
            uid: null,
            play_time_seconds: 0,
            total_pulls: 0,
            ur_count: 0,
            ssr_count: 0
          };
          const { data: userRecord, error: userError } = await supabase.from("users").select("uid, username, avatar_url, last_logout").eq("id", session.user.id).single();
          if (userError && userError.code !== "PGRST116") {
            console.warn("获取用户数据失败:", userError);
          }
          if (userRecord) {
            combinedData.uid = userRecord.uid;
            combinedData.username = userRecord.username || session.user.email.split("@")[0];
            combinedData.last_logout = userRecord.last_logout;
            if (userRecord.avatar_url) {
              avatarUrl.value = userRecord.avatar_url;
            }
          }
          const { data: gameData, error: gameError } = await supabase.from("user_data").select("progress").eq("user_id", session.user.id).single();
          if (gameError && gameError.code !== "PGRST116") {
            console.warn("获取游戏数据失败:", gameError);
          }
          if (gameData && gameData.progress) {
            combinedData.play_time_seconds = gameData.progress.total_play_time || 0;
          }
          const { data: gachaRecords, error: gachaError } = await supabase.from("gacha_history").select("rarity").eq("user_id", session.user.id);
          if (gachaError) {
            console.warn("获取抽卡记录失败:", gachaError);
          }
          if (gachaRecords) {
            combinedData.total_pulls = gachaRecords.length;
            combinedData.ur_count = gachaRecords.filter((r) => r.rarity === "UR").length;
            combinedData.ssr_count = gachaRecords.filter((r) => r.rarity === "SSR").length;
          }
          userData.value = combinedData;
        } else {
          user.value = null;
          userData.value = null;
        }
      } catch (err) {
        console.error("加载用户数据失败:", err);
        error.value = "加载用户信息失败，请稍后重试";
      } finally {
        loading.value = false;
      }
    }
    function formatDate(dateString) {
      if (!dateString) return "未知";
      let utcString = dateString;
      if (!dateString.endsWith("Z") && !dateString.includes("+")) {
        utcString = dateString + "Z";
      }
      const date = new Date(utcString);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Shanghai"
      });
    }
    function formatPlayTime(seconds) {
      if (!seconds) return "0秒";
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const secs = seconds % 60;
      let result = "";
      if (hours > 0) result += `${hours}小时`;
      if (minutes > 0) result += `${minutes}分`;
      if (secs > 0 || result === "") result += `${secs}秒`;
      return result;
    }
    onMounted(async () => {
      await initSupabase();
      if (supabase) {
        const { error: error2 } = await supabase.auth.refreshSession();
        if (error2) {
          console.log("会话刷新失败:", error2);
          await supabase.auth.signOut();
        }
      }
      loadUserData();
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "user-profile-container" }, _attrs))} data-v-af1c79d9>`);
      if (loading.value) {
        _push(`<div class="loading-state" data-v-af1c79d9><div class="spinner" data-v-af1c79d9></div><p data-v-af1c79d9>正在加载用户信息...</p></div>`);
      } else if (error.value) {
        _push(`<div class="error-state" data-v-af1c79d9><p data-v-af1c79d9>❌ ${ssrInterpolate(error.value)}</p><button class="retry-btn" data-v-af1c79d9>重试</button></div>`);
      } else if (user.value) {
        _push(`<div class="user-profile" data-v-af1c79d9><div class="profile-card main-card" data-v-af1c79d9><div class="avatar-section" data-v-af1c79d9><div class="user-avatar-large" data-v-af1c79d9>`);
        if (avatarUrl.value) {
          _push(`<img${ssrRenderAttr("src", avatarUrl.value)} alt="头像" class="avatar-img" data-v-af1c79d9>`);
        } else {
          _push(`<span data-v-af1c79d9>${ssrInterpolate(((_a = user.value.email) == null ? void 0 : _a.charAt(0).toUpperCase()) || "U")}</span>`);
        }
        _push(`</div></div><div class="info-section" data-v-af1c79d9><h2 class="user-name" data-v-af1c79d9>${ssrInterpolate(((_b = userData.value) == null ? void 0 : _b.username) || user.value.email.split("@")[0])}</h2><p class="user-email-sub" data-v-af1c79d9>${ssrInterpolate(user.value.email)}</p><div class="user-meta" data-v-af1c79d9><span class="meta-item" data-v-af1c79d9><span class="meta-label" data-v-af1c79d9>UID:</span><span class="meta-value" data-v-af1c79d9>${ssrInterpolate(formattedUID.value)}</span></span><span class="meta-item" data-v-af1c79d9><span class="meta-label" data-v-af1c79d9>注册时间:</span><span class="meta-value" data-v-af1c79d9>${ssrInterpolate(formatDate(user.value.created_at))}</span></span><span class="meta-item" data-v-af1c79d9><span class="meta-label" data-v-af1c79d9>最后登录:</span><span class="meta-value" data-v-af1c79d9>${ssrInterpolate(formatDate(user.value.last_sign_in_at))}</span></span>`);
        if ((_c = userData.value) == null ? void 0 : _c.last_logout) {
          _push(`<span class="meta-item" data-v-af1c79d9><span class="meta-label" data-v-af1c79d9>最后下线:</span><span class="meta-value" data-v-af1c79d9>${ssrInterpolate(formatDate(userData.value.last_logout))}</span></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="stats-grid" data-v-af1c79d9><div class="stat-card" data-v-af1c79d9><div class="stat-icon" data-v-af1c79d9>🎲</div><div class="stat-content" data-v-af1c79d9><div class="stat-value" data-v-af1c79d9>${ssrInterpolate(((_d = userData.value) == null ? void 0 : _d.total_pulls) || 0)}</div><div class="stat-label" data-v-af1c79d9>总抽卡数</div></div></div><div class="stat-card" data-v-af1c79d9><div class="stat-icon" data-v-af1c79d9>🔴</div><div class="stat-content" data-v-af1c79d9><div class="stat-value" data-v-af1c79d9>${ssrInterpolate(((_e = userData.value) == null ? void 0 : _e.ur_count) || 0)}</div><div class="stat-label" data-v-af1c79d9>UR 获得</div></div></div><div class="stat-card" data-v-af1c79d9><div class="stat-icon" data-v-af1c79d9>🟡</div><div class="stat-content" data-v-af1c79d9><div class="stat-value" data-v-af1c79d9>${ssrInterpolate(((_f = userData.value) == null ? void 0 : _f.ssr_count) || 0)}</div><div class="stat-label" data-v-af1c79d9>SSR 获得</div></div></div><div class="stat-card" data-v-af1c79d9><div class="stat-icon" data-v-af1c79d9>⏱️</div><div class="stat-content" data-v-af1c79d9><div class="stat-value" data-v-af1c79d9>${ssrInterpolate(formatPlayTime((_g = userData.value) == null ? void 0 : _g.play_time_seconds))}</div><div class="stat-label" data-v-af1c79d9>游戏时长</div></div></div></div><div class="quick-actions" data-v-af1c79d9><h3 data-v-af1c79d9>快速操作</h3><div class="action-buttons" data-v-af1c79d9><a href="/gacha-analyzer" class="action-btn primary" data-v-af1c79d9><span class="btn-icon" data-v-af1c79d9>📊</span><span class="btn-text" data-v-af1c79d9>查看抽卡分析</span></a><a href="/download" class="action-btn" data-v-af1c79d9><span class="btn-icon" data-v-af1c79d9>⬇️</span><span class="btn-text" data-v-af1c79d9>下载游戏</span></a></div></div></div>`);
      } else {
        _push(`<div class="guest-state" data-v-af1c79d9><div class="guest-icon" data-v-af1c79d9>👤</div><h3 data-v-af1c79d9>游客模式</h3><p data-v-af1c79d9>登录后可以同步游戏数据、查看抽卡记录等</p><button class="login-prompt-btn" data-v-af1c79d9>立即登录</button></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/UserProfile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const UserProfile = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-af1c79d9"]]);
export {
  UserProfile as U
};
