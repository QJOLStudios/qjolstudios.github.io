import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrRenderComponent, ssrRenderAttr } from "vue/server-renderer";
import { ref, computed, onMounted, onUnmounted, watch, mergeProps, useSSRContext } from "vue";
import * as echarts from "echarts";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const _imports_0 = "/assets/%E7%88%86%E7%8E%87%E6%9B%B2%E7%BA%BF.D2bIMNwX.png";
const pageSize = 20;
const _sfc_main$1 = {
  __name: "GachaAnalyzer",
  __ssrInlineRender: true,
  setup(__props) {
    const jsonInput = ref("");
    const data = ref(null);
    const error = ref("");
    const currentPage = ref(1);
    const cloudLoading = ref(false);
    const cloudError = ref("");
    const chartRef = ref(null);
    let chartInstance = null;
    const actualURRate = computed(() => {
      if (!data.value) return 0;
      return (data.value.summary.ur_count / data.value.summary.total_pulls * 100).toFixed(2);
    });
    const actualSSRRate = computed(() => {
      if (!data.value) return 0;
      return (data.value.summary.ssr_count / data.value.summary.total_pulls * 100).toFixed(2);
    });
    const actualSRRate = computed(() => {
      if (!data.value) return 0;
      return (data.value.summary.sr_count / data.value.summary.total_pulls * 100).toFixed(2);
    });
    const urPulls = computed(() => {
      if (!data.value) return [];
      return data.value.records.filter((r) => r.rarity_code === 2);
    });
    const urIntervals = computed(() => {
      if (!urPulls.value.length) return [];
      const intervals = [];
      let lastURTotalPulls = 0;
      for (const pull of urPulls.value) {
        const interval = pull.total_pulls - lastURTotalPulls;
        intervals.push(interval);
        lastURTotalPulls = pull.total_pulls;
      }
      return intervals;
    });
    computed(() => {
      if (!urIntervals.value.length) return 0;
      return Math.max(...urIntervals.value);
    });
    const getIntervalAt = (index) => {
      if (!urIntervals.value.length || index >= urIntervals.value.length) return 0;
      return urIntervals.value[index];
    };
    const chartData = computed(() => {
      if (!urPulls.value.length) return [];
      return urPulls.value.map((pull, index) => {
        const timestamp = new Date(pull.timestamp).getTime();
        const interval = getIntervalAt(index);
        return {
          name: `第 ${index + 1} 次出货`,
          value: [timestamp, interval],
          pullData: pull
        };
      });
    });
    const getChartOption = () => {
      if (!chartData.value.length) return {};
      const timestamps = chartData.value.map((item) => item.value[0]);
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const timeRange = maxTime - minTime || 1;
      return {
        tooltip: {
          trigger: "item",
          backgroundColor: "var(--vp-c-bg)",
          borderColor: "var(--vp-c-divider)",
          textStyle: {
            color: "var(--vp-c-text-1)"
          },
          formatter: (params) => {
            const date = new Date(params.value[0]);
            const timeStr = date.toLocaleString("zh-CN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
            return `
          <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
          <div>出货时间: ${timeStr}</div>
          <div>花费抽数: ${params.value[1]} 抽</div>
        `;
          }
        },
        grid: {
          left: "60px",
          right: "40px",
          top: "40px",
          bottom: "60px",
          containLabel: true
        },
        xAxis: {
          type: "time",
          name: "出货时间",
          nameLocation: "middle",
          nameGap: 35,
          min: minTime - timeRange * 0.05,
          max: maxTime + timeRange * 0.05,
          axisLine: {
            lineStyle: {
              color: "var(--vp-c-text-2)"
            }
          },
          axisLabel: {
            color: "var(--vp-c-text-2)",
            formatter: (value) => {
              const date = new Date(value);
              return date.toLocaleDateString("zh-CN", {
                month: "numeric",
                day: "numeric"
              });
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "var(--vp-c-divider)",
              type: "dashed"
            }
          }
        },
        yAxis: {
          type: "value",
          name: "抽数",
          nameLocation: "middle",
          nameGap: 40,
          min: 0,
          axisLine: {
            lineStyle: {
              color: "var(--vp-c-text-2)"
            }
          },
          axisLabel: {
            color: "var(--vp-c-text-2)",
            formatter: "{value}"
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "var(--vp-c-divider)",
              type: "dashed"
            }
          }
        },
        series: [
          {
            type: "scatter",
            symbolSize: 14,
            itemStyle: {
              color: "#f44",
              shadowBlur: 10,
              shadowColor: "rgba(244, 68, 68, 0.5)"
            },
            emphasis: {
              itemStyle: {
                color: "#f66",
                shadowBlur: 20,
                shadowColor: "rgba(244, 68, 68, 0.8)"
              },
              scale: 1.5
            },
            data: chartData.value
          }
        ]
      };
    };
    const initChart = () => {
      if (!chartRef.value) return;
      chartInstance = echarts.init(chartRef.value);
      chartInstance.setOption(getChartOption());
      window.addEventListener("resize", handleResize);
    };
    const updateChart = () => {
      if (chartInstance) {
        chartInstance.setOption(getChartOption(), true);
      }
    };
    const disposeChart = () => {
      if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
        window.removeEventListener("resize", handleResize);
      }
    };
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };
    onMounted(() => {
      if (data.value && urPulls.value.length > 0) {
        initChart();
      }
    });
    onUnmounted(() => {
      disposeChart();
    });
    watch([() => data.value, urPulls], () => {
      if (data.value && urPulls.value.length > 0) {
        if (!chartInstance) {
          initChart();
        } else {
          updateChart();
        }
      } else {
        disposeChart();
      }
    }, { deep: true });
    const avgURPity = computed(() => {
      if (!urIntervals.value.length) return "N/A";
      const totalInterval = urIntervals.value.reduce((sum, interval) => sum + interval, 0);
      return (totalInterval / urIntervals.value.length).toFixed(1);
    });
    const maxPity = computed(() => {
      if (!urIntervals.value.length) return "N/A";
      return Math.max(...urIntervals.value);
    });
    const minURPity = computed(() => {
      if (!urIntervals.value.length) return "N/A";
      return Math.min(...urIntervals.value);
    });
    const paginatedRecords = computed(() => {
      if (!data.value) return [];
      const start = (currentPage.value - 1) * pageSize;
      const end = start + pageSize;
      return data.value.records.slice(start, end);
    });
    const totalPages = computed(() => {
      if (!data.value) return 0;
      return Math.ceil(data.value.records.length / pageSize);
    });
    const getRarityClass = (code) => {
      const classes = ["sr", "ssr", "ur"];
      return classes[code] || "sr";
    };
    const formatTime = (timestamp) => {
      if (!timestamp) return "-";
      const date = new Date(timestamp);
      return date.toLocaleString("zh-CN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "gacha-analyzer" }, _attrs))} data-v-3ad78643><div class="input-section" data-v-3ad78643><h3 data-v-3ad78643>📋 粘贴抽卡记录</h3><textarea placeholder="请将从游戏中复制的 JSON 数据粘贴到这里..." class="json-input" rows="8" data-v-3ad78643>${ssrInterpolate(jsonInput.value)}</textarea><div class="button-group" data-v-3ad78643><button class="btn-primary" data-v-3ad78643>🔍 分析数据</button><button class="btn-cloud"${ssrIncludeBooleanAttr(cloudLoading.value) ? " disabled" : ""} data-v-3ad78643>`);
      if (cloudLoading.value) {
        _push(`<span data-v-3ad78643>⏳ 加载中...</span>`);
      } else {
        _push(`<span data-v-3ad78643>☁️ 从云端获取</span>`);
      }
      _push(`</button><button class="btn-secondary" data-v-3ad78643>🗑️ 清空</button><button class="btn-secondary" data-v-3ad78643>📖 加载示例</button></div>`);
      if (cloudError.value) {
        _push(`<div class="cloud-error" data-v-3ad78643> ⚠️ ${ssrInterpolate(cloudError.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (error.value) {
        _push(`<div class="error-message" data-v-3ad78643> ❌ ${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (data.value && !error.value) {
        _push(`<div class="results-section" data-v-3ad78643><div class="overview-cards" data-v-3ad78643><div class="stat-card total" data-v-3ad78643><div class="stat-icon" data-v-3ad78643>🎲</div><div class="stat-content" data-v-3ad78643><div class="stat-value" data-v-3ad78643>${ssrInterpolate(data.value.summary.total_pulls)}</div><div class="stat-label" data-v-3ad78643>总抽卡数</div></div></div><div class="stat-card ur" data-v-3ad78643><div class="stat-icon" data-v-3ad78643>🔴</div><div class="stat-content" data-v-3ad78643><div class="stat-value" data-v-3ad78643>${ssrInterpolate(data.value.summary.ur_count)}</div><div class="stat-label" data-v-3ad78643>UR (传说)</div></div></div><div class="stat-card ssr" data-v-3ad78643><div class="stat-icon" data-v-3ad78643>🟡</div><div class="stat-content" data-v-3ad78643><div class="stat-value" data-v-3ad78643>${ssrInterpolate(data.value.summary.ssr_count)}</div><div class="stat-label" data-v-3ad78643>SSR (稀有)</div></div></div><div class="stat-card sr" data-v-3ad78643><div class="stat-icon" data-v-3ad78643>🔵</div><div class="stat-content" data-v-3ad78643><div class="stat-value" data-v-3ad78643>${ssrInterpolate(data.value.summary.sr_count)}</div><div class="stat-label" data-v-3ad78643>SR (普通)</div></div></div></div><div class="probability-section" data-v-3ad78643><h3 data-v-3ad78643>📊 概率统计</h3><div class="probability-grid" data-v-3ad78643><div class="prob-item" data-v-3ad78643><span class="prob-label" data-v-3ad78643>实际 UR 率:</span><span class="prob-value ur-rate" data-v-3ad78643>${ssrInterpolate(actualURRate.value)}%</span><span class="prob-compare" data-v-3ad78643>(理论: 0.8%)</span></div><div class="prob-item" data-v-3ad78643><span class="prob-label" data-v-3ad78643>实际 SSR 率:</span><span class="prob-value ssr-rate" data-v-3ad78643>${ssrInterpolate(actualSSRRate.value)}%</span><span class="prob-compare" data-v-3ad78643>(理论: 12%)</span></div><div class="prob-item" data-v-3ad78643><span class="prob-label" data-v-3ad78643>实际 SR 率:</span><span class="prob-value sr-rate" data-v-3ad78643>${ssrInterpolate(actualSRRate.value)}%</span><span class="prob-compare" data-v-3ad78643>(理论: 87.2%)</span></div><div class="prob-item" data-v-3ad78643><span class="prob-label" data-v-3ad78643>当前保底:</span><span class="prob-value pity" data-v-3ad78643>${ssrInterpolate(data.value.summary.current_pity)}/60</span></div></div></div><div class="pity-analysis" data-v-3ad78643><h3 data-v-3ad78643>🎯 保底分析</h3><div class="pity-stats" data-v-3ad78643><div class="pity-item" data-v-3ad78643><span data-v-3ad78643>平均出 UR 抽数:</span><span class="highlight" data-v-3ad78643>${ssrInterpolate(avgURPity.value)} 抽</span></div><div class="pity-item" data-v-3ad78643><span data-v-3ad78643>最长保底记录:</span><span class="highlight" data-v-3ad78643>${ssrInterpolate(maxPity.value)} 抽</span></div><div class="pity-item" data-v-3ad78643><span data-v-3ad78643>最短出 UR 抽数:</span><span class="highlight" data-v-3ad78643>${ssrInterpolate(minURPity.value)} 抽</span></div></div></div><div class="timeline-section" data-v-3ad78643><h3 data-v-3ad78643>📈 UR 出货散点图</h3><div class="scatter-chart" data-v-3ad78643><div class="echarts-container" data-v-3ad78643></div></div><div class="timeline-legend" data-v-3ad78643><span data-v-3ad78643>🔴 每个点代表一次 UR 出货，横轴为出货时间，纵轴为花费抽数</span></div></div><div class="records-section" data-v-3ad78643><h3 data-v-3ad78643>📝 详细记录</h3><div class="table-container" data-v-3ad78643><table class="records-table" data-v-3ad78643><thead data-v-3ad78643><tr data-v-3ad78643><th data-v-3ad78643>序号</th><th data-v-3ad78643>时间</th><th data-v-3ad78643>稀有度</th><th data-v-3ad78643>保底前</th><th data-v-3ad78643>保底后</th><th data-v-3ad78643>累计抽数</th></tr></thead><tbody data-v-3ad78643><!--[-->`);
        ssrRenderList(paginatedRecords.value, (record, index) => {
          _push(`<tr class="${ssrRenderClass(getRarityClass(record.rarity_code))}" data-v-3ad78643><td data-v-3ad78643>${ssrInterpolate((currentPage.value - 1) * pageSize + index + 1)}</td><td data-v-3ad78643>${ssrInterpolate(formatTime(record.timestamp))}</td><td data-v-3ad78643><span class="${ssrRenderClass(["rarity-badge", getRarityClass(record.rarity_code)])}" data-v-3ad78643>${ssrInterpolate(record.rarity)}</span></td><td data-v-3ad78643>${ssrInterpolate(record.pity_before)}</td><td data-v-3ad78643>${ssrInterpolate(record.pity_after)}</td><td data-v-3ad78643>${ssrInterpolate(record.total_pulls)}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div><div class="pagination" data-v-3ad78643><button${ssrIncludeBooleanAttr(currentPage.value <= 1) ? " disabled" : ""} class="btn-page" data-v-3ad78643> ← 上一页 </button><span class="page-info" data-v-3ad78643>第 ${ssrInterpolate(currentPage.value)} / ${ssrInterpolate(totalPages.value)} 页</span><button${ssrIncludeBooleanAttr(currentPage.value >= totalPages.value) ? " disabled" : ""} class="btn-page" data-v-3ad78643> 下一页 → </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GachaAnalyzer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const GachaAnalyzer = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-3ad78643"]]);
const __pageData = JSON.parse('{"title":"婵之云 - 抽卡记录分析器","description":"","frontmatter":{},"headers":[],"relativePath":"gacha-analyzer.md","filePath":"gacha-analyzer.md"}');
const __default__ = { name: "gacha-analyzer.md" };
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="婵之云-抽卡记录分析器" tabindex="-1">婵之云 - 抽卡记录分析器 <a class="header-anchor" href="#婵之云-抽卡记录分析器" aria-label="Permalink to &quot;婵之云 - 抽卡记录分析器&quot;">​</a></h1>`);
      _push(ssrRenderComponent(GachaAnalyzer, null, null, _parent));
      _push(`<hr><h2 id="使用说明" tabindex="-1">使用说明 <a class="header-anchor" href="#使用说明" aria-label="Permalink to &quot;使用说明&quot;">​</a></h2><ol><li>在游戏中点击 <strong>&quot;导出记录&quot;</strong> 按钮</li><li>点击 <strong>&quot;复制到剪贴板&quot;</strong> 复制 JSON 数据</li><li>回到此页面，将 JSON 粘贴到输入框中</li><li>即可查看详细的抽卡分析统计！</li></ol><hr><h2 id="爆率曲线" tabindex="-1">爆率曲线 <a class="header-anchor" href="#爆率曲线" aria-label="Permalink to &quot;爆率曲线&quot;">​</a></h2><p><img${ssrRenderAttr("src", _imports_0)} alt="爆率曲线"></p><blockquote><p>婵之云抽卡系统采用动态概率机制，随着抽取次数增加，稀有卡牌的出现概率将逐步提升，确保每位玩家都能获得公平且充满惊喜的抽卡体验！</p></blockquote></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("gacha-analyzer.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  __pageData,
  _sfc_main as default
};
