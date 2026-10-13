/** * ============================================================================ *
LiquidGlassDemo.vue —— Apple Liquid Glass 毛玻璃效果 Demo *
---------------------------------------------------------------------------- * 集成自
github.com/dashersw/liquid-glass-js（MIT 协议）， * 已把原仓库的 container.js + button.js 合并为单个
ES module： * src/lib/liquid-glass/liquidGlass.js * src/lib/liquid-glass/glass.css * * 展示内容： *
1. 三种形态的玻璃按钮：圆角矩形(rounded) / 正圆(circle) / 胶囊(pill) * 2.
玻璃容器内嵌套玻璃按钮（子按钮通过 texSubImage2D 实时采样父容器画布） * 3. 右侧控制面板（Element
Plus 滑块）实时调节玻璃参数 * * 原理简述： * 玻璃效果依赖 html2canvas
对整页做一次截图采样（pageSnapshot）， * 再由 WebGL shader
根据每个玻璃元素的屏幕位置从该快照中“折射/模糊” *
出玻璃背后的背景。因此玻璃元素下方必须有足够丰富的背景（渐变/图形）， * 效果才明显。 * * ⚠️
修复记录（重要，勿删字段）： * 曾出现“拖动『模糊半径』滑块后按钮变金色且不可逆”的 bug。 *
根因：`controls` 里只定义了 6 个字段，而 `applyGlassParams()` 却读取了 * `c.edgeDistance /
c.rimDistance / c.baseDistance / c.cornerBoost`， * 这 4 个字段为 undefined，导致 `gl.uniform1f(loc,
undefined)` * 污染 WebGL shader，使所有玻璃按钮统一变成固定琥珀色且无法恢复。 * 修复：在 `controls`
中补齐这 4 个字段（值与库内默认值一致）。 * 凡是要在 shader uniform
里使用的参数，都必须在此处有默认值。 *
============================================================================ */
<template>
  <div class="lg-page">
    <!-- 装饰背景：让玻璃折射/模糊效果有东西可采样（html2canvas 会截取整页） -->
    <div class="lg-backdrop">
      <span class="blob blob-1"></span>
      <span class="blob blob-2"></span>
      <span class="blob blob-3"></span>
      <span class="blob blob-4"></span>
    </div>

    <header class="lg-header">
      <h1>Liquid Glass</h1>
      <p>Apple 风格毛玻璃效果 · dashersw/liquid-glass-js 集成 Demo</p>
    </header>

    <main class="lg-stage">
      <!-- 玻璃元素挂载点：ref 用于在 setup() 中拿到 DOM 容器 -->
      <section class="lg-showcase" ref="glassMount">
        <div class="lg-row">
          <!-- 第一行：三种形态的独立玻璃按钮 -->
          <div ref="rowButtons"></div>
        </div>
        <div class="lg-row">
          <!-- 第二行：玻璃容器 + 嵌套玻璃按钮 -->
          <div ref="rowNested"></div>
        </div>
      </section>
    </main>

    <!-- 参数控制面板：六个滑块分别绑定 controls 的字段，拖动即触发 watch -->
    <aside class="lg-controls">
      <div class="ctrl-title">玻璃参数</div>

      <!-- 模糊半径：控制背景高斯模糊的程度（shader 内 sigma = 半径 / 2） -->
      <div class="ctrl-item">
        <span class="ctrl-label"
          >模糊半径 <b>{{ Math.round(controls.blurRadius) }}</b></span
        >
        <el-slider v-model="controls.blurRadius" :min="1" :max="15" :step="1" size="small" />
      </div>

      <!-- 边缘折射：玻璃边缘对背景的折射强度 -->
      <div class="ctrl-item">
        <span class="ctrl-label"
          >边缘折射 <b>{{ controls.edgeIntensity.toFixed(3) }}</b></span
        >
        <el-slider
          v-model="controls.edgeIntensity"
          :min="0"
          :max="0.1"
          :step="0.001"
          size="small"
        />
      </div>

      <!-- 边缘高光：玻璃边框的高光亮度 -->
      <div class="ctrl-item">
        <span class="ctrl-label"
          >边缘高光 <b>{{ controls.rimIntensity.toFixed(3) }}</b></span
        >
        <el-slider v-model="controls.rimIntensity" :min="0" :max="0.2" :step="0.001" size="small" />
      </div>

      <!-- 中心形变：玻璃中心区域的折射强度 -->
      <div class="ctrl-item">
        <span class="ctrl-label"
          >中心形变 <b>{{ controls.baseIntensity.toFixed(3) }}</b></span
        >
        <el-slider
          v-model="controls.baseIntensity"
          :min="0"
          :max="0.05"
          :step="0.001"
          size="small"
        />
      </div>

      <!-- 波纹强度：玻璃表面波纹干扰的强度 -->
      <div class="ctrl-item">
        <span class="ctrl-label"
          >波纹强度 <b>{{ controls.rippleEffect.toFixed(2) }}</b></span
        >
        <el-slider v-model="controls.rippleEffect" :min="0" :max="0.5" :step="0.01" size="small" />
      </div>

      <!-- 着色不透明度：玻璃对背景采样的上色程度（越大玻璃越接近背景原色/偏白） -->
      <div class="ctrl-item">
        <span class="ctrl-label"
          >着色不透明度 <b>{{ controls.tintOpacity.toFixed(2) }}</b></span
        >
        <el-slider v-model="controls.tintOpacity" :min="0" :max="1" :step="0.01" size="small" />
      </div>
    </aside>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, nextTick, reactive, watch, ref } from "vue";
