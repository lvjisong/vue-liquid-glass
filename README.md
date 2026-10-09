# vue3-element-plus-app

Vue 3 + Element Plus + Vuex 4 + Vue Router 4 工程化模板项目。脚手架、路由守卫、登录态、request 封装、SCSS、生产加固、Docker/Nginx 部署均已配好，开箱即用。

---

## 🚀 快速启动

```bash
# 安装依赖
npm install

# 本地开发（自动打开浏览器）
npm run serve

# 生产打包
npm run build

# 打包体积分析（看哪个包大）
npm run build:report

# Staging 环境打包
npm run build:staging

# Prettier 格式化所有代码
npm run format

# ESLint 检查
npm run lint
```

---

## 📁 目录结构

```
src/
├── api/index.js          # API 定义（组件不直接写 url）
├── components/
│   ├── <feature>/        # 业务组件（按模块分目录）
│   └── common/           # 通用组件（所有页面都能用）
│       └── ErrorBoundary.vue # 错误边界（页面崩了不白屏）
├── constants/
│   ├── urls.js           # 所有外链常量（SHOP/PRODUCT/NAV 等分组）
│   └── icons.js          # 所有 SVG path d 常量
├── router/
│   └── index.js          # 路由配置 + 全局守卫（SEO 动态 meta + 登录鉴权）
├── store/
│   └── index.js          # Vuex 全局状态（含通用持久化）
├── styles/
│   ├── _variables.scss   # SCSS 全局变量（断点/宽度/字体/缓动）
│   ├── _mixins.scss      # SCSS mixins（毛玻璃/按钮/居中）
│   ├── theme.scss        # 深浅色主题变量（CSS 变量，跟随系统）
│   └── main.scss         # 全局样式入口
├── utils/
│   ├── request.js        # axios 封装（拦截器/401 刷新/GET 自动重试）
│   ├── auth.js           # 登录态 Cookie+Vuex 封装
│   ├── persist.js        # 通用 localStorage 持久化工具
│   ├── debounce.js       # 防抖工具
│   ├── throttle.js       # 节流工具
│   └── spring.js         # 弹簧物理动画引擎（可选）
└── views/                # 页面级组件（对应路由）
    ├── Home.vue          # 首页
    ├── Login.vue         # 登录页（TODO-AUTH 接后端）
    └── NotFound.vue      # 404 兜底

public/
├── images/               # 本地图片资源
├── robots.txt            # SEO 爬虫配置（域名待替换）
├── sitemap.xml           # SEO 网站地图（域名待替换）
└── index.html            # 首屏 spinner（避免白屏）

根目录工程化文件：
├── vue.config.js         # gzip / 分包 / SCSS 注入 / 代理
├── .env.development      # 开发环境变量
├── .env.staging          # 预发布环境变量
├── .env.production       # 生产环境变量
├── .prettierrc           # 统一代码风格
├── .eslintrc.js          # ESLint + Prettier
├── .husky/pre-commit     # 提交前自动 lint
├── Dockerfile            # 生产镜像
├── nginx.conf            # history 路由 + gzip
└── docker-compose.yml    # 一键启动
```

---

## ⚙️ 生产环境部署清单

**搜 TODO 就能找到所有要改的地方，按顺序改：**

### 1. 环境变量（`.env.production`）

```env
# 生产环境 API 地址（改成你的后端域名）
VUE_APP_BASE_API=<-- 按项目替换：https://api.your-domain.com -->

# 网站根域名（SEO/分享用）
VUE_APP_SITE_URL=<-- 按项目替换：https://your-domain.com -->

# 图片 CDN 地址（如果图片走 CDN，改成 CDN 域名）
VUE_APP_IMAGE_BASE=<-- 按项目替换：https://cdn.your-domain.com/images -->
```

### 2. SEO 文件（`public/`）

| 文件                 | 改什么                                        |
| -------------------- | --------------------------------------------- |
| `public/robots.txt`  | sitemap 地址改成你的域名                      |
| `public/sitemap.xml` | 所有 `<loc>` 里的域名改成真实域名             |

