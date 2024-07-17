import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
// import { APIURl } from "./src/utils/tools.js";
// 配置@别名，使用@代替../../或../
import { resolve } from "path";
//gzip静态资源压缩引入
// import viteCompression from 'vite-plugin-compression'
// IE和旧版chrome兼容
import legacyPlugin from "@vitejs/plugin-legacy";

export default defineConfig({
  base: "/",
  plugins: [
    vue(),
    AutoImport({
      //安装两行后，在组件中不用再导入ref，reactive等
      imports: ["vue", "vue-router"],
      dts: "src/auto-import.d.ts",
      //element
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      //element
      resolvers: [ElementPlusResolver()],
      //默认存放位置
      dts: "src/components.d.ts",
    }),
    // //gzip插件
    // viteCompression({
    //   verbose: true,
    //   disable: false,
    //   threshold: 10240,
    //   algorithm: 'gzip',
    //   ext: '.gz',
    // }),
    //IE和旧版chrome兼容legacy插件
    legacyPlugin({
      targets: ["chrome >= 52", "firefox >= 54", "ie >= 11"], // 需要兼容的目标列表，可以设置多个
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"], // 面向IE11时需要此插件
      renderLegacyChunks: true,
      polyfills: [
        "es.symbol",
        "es.promise",
        "es.promise.finally",
        "es/map",
        "es/set",
        "es.array.filter",
        "es.array.for-each",
        "es.array.flat-map",
        "es.object.define-properties",
        "es.object.define-property",
        "es.object.get-own-property-descriptor",
        "es.object.get-own-property-descriptors",
        "es.object.keys",
        "es.object.to-string",
        "web.dom-collections.for-each",
        "esnext.global-this",
        "esnext.string.match-all",
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // 👇 告诉打包工具 "vue-demi" 也是外部依赖项 👇
      // external: ["vue", "element-plus", "vue-demi"],
      //超过500k报警
      // chunkSizeWarningLimit: 500,
      output: {
        chunkFileNames: "static/js/[name]-[hash].js",
        entryFileNames: "static/js/[name]-[hash].js",
        assetFileNames: "static/[ext]/[name]-[hash].[ext]",
        //静态资源拆分
        // manualChunks(id) {
        //   if (id.includes('node_modules')) {
        //     return id.toString().split('node_modules/')[1].split('/')[0].toString();
        //   }
        // }
      },
    },
    minify: "terser",
    //清除console和debugger
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 8011, // 设置启动端口号
    host: "0.0.0.0",
    // proxy: {
    //   "/api": {
    //     target: APIURl, //实际请求地址
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ""),
    //   },
      
    // },
  },
});
