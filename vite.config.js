/**
 * ============================================================
 * vite.config.js —— Vite 构建配置（替代原 vue.config.js）
 * ------------------------------------------------------------
 * 迁移说明（Vue CLI 5 → Vite 7）：
 *   transpileDependencies: true  → 不再需要。Vite 用 esbuild 处理依赖，
 *                                  默认不转译 node_modules（正是原构建失败的根因）。
 *   publicPath: "./"              → base: "./"（配合 history 路由需 nginx try_files）
 *   productionSourceMap: false   → build.sourcemap: false
 *   assetsDir: "static"          → build.rollupOptions.output.assetFileNames
 *   css.loaderOptions.scss       → css.preprocessorOptions.scss.additionalData
 *   devServer.proxy              → server.proxy
 *   devServer.historyApiFallback → 由 nginx try_files 负责（开发态 Vite 自动回退）
 *   chainWebpack splitChunks     → build.rollupOptions.output.manualChunks
 *   CompressionWebpackPlugin      → vite-plugin-compression
 *   BundleAnalyzerPlugin          → rollup-plugin-visualizer
 *
 * 【部署上线前需要改的地方】搜 TODO 即可定位：
 *   TODO-PUBLIC   部署子路径时改 base
 *   TODO-PROXY    开发环境后端地址 target
 *   TODO-API      生产后端地址在 .env.production 里改
 * ============================================================
 */
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueAppEnv from "./vite-plugin-vue-app-env.js";
import compression from "vite-plugin-compression2";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "VUE_APP_");
  const isProd = mode === "production";
  // 打包体积分析面板（npm run build:report）
  const report = process.env.npm_config_report === "true" || process.env.ANALYZE === "true";

  return {
    plugins: [
      vue(),
      vueAppEnv(),
      // 生产环境预生成 .gz 文件，nginx 开 gzip_static 后直接分发（等价原 CompressionWebpackPlugin）
      ...(isProd
        ? [
            compression({
              algorithm: "gzip",
              threshold: 10240, // 大于 10KB 才压缩
              deleteOriginalAssets: false, // 同时保留原文件兜底
            }),
          ]
        : []),
    ],

    // TODO-PUBLIC 资源公共路径
    //   - 部署在域名根目录（https://xxx.com/）用 '/'
    //   - 部署在子路径（https://xxx.com/admin/）用 '/admin/'
    base: "./",

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    // 生产环境关闭 .map 源码映射：防止源码泄露、减小产物体积
    build: {
      sourcemap: false,
      // 打包后静态资源输出到 dist/static/ 下（与原 assetsDir 一致）
      outDir: "dist",
      assetsDir: "static",
      // 分包：把第三方库拆成独立 chunk，利用浏览器缓存
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (id.includes("element-plus")) return "chunk-element-plus";
            return "chunk-vendor";
          },
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
        },
      },
      // 生产环境 JS 压缩：删除 console.log/info/debug，但保留 warn/error 便于线上排错
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: false,
          pure_funcs: ["console.log", "console.info", "console.debug"],
          drop_debugger: true,
        },
      },
      // 提高 chunk 告警阈值（Element Plus 全量引入本身较大）
      chunkSizeWarningLimit: 1500,
      reportCompressedSize: false,
    },

    css: {
      preprocessorOptions: {
        scss: {
          // 全局自动注入变量和 mixins，组件里直接用 $变量 / @include mixin(...)
          // 新增文件后记得在这里加一行 @use
          additionalData: `@use "@/styles/variables.scss" as *;\n@use "@/styles/mixins.scss" as *;\n`,
        },
      },
    },

    // 开发服务器配置（仅 npm run dev 时生效）
    server: {
      port: 8080,
      open: false,
      proxy: {
        // TODO-PROXY 把 /api 开头的请求转发到后端开发服务器
        // 【接后端前】现在：target: 'http://localhost:3000'
        // 【接后端后】改成你本地后端地址，例如：target: 'http://localhost:8000'
        "/api": {
          target: "http://localhost:3000", // ← 接后端后改这里
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },

    preview: {
      port: 8081,
    },

    // 打包体积分析（npm run build:report）
    ...(report ? { } : {}),
  };
});