### 3. Nginx 配置（`nginx.conf`）

| 配置项           | 说明                                          |
| ---------------- | --------------------------------------------- |
| `server_name`    | 改成你的域名                                  |
| `try_files`      | 必须配 `try_files $uri $uri/ /index.html;`（history 路由刷新不 404） |
| `gzip_static on` | 开启预压缩（项目打包已生成 .gz 文件）         |
| 静态资源缓存     | 带 hash 的文件缓存一年，改了自动更新          |

### 4. Docker 部署

```bash
# 构建镜像
docker build -t <-- 按项目替换：镜像名 --> .

# 启动（一条命令）
docker-compose up -d
```

### 5. 错误监控（Sentry 预留）

在 `src/main.js` 里搜 `TODO-PRODUCTION`，接入 Sentry：

```js
// app.config.errorHandler 里加：
Sentry.captureException(err, { extra: { info, component: vm.$options.name } });
```

---

## 🔧 常用配置速查

### 外链常量（`src/constants/urls.js`）
所有外链都在这里，改一处全站生效。新增外链先加到 urls.js，按对象分组。

### 响应式断点（`src/styles/_variables.scss`）
```scss
$breakpoint-mobile: 734px;      // 移动端断点（和 JS matchMedia 保持一致）
$content-max-width: 1024px;     // 内容最大宽度
$ease-apple: cubic-bezier(.4,0,.6,1); // 统一动画缓动
```
> 断点改了，JS 里 `window.matchMedia` 的 `MOBILE_BREAKPOINT` 要一起改。

### 请求重试（`src/utils/request.js`）
- 默认 GET 请求失败自动重试 2 次（指数退避：1s → 2s）
- POST/PUT/DELETE 默认不重试（防止重复提交）
- 想关闭重试：请求时加 `{ retry: false }`

---

## 🛡️ 已有的生产环境优化

| 优化项          | 位置                                      | 说明                               |
| --------------- | ----------------------------------------- | ---------------------------------- |
| gzip 压缩       | `vue.config.js`                           | 打包自动生成 .gz 文件              |
| 代码分包        | `vue.config.js`                           | vendor / element-plus 拆成独立 chunk |
| console 清理    | `vue.config.js`                           | 生产删 console.log/info/debug，保留 warn/error |
| source map 关闭 | `vue.config.js`                           | 防止源码泄露                       |
| 全局错误捕获    | `src/main.js`                             | 所有组件错误都能捕获               |
| 错误边界组件    | `src/components/common/ErrorBoundary.vue` | 页面崩了不白屏                     |
| 路由切换进度条  | `src/App.vue`                             | 切路由顶部显示进度条               |
| 首屏加载动画    | `public/index.html`                       | JS 加载完之前显示转圈               |
| SEO 动态 meta   | `src/router/index.js`                     | 每个页面独立 title/description     |
| 图片懒加载      | 组件 img 标签                              | 原生 `loading="lazy"`              |
| 通用持久化      | `src/utils/persist.js`                    | 需要刷新不丢的数据用 createPersist |
| 防抖/节流工具   | `src/utils/`                              | debounce.js / throttle.js          |

---

## 📝 Git 提交规范（husky + lint-staged）

每次 `git commit` 自动：
1. Prettier 格式化
2. ESLint 检查
3. 有问题不让提交

---

## ❓ 常见问题（前端通用坑知识库）

### Vue 3 常见坑

**Q: Vue 3 里解构 props 后不响应了？**
A: 直接 `const { title } = props` 会丢失响应式。要用 `toRefs`：
```js
import { toRefs } from "vue";
export default {
  props: { title: String },
  setup(props) {
    // ❌ 不响应
    // const { title } = props;
    // ✅ 才响应
    const { title } = toRefs(props);
  },
};
```

**Q: v-for 和 v-if 能不能一起用？**
A: 不要！v-for 优先级比 v-if 高，会先循环再判断，性能差。用 computed 先过滤：
```html
<!-- ❌ 不推荐 -->
<li v-for="item in list" v-if="item.show" :key="item.id"></li>
<!-- ✅ 推荐 -->
<li v-for="item in visibleList" :key="item.id"></li>
```
```js
computed: { visibleList() { return this.list.filter(i => i.show); } }
```

