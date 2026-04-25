import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { U as UserProfile } from "./UserProfile.C895egQx.js";
import { useSSRContext } from "vue";
import "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"用户中心","description":"","frontmatter":{},"headers":[],"relativePath":"user.md","filePath":"user.md"}');
const __default__ = { name: "user.md" };
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="用户中心" tabindex="-1">用户中心 <a class="header-anchor" href="#用户中心" aria-label="Permalink to &quot;用户中心&quot;">​</a></h1>`);
      _push(ssrRenderComponent(UserProfile, null, null, _parent));
      _push(`<h2 id="功能介绍" tabindex="-1">功能介绍 <a class="header-anchor" href="#功能介绍" aria-label="Permalink to &quot;功能介绍&quot;">​</a></h2><p>登录后你可以：</p><ul><li>同步游戏数据到云端</li><li>保存游戏进度</li><li>访问专属内容</li></ul><h2 id="登录状态" tabindex="-1">登录状态 <a class="header-anchor" href="#登录状态" aria-label="Permalink to &quot;登录状态&quot;">​</a></h2><p>上面的卡片显示了你的当前登录状态。</p><p>如果你还没有登录，点击导航栏右上角的「登录」按钮即可开始！</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("user.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  __pageData,
  _sfc_main as default
};
