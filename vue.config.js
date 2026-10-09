const { defineConfig } = require("@vue/cli-service");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const isProd = process.env.NODE_ENV === "production";
const report = process.env.npm_config_report === "true" || process.env.ANALYZE === "true";

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "./", // <-- 部署子路径需改（见 README TODO）
  productionSourceMap: false, // 生产不生成 map，防源码泄露
  lintOnSave: process.env.NODE_ENV !== "production",
  assetsDir: "static",

  css: {
    extract: isProd,
    loaderOptions: {
      scss: {
        // 全局注入 variables + mixins，组件直接用 $var / @include，无需 import
        // 新增 styles 文件记得在这里补一行 @use
        additionalData: `@use "@/styles/variables.scss" as *;\n@use "@/styles/mixins.scss" as *;\n`,
      },
    },
  },

  configureWebpack: (config) => {
    const plugins = [];
    if (isProd) {
      // gzip：>10KB 的 js/css/html/svg，level 9，保留原文件兜底。Nginx 需开 gzip_static on
      plugins.push(
        new CompressionWebpackPlugin({
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          algorithm: "gzip",
          compressionOptions: { level: 9 },
          deleteOriginalAssets: false,
        })
      );
    }
    if (report) plugins.push(new BundleAnalyzerPlugin());
    config.plugins = [...(config.plugins || []), ...plugins];
  },

  chainWebpack: (config) => {
    if (isProd) {
      // 删 console.log/info/debug，保留 warn/error 便于排错
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
      // 分包：第三方库独立 chunk，利于浏览器缓存
      config.optimization.splitChunks({
        chunks: "all",
        cacheGroups: {
          vendor: { name: "chunk-vendor", test: /[\\/]node_modules[\\/]/, priority: 10 },
          elementPlus: {
            name: "chunk-element-plus",
            test: /[\\/]node_modules[\\/](element-plus)[\\/]/,
            priority: 20,
          },
        },
      });
    }
  },

  devServer: {
    port: 8080,
    historyApiFallback: true, // history 路由刷新不 404，必须开
    proxy: {
      // <-- 接后端后改 target
      "/api": {
        target: "http://localhost:3000", // 接后端后改成真实后端地址
        changeOrigin: true,
        pathRewrite: { "^/api": "" }, // 后端路由带 /api 则注释这行
      },
    },
  },
});