import { ElMessage } from "element-plus";
import html2canvas from "html2canvas";

// liquid-glass 库依赖全局 html2canvas（capturePageSnapshot 内部调用 window.html2canvas），
// 必须先把它挂到 window 上，再 import 库、创建实例。
window.html2canvas = html2canvas;
import { Container, Button } from "@/lib/liquid-glass/liquidGlass.js";
import "@/lib/liquid-glass/glass.css";

export default {
  name: "LiquidGlassDemo",
  setup() {
    // ------------------------------------------------------------------
    // 玻璃参数（响应式）。所有字段都会被 applyGlassParams 写到 WebGL uniform，
    // 因此【每个 shader 用到的参数都必须在这里有默认值】——
    // 缺字段会让 gl.uniform1f(loc, undefined) 污染 shader（见文件头修复记录）。
    // ------------------------------------------------------------------
    const controls = reactive({
      blurRadius: 5, // 模糊半径（1~15，shader 内 sigma=半径/2）
      edgeIntensity: 0.01, // 边缘折射强度
      rimIntensity: 0.05, // 边缘高光强度
      baseIntensity: 0.01, // 中心形变强度
      edgeDistance: 0.15, // 边缘折射的作用距离（此前缺失导致 bug，勿删）
      rimDistance: 0.8, // 边缘高光的作用距离（此前缺失导致 bug，勿删）
      baseDistance: 0.1, // 中心形变的作用距离（此前缺失导致 bug，勿删）
      cornerBoost: 0.02, // 圆角处的高光增强系数（此前缺失导致 bug，勿删）
      rippleEffect: 0.1, // 波纹强度
      tintOpacity: 0.2, // 着色不透明度
    });

    // 模板引用。注意：组合式 API 的 setup() 里没有 this.$refs，
    // 必须用 ref() 绑定模板的 ref 才能拿到真实 DOM 容器。
    const glassMount = ref(null);
    const rowButtons = ref(null);
    const rowNested = ref(null);

    // 本组件创建的玻璃实例清单，供 onBeforeUnmount 统一 destroy 清理。
    let instances = [];

    // 库在 shader 初始化（setupShader/setupDynamicNestedShader）时读取该全局对象
    // 来作为 uniform 的初始值。这里用 {...controls} 展开成普通对象（去掉响应式代理）。
    window.glassControls = { ...controls };

    /**
     * 参数变化 → 更新 window.glassControls，并把新值写入所有玻璃实例的 WebGL uniform。
     *
     * 实现要点：
     *  - 遍历 Container.instances（库维护的静态实例列表），每个实例的 gl_refs
     *    保存了它自己的 WebGL context、program 与各 uniform 的 location。
     *  - 对每个 uniform：`if (r.xxxLoc)` 判断 location 存在后再写入，避免对 null 操作。
     *  - 最后调用 `inst.render()` 用新 uniform 立即重绘一次。
     *  - 注意：所有被读取的 `c.xxx` 字段都必须在 controls 中定义，否则 undefined
     *    传入 gl.uniform1f 会破坏 shader（曾导致按钮永久变金）。
     */
    function applyGlassParams() {
      const c = window.glassControls;
      Container.instances.forEach((inst) => {
        const r = inst.gl_refs;
        if (!r.gl) return; // WebGL 未初始化完成则跳过
        const gl = r.gl;
        if (r.blurRadiusLoc) gl.uniform1f(r.blurRadiusLoc, c.blurRadius);
        if (r.edgeIntensityLoc) gl.uniform1f(r.edgeIntensityLoc, c.edgeIntensity);
        if (r.rimIntensityLoc) gl.uniform1f(r.rimIntensityLoc, c.rimIntensity);
        if (r.baseIntensityLoc) gl.uniform1f(r.baseIntensityLoc, c.baseIntensity);
        if (r.edgeDistanceLoc) gl.uniform1f(r.edgeDistanceLoc, c.edgeDistance);
        if (r.rimDistanceLoc) gl.uniform1f(r.rimDistanceLoc, c.rimDistance);
        if (r.baseDistanceLoc) gl.uniform1f(r.baseDistanceLoc, c.baseDistance);
        if (r.cornerBoostLoc) gl.uniform1f(r.cornerBoostLoc, c.cornerBoost);
        if (r.rippleEffectLoc) gl.uniform1f(r.rippleEffectLoc, c.rippleEffect);
        if (r.tintOpacityLoc) gl.uniform1f(r.tintOpacityLoc, c.tintOpacity);
        if (inst.render) inst.render(); // 用新参数立即重绘
      });
    }

    // 监听 controls 变化：更新全局参数对象并重写所有实例的 uniform。
    watch(controls, () => {
      window.glassControls = { ...controls };
      applyGlassParams();
    });

    /**
     * 构建页面里的玻璃元素，返回两行 DOM 容器。
     *  - row1：三个独立玻璃按钮（Hello / ▶ / Pill Button）
     *  - row2：一个玻璃容器，内部嵌套三个子玻璃按钮（Home / About / Contact）
     */
    function buildGlass() {
      // ---- 第一行：三种形态的玻璃按钮 ----
      const row1 = document.createElement("div");
      row1.style.display = "flex";
      row1.style.alignItems = "center";
      row1.style.gap = "32px";

      // 圆角矩形按钮：自绘 canvas 作为玻璃纹理，onClick 触发 ElMessage 提示
      const hello = new Button({
        text: "Hello",
        size: 36,
        type: "rounded",
        tintOpacity: 0.25,
        onClick: (t) => ElMessage.success(`点击了：${t}`),
      });
      // 正圆按钮：播放图标样式
      const circle = new Button({
        text: "▶",
        size: 36,
        type: "circle",
        tintOpacity: 0.2,
        onClick: () => ElMessage.info("圆形玻璃按钮"),
      });
      // 胶囊按钮
      const pill = new Button({
        text: "Pill Button",
        size: 32,
        type: "pill",
        tintOpacity: 0.2,
        onClick: () => ElMessage.info("胶囊玻璃按钮"),
      });
      row1.appendChild(hello.element);
      row1.appendChild(circle.element);
      row1.appendChild(pill.element);
      instances.push(hello, circle, pill);

      // ---- 第二行：玻璃容器 + 嵌套玻璃按钮 ----
      const row2 = document.createElement("div");
      row2.style.display = "flex";
      row2.style.alignItems = "center";

      // 容器本身也是玻璃（Container），子按钮 addChild 后成为“嵌套玻璃”：
      // 子按钮每帧从父容器 canvas 采样（texSubImage2D），呈现层叠玻璃质感。
      const container = new Container({ type: "rounded", borderRadius: 36, tintOpacity: 0.15 });
      const b1 = new Button({
        text: "Home",
        size: 20,
        type: "pill",
        onClick: (t) => ElMessage.info(t),
      });
      const b2 = new Button({
        text: "About",
        size: 20,
        type: "pill",
        onClick: (t) => ElMessage.info(t),
      });
      const b3 = new Button({
        text: "Contact",
        size: 20,
        type: "pill",
        onClick: (t) => ElMessage.info(t),
      });
      container.addChild(b1);
      container.addChild(b2);
      container.addChild(b3);
      row2.appendChild(container.element);
      instances.push(container, b1, b2, b3);

      return { row1, row2 };
    }

    // 挂载后构建玻璃元素。
    onMounted(async () => {
      await nextTick(); // 等模板渲染完成、ref 拿到真实 DOM
      // 重置库的静态快照状态，强制对当前页面背景重新采样，
      // 避免进入多次页面时复用旧的 pageSnapshot。
      Container.pageSnapshot = null;
      Container.isCapturing = false;
      Container.waitingForSnapshot = [];
      Container.instances = [];

      const mount = glassMount.value;
      const buttons = rowButtons.value;
      const nested = rowNested.value;
      if (!mount || !buttons || !nested) return;

      const { row1, row2 } = buildGlass();
      buttons.appendChild(row1);
      nested.appendChild(row2);
    });

    // 卸载时清理：destroy 每个实例（移除滚动监听、DOM），并清空库静态状态。
    onBeforeUnmount(() => {
      instances.forEach((inst) => inst.destroy && inst.destroy());
      instances = [];
      Container.pageSnapshot = null;
      Container.isCapturing = false;
      Container.waitingForSnapshot = [];
      Container.instances = [];
    });

    return { controls, glassMount, rowButtons, rowNested };
  },
};
</script>