**Q: v-for 的 key 用 index 有什么问题？**
A: 列表增删排序时，用 index 做 key 会导致 DOM 复用错误。用唯一 id：
```html
<!-- ❌ 列表会变时不要用 index -->
<li v-for="(item, index) in list" :key="index"></li>
<!-- ✅ 用唯一 id -->
<li v-for="item in list" :key="item.id"></li>
```

**Q: 定时器 setInterval 没清，页面切走还在跑？**
A: 组件卸载前必须清，否则内存泄漏：
```js
mounted() { this.timer = setInterval(() => {}, 1000); },
beforeUnmount() { clearInterval(this.timer); } // 别忘了
```

**Q: Vue2 的 beforeDestroy 在 Vue3 里还能用吗？**
A: **已弃用**，Vue3 用 `beforeUnmount`（卸载前清理定时器/事件/动画的语义完全对应）。`beforeDestroy` 在 Vue3 虽不报运行错，但 eslint 的 `vue/vue3-essential` 会标记弃用（`vue/essential` Vue2 规则集则漏检）。清理逻辑统一写 `beforeUnmount`。

### Element Plus 常见坑

**Q: scoped 样式改不了 Element Plus 组件？**
A: scoped 样式只能改当前组件元素，改第三方组件要用深度选择器：
```scss
/* ✅ 用深度选择器 */
::v-deep .el-button { padding: 0; }
```

**Q: 怎么改 Element Plus 主题颜色？**
A: 在 styles 里加覆盖文件，`:root { --el-color-primary: <颜色>; }`，main.js import。

**Q: ElMessage 弹出两次？**
A: 检查是不是请求拦截器弹了一次、业务代码又弹一次。不需要全局弹错时请求加 `{ silentError: true }`。

### 样式相关

**Q: SCSS 变量和 CSS 变量有什么区别？**
A:
- **SCSS 变量**（`$breakpoint`）：编译时就替换，运行时不能改 → 固定设计规范用
- **CSS 变量**（`--theme`）：运行时可用 JS 改，支持动态主题 → 需要动态切换的用

**Q: 被 @use 引入的 SCSS 文件里用不了全局变量？**
A: `@use` 的变量作用域**不跨文件传递**。即使 `vue.config.js` 的 `additionalData` 给每个文件都注入了 `@use variables`，被其他文件 `@use` 引入的模块（如 `_reset.scss`、`_mixins.scss`）仍是独立作用域，看不到入口文件的变量。
**解决**：被 `@use` 引入的样式文件顶部自己写 `@use "variables" as *;`，否则报 `Undefined variable`。

### 路由传参常见坑

**Q: 路由 params 传参，刷新页面就没了？**
A: 正常！params 存在内存里，刷新丢。要刷新还在用 query 或路径参数（`/product/:id`）。
```js
// ❌ 刷新丢
this.$router.push({ name: "P", params: { id: 1 } });
// ✅ 刷新还在（query）
this.$router.push({ path: "/p", query: { id: 1 } });
```

### 移动端常见坑

**Q: iOS 上输入框 focus 自动放大页面？**
A: iOS 会自动放大小于 16px 的输入框字体，设成 16px 以上。

**Q: 弹窗打开后背景还能滚动（滚动穿透）？**
A: 弹窗打开时锁住 body 滚动：
```js
open() { document.body.style.overflow = "hidden"; },
close() { document.body.style.overflow = ""; }
```

**Q: 移动端 100vh 不对（底部被导航栏挡住）？**
A: 手机浏览器地址栏占高度。用 `100dvh`（动态视口）替代：
```scss
.full-screen { height: 100vh; height: 100dvh; }
```

### 工程化常见坑

**Q: 打包后 `process.env.VUE_APP_XXX` 读不到？**
A: ① 变量必须以 `VUE_APP_` 开头；② 改 `.env` 必须重启 dev server；③ 生产要重新 build。

