import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"所有产品","description":"","frontmatter":{},"headers":[],"relativePath":"products.md","filePath":"products.md"}');
const _sfc_main = { name: "products.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="所有产品" tabindex="-1">所有产品 <a class="header-anchor" href="#所有产品" aria-label="Permalink to &quot;所有产品&quot;">​</a></h1><p>欢迎来到 QJOL Studios 产品中心！</p><hr><h2 id="🚌-wearbus" tabindex="-1">🚌 WearBus <a class="header-anchor" href="#🚌-wearbus" aria-label="Permalink to &quot;🚌 WearBus&quot;">​</a></h2><p>一个为所有安卓用户打造的简洁公交 App</p><h3 id="产品简介" tabindex="-1">产品简介 <a class="header-anchor" href="#产品简介" aria-label="Permalink to &quot;产品简介&quot;">​</a></h3><p>这是一个为低性能Android用户制作的轻量级公交查询app！</p><p>（如果细心的话，或许可以发现作者的小巧思哦！）</p><h3 id="下载" tabindex="-1">下载 <a class="header-anchor" href="#下载" aria-label="Permalink to &quot;下载&quot;">​</a></h3><p><a href="/download.html">前往下载中心</a></p><hr><h2 id="🎮-project-celestial-mandate" tabindex="-1">🎮 Project：Celestial Mandate <a class="header-anchor" href="#🎮-project-celestial-mandate" aria-label="Permalink to &quot;🎮 Project：Celestial Mandate&quot;">​</a></h2><p>QJOL Studios 开发的 2D 开放世界游戏</p><h3 id="产品简介-1" tabindex="-1">产品简介 <a class="header-anchor" href="#产品简介-1" aria-label="Permalink to &quot;产品简介&quot;">​</a></h3><p>这是一个2D开放世界游戏，敬请期待！</p><h3 id="开发状态" tabindex="-1">开发状态 <a class="header-anchor" href="#开发状态" aria-label="Permalink to &quot;开发状态&quot;">​</a></h3><p><strong>敬请期待...</strong></p><hr><h2 id="🌸-婵之云" tabindex="-1">🌸 婵之云 <a class="header-anchor" href="#🌸-婵之云" aria-label="Permalink to &quot;🌸 婵之云&quot;">​</a></h2><p>QJOL Studios 开发的二次元古风单机卡牌对战游戏</p><h3 id="产品简介-2" tabindex="-1">产品简介 <a class="header-anchor" href="#产品简介-2" aria-label="Permalink to &quot;产品简介&quot;">​</a></h3><p>这是一款由QJOL Studios开发的二次元古风单机卡牌对战游戏</p><h3 id="开发状态-1" tabindex="-1">开发状态 <a class="header-anchor" href="#开发状态-1" aria-label="Permalink to &quot;开发状态&quot;">​</a></h3><p><strong>Demo 版本已发布，欢迎下载体验！</strong></p><hr><p>更多产品正在开发中，敬请关注！</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("products.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const products = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  products as default
};