<style lang="scss" scoped>
.lg-page {
  position: relative;
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
}

/* ---- 渐变背景（html2canvas 采样对象之一） ---- */
.lg-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, #1a2980 0%, #26d0ce 50%, #f7b733 100%);
}

/* 装饰光斑：让玻璃背后有丰富内容可折射 */
.blob {
  position: absolute;
  display: block;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(2px);
}
.blob-1 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle at 30% 30%, #ff9a9e, #fad0c4);
  top: 8%;
  left: 8%;
}
.blob-2 {
  width: 260px;
  height: 260px;
  background: radial-gradient(circle at 30% 30%, #a18cd1, #fbc2eb);
  bottom: 10%;
  right: 12%;
}
.blob-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle at 30% 30%, #fbc2eb, #a6c1ee);
  top: 55%;
  left: 20%;
}
.blob-4 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle at 30% 30%, #f6d365, #fda085);
  top: 15%;
  right: 30%;
}

/* ---- 标题 ---- */
.lg-header {
  position: relative;
  z-index: 1;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}
.lg-header h1 {
  margin: 0;
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 1px;
}
.lg-header p {
  margin: 8px 0 0;
  font-size: 15px;
  opacity: 0.9;
}

/* ---- 展示区 ---- */
.lg-stage {
  position: relative;
  z-index: 1;
  margin-top: 48px;
  max-width: 560px;
}
.lg-row {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

/* ---- 控制面板 ---- */
.lg-controls {
  position: fixed;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 260px;
  padding: 20px 22px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  color: #1f2937;
}
.ctrl-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
}
.ctrl-item {
  margin-bottom: 14px;
}
.ctrl-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #374151;
  margin-bottom: 2px;
}
.ctrl-label b {
  color: #111827;
}

@media (max-width: 900px) {
  .lg-controls {
    position: static;
    transform: none;
    width: auto;
    margin-top: 24px;
  }
}
</style>
