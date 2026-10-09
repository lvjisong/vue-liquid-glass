/**
 * ============================================================
 * vue.config.js —— Vue CLI 全局配置
 * ------------------------------------------------------------
 * 【部署上线前需要改的地方】搜 TODO 即可定位：
 *   TODO-PUBLIC   部署子路径时改 publicPath
 *   TODO-PROXY    开发环境后端地址 target
 *   TODO-API      生产后端地址在 .env.production 里改
 * ============================================================
 */
const { defineConfig } = require("@vue/cli-service");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const isProd = process.env.NODE_ENV === "production";
// 是否打开打包分析（npm run build:report 触发）
const report = process.env.npm_config_report === "true" || process.env.ANALYZE === "true";

module.exports = defineConfig({
  // 让 node_modules 里的依赖也经过 babel 转译（兼容老浏览器）
  transpileDependencies: true,

  // TODO-PUBLIC 资源公共路径
  //   - 部署在域名根目录（https://xxx.com/）用 '/'
  //   - 部署在子路径（https://xxx.com/admin/）用 '/admin/'
  //   - 用相对路径 './' 可支持任意子路径，但 history 路由需要服务器配合
  publicPath: "./",

  // 生产环境关闭 .map 源码映射：防止源码泄露、减小产物体积
  productionSourceMap: false,

  // 开发时保存即 ESLint 报错；生产构建关闭（避免阻塞发布）
  lintOnSave: process.env.NODE_ENV !== "production",

  // 打包后静态资源输出到 dist/static/ 下
  assetsDir: "static",

  css: {
    // 生产环境把 CSS 抽成独立 .css 文件（否则会内联进 JS）
    extract: isProd,
    loaderOptions: {
      scss: {
        // 全局自动注入变量和 mixins，组件里直接用 $apple-blue / @include glass(...)
        // 新增文件后记得在这里加一行 @use
        additionalData: `@use "@/styles/variables.scss" as *;\n@use "@/styles/mixins.scss" as *;\n`,
      },
    },
  },

  configureWebpack: (config) => {
    const plugins = [];

    if (isProd) {
      // gzip 压缩：输出 .gz 文件，Nginx 配 gzip_static on 直接分发，减少传输体积
      plugins.push(
        new CompressionWebpackPlugin({
          test: /\.(js|css|html|svg)$/,
          threshold: 10240, // 大于 10KB 才压缩
          algorithm: "gzip",
          compressionOptions: { level: 9 },
          deleteOriginalAssets: false, // 同时保留原文件兜底
        })
      );
    }
    // 打包体积分析面板（npm run build:report）
    if (report) {
      plugins.push(new BundleAnalyzerPlugin());
    }
    config.plugins = [...(config.plugins || []), ...plugins];
  },

  chainWebpack: (config) => {
    if (isProd) {
      // JS 压缩：删除 console.log/info/debug，但保留 warn/error 便于线上排错
      config.optimization.minimizer("terser").tap((args) => {
        args[0].terserOptions.compress.drop_console = false;
        args[0].terserOptions.compress.pure_funcs = [
          "console.log",
          "console.info",
          "console.debug",
        ];
        args[0].terserOptions.compress.drop_debugger = true;
        return args;
      });

      // 分包：把第三方库拆成独立 chunk，利用浏览器缓存
      config.optimization.splitChunks({
        chunks: "all",
        cacheGroups: {
          vendor: {
            name: "chunk-vendor",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
          elementPlus: {
            name: "chunk-element-plus",
            test: /[\\/]node_modules[\\/](element-plus)[\\/]/,
            priority: 20,
          },
        },
      });
    }
  },

  // 开发服务器配置（仅 npm run serve 时生效）
  devServer: {
    port: 8080,
    // history 模式路由刷新不 404（必须开，否则 /cart 刷新白屏）
    historyApiFallback: true,
    proxy: {
      // TODO-PROXY 把 /api 开头的请求转发到后端开发服务器
      // 【接后端前】现在：target: 'http://localhost:3000'
      // 【接后端后】改成你本地后端地址，例如：target: 'http://localhost:8000'
      "/api": {
        target: "http://localhost:3000", // ← 接后端后改这里
        changeOrigin: true,
        pathRewrite: { "^/api": "" }, // 如果后端路由带 /api ,则需要去掉 /api 前缀，如果不带则注释掉这一行即可
      },
    },
  },
});