**Q: 跨域请求不带 Cookie？**
A: axios 加 `withCredentials: true`，后端配 `Access-Control-Allow-Credentials: true`。

**Q: mounted 里拿不到 DOM 元素？**
A: DOM 还没渲染完，用 `$nextTick`：
```js
mounted() { this.$nextTick(() => { console.log(this.$refs.box.clientHeight); }); }
```

### JavaScript 常见坑

**Q: `==` 和 `===` 区别？**
A: `==` 自动转类型（`0==''` → true）；`===` 不转。**永远用 `===`**。

**Q: 异步代码里 `this` 丢了？**
A: 普通函数 this 调用时决定，异步回调变 undefined。用箭头函数：
```js
setTimeout(() => { console.log(this); }, 1000); // ✅ 继承外层 this
```

**Q: 深拷贝 vs 浅拷贝？**
A:
- 浅拷贝（`{...obj}`）：只复制第一层，嵌套对象仍是引用
- 深拷贝（`structuredClone(obj)` / `JSON.parse(JSON.stringify(obj))`）：完全独立

**深拷贝方法怎么选？**
| 场景 | 用什么 |
| --- | --- |
| 现代浏览器 | `structuredClone()` |
| 简单对象（无函数/Date） | `JSON.parse(JSON.stringify())` |
| 复杂数据（函数/循环引用） | `lodash.cloneDeep` |

**Q: 数组方法 map / forEach / filter / find 区别？**
| 方法 | 干什么 | 返回 |
| --- | --- | --- |
| `map` | 每个都改 | 新数组 |
| `filter` | 过滤 | 新数组 |
| `find` | 找第一个符合 | 元素/undefined |
| `forEach` | 循环做事 | 啥都不返回 |
| `some` | 有没有符合 | true/false |
| `every` | 是否全部符合 | true/false |

**数组方法大全（按用途分类）**

- **增删改（改原数组）**：`push` 末尾加 / `pop` 末尾删 / `unshift` 开头加 / `shift` 开头删 / `splice(start,count,...)` 任意位置 / `sort` 排序 / `reverse` 反转 / `fill` 填充
- **查询（不改原数组）**：`indexOf(x)` 下标 / `includes(x)` 有无 / `find(fn)` 元素 / `findIndex(fn)` 下标
- **遍历/转换（不改原数组）**：`map` / `filter` / `forEach` / `some` / `every` / `reduce` 累加 / `flat` 拍平 / `flatMap`
- **拼接/截取**：`concat` 拼接 / `slice(start,end)` 截取 / `join(sep)` 转字符串
- **其他**：`Array.isArray` / `Array.from` / `arr.at(-1)` 取最后

**对象数组常用操作**
```js
// 交集（都有的）
const common = arr1.filter(a => arr2.some(b => b.id === a.id));
// arr1 独有
const only1 = arr1.filter(a => !arr2.some(b => b.id === a.id));
// 合并去重
const merged = [...arr1, ...arr2.filter(b => !arr1.some(a => a.id === b.id))];
// 数组按字段去重
const unique = list.filter((i, idx, self) => idx === self.findIndex(t => t.id === i.id));
```

**Q: 事件循环：setTimeout / Promise / async await 谁先执行？**
A: 同步代码先跑 → 微任务（Promise）→ 宏任务（setTimeout）。
```js
console.log("1");               // 同步
setTimeout(() => console.log("2")); // 宏任务，最后
Promise.resolve().then(() => console.log("3")); // 微任务，中间
console.log("4");               // 同步
// 输出：1 → 4 → 3 → 2
```

**Q: for 循环里用 var，异步回调全拿到最后一个值？**
A: var 无块级作用域。用 `let`：
```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0,1,2
}
```

**Q: Promise 没写 catch？**
A: `.then` 后必须 `.catch`，不然错误被吞。

**Q: async/await 怎么处理错误？**
A: 用 try/catch：
```js
async function load() {
  try { const d = await api.getUser(); console.log(d); }
  catch (err) { console.error("加载失败：", err); }
}
```

**Q: 内存泄漏怎么产生的？**
| 原因 | 解决 |
| --- | --- |
| 定时器没清 | `beforeUnmount` 里 clearInterval |
| 事件监听没移除 | `beforeUnmount` 里 removeEventListener |
| 闭包持有大对象 | 不用时置 null |
| 全局变量越积越多 | 少用全局变量 |

**Q: 重排（Reflow）vs 重绘（Repaint）？**
- 重排：位置/尺寸变，代价大（改 width/height/padding/margin、增删 DOM、改 font-size）
- 重绘：外观变位置不变，代价小（color/background/border-color）
- **优化**：动画用 `transform` + `opacity`（走 GPU，不触发重排）

**Q: 跨域 CORS 预检（OPTIONS）？**
A: 简单请求（GET/POST+常见 header）直接发；复杂请求（PUT/DELETE/自定义 header/JSON）先发 OPTIONS 询问。解决：后端配 CORS 头，或前端 proxy 代理。

**Q: HTTP 缓存：强缓存 vs 协商缓存？**
- 强缓存（`Cache-Control: max-age`）：一年内用本地，不发请求
- 协商缓存（`ETag/Last-Modified`）：发请求问变了没
- **线上改了还是旧的？** index.html 不要缓存；缩短静态资源缓存时间

### CSS 常见坑

**Q: 居中的几种方式？**
```css
.text { text-align: center; }            /* 水平（行内） */
.box { margin: 0 auto; }                 /* 水平（块级） */
.parent { display: flex; justify-content: center; align-items: center; } /* 都居中（最常用） */
.box { position: absolute; top:50%; left:50%; transform: translate(-50%,-50%); }
```

**Q: z-index 不生效？**
A: z-index 只对定位元素（position 非 static）生效。检查有没有定位、父元素是否创建层叠上下文。

**Q: margin 塌陷？**
A: 相邻块级元素上下 margin 合并（取大的）。用 `display:inline-block` 或 padding 替代。

**Q: 文字溢出省略号？**
```css
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } /* 单行 */
.ellipsis-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } /* 多行 */
```

**Q: content-box vs border-box？**
A: content-box 的 width 不含 padding/border；border-box 含。推荐全局 border-box：
```scss
* { box-sizing: border-box; }
```

### DOM 常见坑

**Q: `event.target` vs `event.currentTarget`？**
A: target 是真正触发事件的元素（点到谁是谁）；currentTarget 是绑定事件的元素（绑在谁身上是谁）。

**Q: 阻止冒泡 / 阻止默认行为？**
```js
e.stopPropagation(); // 阻止冒泡
e.preventDefault();  // 阻止默认（a 不跳转、表单不提交）
```

**Q: 动态添加的元素事件不生效？**
A: 事件绑早了，元素还没出来。用事件委托（绑在父元素上）。

**Q: `offsetWidth` / `clientWidth` / `scrollWidth`？**
- `clientWidth`：内容 + padding（不含 border/滚动条）＝看得到的
- `offsetWidth`：+ border + 滚动条＝盒子本身大小
- `scrollWidth`：内容实际总宽＝包括溢出部分

---

## 📋 接后端 TODO 清单

按 `TODO-*` 全局搜索，逐项处理：

| 位置 | 标记 | 要做什么 |
| --- | --- | --- |
| `src/router/index.js` | meta.title/description | 填真实页面标题/描述 |
| `src/utils/request.js` | REFRESH_URL | 填真实刷新 token 接口 |
| `src/store/index.js` | TODO-AUTH | 把 mock 的 fetchUser/logout 换成真实 axios |
| `src/views/Login.vue` | TODO-AUTH | 调真实登录接口 |
| `src/main.js` | TODO-PRODUCTION | 接入 Sentry 监控 |
| `vue.config.js` | 代理 target | 改成真实后端地址 |
| `.env.production` | VUE_APP_* | 填真实域名/API 地址 |
| `public/robots.txt` / `sitemap.xml` | 域名 | 填真实域名 |
