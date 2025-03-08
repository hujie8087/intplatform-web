// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/vite@5.1.4_@types+node@20.14.11_sass@1.71.1_terser@5.37.0/node_modules/vite/dist/node/index.js";
import { resolve as resolve2 } from "path";

// build/getEnv.ts
function wrapperEnv(envConf) {
  const ret = {};
  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, "\n");
    realName = realName === "true" ? true : realName === "false" ? false : realName;
    if (envName === "VITE_PORT")
      realName = Number(realName);
    if (envName === "VITE_PROXY") {
      try {
        realName = JSON.parse(realName);
      } catch (error) {
      }
    }
    ret[envName] = realName;
  }
  return ret;
}

// build/proxy.ts
function createProxy(list = []) {
  const ret = {};
  for (const [prefix, target] of list) {
    const httpsRE = /^https:\/\//;
    const isHttps = httpsRE.test(target);
    ret[prefix] = {
      target,
      changeOrigin: true,
      ws: true,
      rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ""),
      // https is require secure=false
      ...isHttps ? { secure: false } : {}
    };
  }
  return ret;
}

// build/plugins.ts
import { resolve } from "path";
import { VitePWA } from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/vite-plugin-pwa@0.17.4_vite@5.1.4_@types+node@20.14.11_sass@1.71.1_terser@5.37.0__workbox-bui_r5g55efeumtmrfhizvjknke6qe/node_modules/vite-plugin-pwa/dist/index.js";
import { createHtmlPlugin } from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/vite-plugin-html@3.2.2_vite@5.1.4_@types+node@20.14.11_sass@1.71.1_terser@5.37.0_/node_modules/vite-plugin-html/dist/index.mjs";
import { visualizer } from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/rollup-plugin-visualizer@5.12.0_rollup@2.79.2/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { createSvgIconsPlugin } from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@5.1.4_@types+node@20.14.11_sass@1.71.1_terser@5.37.0_/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import vue from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/@vitejs+plugin-vue@5.0.4_vite@5.1.4_@types+node@20.14.11_sass@1.71.1_terser@5.37.0__vue@3.4.21_typescript@5.3.3_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.1.0_vite@5.1.4_@types+node@20.14.11_sass@1.71.1_terser@5.37.0__vue@3.4.21_typescript@5.3.3_/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import eslintPlugin from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/vite-plugin-eslint@1.8.1_eslint@8.57.0_vite@5.1.4_@types+node@20.14.11_sass@1.71.1_terser@5.37.0_/node_modules/vite-plugin-eslint/dist/index.mjs";
import viteCompression from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/vite-plugin-compression@0.5.1_vite@5.1.4_@types+node@20.14.11_sass@1.71.1_terser@5.37.0_/node_modules/vite-plugin-compression/dist/index.mjs";
import vueSetupExtend from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/unplugin-vue-setup-extend-plus@1.0.1/node_modules/unplugin-vue-setup-extend-plus/dist/vite.js";
var createVitePlugins = (viteEnv) => {
  const { VITE_GLOB_APP_TITLE, VITE_REPORT, VITE_PWA } = viteEnv;
  return [
    vue(),
    // vue 可以使用 jsx/tsx 语法
    vueJsx(),
    // esLint 报错信息显示在浏览器界面上
    eslintPlugin(),
    // name 可以写在 script 标签上
    vueSetupExtend({}),
    // 创建打包压缩配置
    createCompression(viteEnv),
    // 注入变量到 html 文件
    createHtmlPlugin({
      minify: true,
      inject: {
        data: { title: VITE_GLOB_APP_TITLE }
      }
    }),
    // 使用 svg 图标
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[dir]-[name]"
    }),
    // vitePWA
    VITE_PWA && createVitePwa(viteEnv),
    // 是否生成包预览，分析依赖包大小做优化处理
    VITE_REPORT && visualizer({ filename: "stats.html", gzipSize: true, brotliSize: true })
  ];
};
var createCompression = (viteEnv) => {
  const { VITE_BUILD_COMPRESS = "none", VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE } = viteEnv;
  const compressList = VITE_BUILD_COMPRESS.split(",");
  const plugins = [];
  if (compressList.includes("gzip")) {
    plugins.push(
      viteCompression({
        ext: ".gz",
        algorithm: "gzip",
        deleteOriginFile: VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
      })
    );
  }
  if (compressList.includes("brotli")) {
    plugins.push(
      viteCompression({
        ext: ".br",
        algorithm: "brotliCompress",
        deleteOriginFile: VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
      })
    );
  }
  return plugins;
};
var createVitePwa = (viteEnv) => {
  const { VITE_GLOB_APP_TITLE } = viteEnv;
  return VitePWA({
    registerType: "autoUpdate",
    manifest: {
      name: VITE_GLOB_APP_TITLE,
      short_name: VITE_GLOB_APP_TITLE,
      theme_color: "#ffffff",
      icons: [
        {
          src: "/logo.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/logo.png",
          sizes: "512x512",
          type: "image/png"
        },
        {
          src: "/logo.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    }
  });
};

// package.json
var package_default = {
  name: "logistics-admin",
  private: true,
  version: "1.2.0",
  type: "module",
  description: "\u540E\u52E4\u670D\u52A1\u7EFC\u5408\u5E73\u53F0",
  author: {
    name: "jayden",
    email: "80776811@qq.com"
  },
  scripts: {
    dev: "vite",
    serve: "vite",
    "build:dev": "vite build --mode development",
    "build:test": "vue-tsc && vite build --mode test",
    "build:pro": "vite build --mode production",
    "type:check": "vue-tsc --noEmit --skipLibCheck",
    preview: "npm run build:dev && vite preview",
    "lint:eslint": "eslint --fix --ext .js,.ts,.vue ./src",
    "lint:prettier": 'prettier --write "src/**/*.{js,ts,json,tsx,css,less,scss,vue,html,md}"',
    "lint:stylelint": 'stylelint --cache --fix "**/*.{vue,less,postcss,css,scss}" --cache --cache-location node_modules/.cache/stylelint/',
    "lint:lint-staged": "lint-staged",
    prepare: "husky install",
    release: "standard-version",
    commit: "git add -A && czg && git push"
  },
  dependencies: {
    "@element-plus/icons-vue": "2.3.1",
    "@types/node": "20.14.11",
    "@vueuse/core": "10.9.0",
    "@wangeditor/editor": "5.1.23",
    "@wangeditor/editor-for-vue": "5.1.12",
    axios: "1.6.7",
    dayjs: "1.11.10",
    "driver.js": "1.3.1",
    echarts: "5.5.0",
    "echarts-liquidfill": "3.1.0",
    "element-plus": "2.8.8",
    firebase: "^11.2.0",
    lodash: "4.17.21",
    md5: "2.3.0",
    mitt: "3.0.1",
    nprogress: "0.2.0",
    pinia: "2.1.7",
    "pinia-plugin-persistedstate": "3.2.1",
    qs: "6.11.2",
    screenfull: "6.0.2",
    sortablejs: "1.15.2",
    "spark-md5": "^3.0.2",
    vue: "3.4.21",
    "vue-i18n": "9.10.1",
    "vue-loader": "17.4.2",
    "vue-qrcode": "^2.2.2",
    "vue-router": "4.3.0",
    vuedraggable: "4.1.0"
  },
  devDependencies: {
    "@commitlint/cli": "18.4.3",
    "@commitlint/config-conventional": "18.4.3",
    "@types/md5": "2.3.5",
    "@types/nprogress": "0.2.3",
    "@types/qs": "6.9.12",
    "@types/sortablejs": "1.15.8",
    "@typescript-eslint/eslint-plugin": "7.1.0",
    "@typescript-eslint/parser": "7.1.0",
    "@vitejs/plugin-vue": "5.0.4",
    "@vitejs/plugin-vue-jsx": "3.1.0",
    "@vue-leaflet/vue-leaflet": "^0.10.1",
    autoprefixer: "10.4.18",
    "cz-git": "1.9.0",
    czg: "1.9.0",
    eslint: "8.57.0",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-prettier": "5.1.3",
    "eslint-plugin-vue": "9.22.0",
    husky: "9.0.11",
    leaflet: "^1.9.4",
    "lint-staged": "15.2.2",
    postcss: "8.4.35",
    "postcss-html": "1.6.0",
    prettier: "3.2.5",
    "rollup-plugin-visualizer": "5.12.0",
    sass: "1.71.1",
    "standard-version": "9.5.0",
    stylelint: "16.1.0",
    "stylelint-config-html": "1.1.0",
    "stylelint-config-recess-order": "5.0.0",
    "stylelint-config-recommended-scss": "14.0.0",
    "stylelint-config-recommended-vue": "1.5.0",
    "stylelint-config-standard": "36.0.0",
    "stylelint-config-standard-scss": "13.0.0",
    typescript: "5.3.3",
    "unplugin-vue-setup-extend-plus": "1.0.1",
    vite: "5.1.4",
    "vite-plugin-compression": "0.5.1",
    "vite-plugin-eslint": "1.8.1",
    "vite-plugin-html": "3.2.2",
    "vite-plugin-pwa": "0.17.4",
    "vite-plugin-svg-icons": "2.0.1",
    "vue-tsc": "1.8.27"
  },
  engines: {
    node: ">=16.0.0"
  },
  browserslist: {
    production: [
      "> 1%",
      "not dead",
      "not op_mini all"
    ],
    development: [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  config: {
    commitizen: {
      path: "node_modules/cz-git"
    }
  }
};

// vite.config.ts
import dayjs from "file:///D:/IWIPproject/intplatform/intplatform-web/node_modules/.pnpm/dayjs@1.11.10/node_modules/dayjs/dayjs.min.js";
var __vite_injected_original_dirname = "D:\\IWIPproject\\intplatform\\intplatform-web";
var { dependencies, devDependencies, name, version } = package_default;
var __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
};
var vite_config_default = defineConfig(({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);
  return {
    base: viteEnv.VITE_PUBLIC_PATH,
    root,
    assetsInclude: ["**/*.webp"],
    resolve: {
      alias: {
        "@": resolve2(__vite_injected_original_dirname, "./src"),
        "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js"
      }
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/var.scss";`
        }
      }
    },
    server: {
      host: "0.0.0.0",
      port: viteEnv.VITE_PORT,
      open: false,
      cors: true,
      // Load proxy configuration from .env.development
      proxy: createProxy(viteEnv.VITE_PROXY)
    },
    plugins: createVitePlugins(viteEnv),
    esbuild: {
      pure: viteEnv.VITE_DROP_CONSOLE ? ["console.log", "debugger"] : []
    },
    build: {
      outDir: "dist",
      minify: "esbuild",
      // esbuild 打包更快，但是不能去除 console.log，terser打包慢，但能去除 console.log
      // minify: "terser",
      // terserOptions: {
      // 	compress: {
      // 		drop_console: viteEnv.VITE_DROP_CONSOLE,
      // 		drop_debugger: true
      // 	}
      // },
      sourcemap: false,
      // 禁用 gzip 压缩大小报告，可略微减少打包时间
      reportCompressedSize: false,
      // 规定触发警告的 chunk 大小
      chunkSizeWarningLimit: 2e3,
      rollupOptions: {
        output: {
          // Static resource classification and packaging
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYnVpbGQvZ2V0RW52LnRzIiwgImJ1aWxkL3Byb3h5LnRzIiwgImJ1aWxkL3BsdWdpbnMudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcSVdJUHByb2plY3RcXFxcaW50cGxhdGZvcm1cXFxcaW50cGxhdGZvcm0td2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxJV0lQcHJvamVjdFxcXFxpbnRwbGF0Zm9ybVxcXFxpbnRwbGF0Zm9ybS13ZWJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0lXSVBwcm9qZWN0L2ludHBsYXRmb3JtL2ludHBsYXRmb3JtLXdlYi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiwgQ29uZmlnRW52LCBVc2VyQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IHdyYXBwZXJFbnYgfSBmcm9tIFwiLi9idWlsZC9nZXRFbnZcIjtcclxuaW1wb3J0IHsgY3JlYXRlUHJveHkgfSBmcm9tIFwiLi9idWlsZC9wcm94eVwiO1xyXG5pbXBvcnQgeyBjcmVhdGVWaXRlUGx1Z2lucyB9IGZyb20gXCIuL2J1aWxkL3BsdWdpbnNcIjtcclxuaW1wb3J0IHBrZyBmcm9tIFwiLi9wYWNrYWdlLmpzb25cIjtcclxuaW1wb3J0IGRheWpzIGZyb20gXCJkYXlqc1wiO1xyXG5cclxuY29uc3QgeyBkZXBlbmRlbmNpZXMsIGRldkRlcGVuZGVuY2llcywgbmFtZSwgdmVyc2lvbiB9ID0gcGtnO1xyXG5jb25zdCBfX0FQUF9JTkZPX18gPSB7XHJcbiAgcGtnOiB7IGRlcGVuZGVuY2llcywgZGV2RGVwZW5kZW5jaWVzLCBuYW1lLCB2ZXJzaW9uIH0sXHJcbiAgbGFzdEJ1aWxkVGltZTogZGF5anMoKS5mb3JtYXQoXCJZWVlZLU1NLUREIEhIOm1tOnNzXCIpXHJcbn07XHJcblxyXG4vLyBAc2VlOiBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9OiBDb25maWdFbnYpOiBVc2VyQ29uZmlnID0+IHtcclxuICBjb25zdCByb290ID0gcHJvY2Vzcy5jd2QoKTtcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHJvb3QpO1xyXG4gIGNvbnN0IHZpdGVFbnYgPSB3cmFwcGVyRW52KGVudik7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBiYXNlOiB2aXRlRW52LlZJVEVfUFVCTElDX1BBVEgsXHJcbiAgICByb290LFxyXG4gICAgYXNzZXRzSW5jbHVkZTogW1wiKiovKi53ZWJwXCJdLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgICBcInZ1ZS1pMThuXCI6IFwidnVlLWkxOG4vZGlzdC92dWUtaTE4bi5janMuanNcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgIF9fQVBQX0lORk9fXzogSlNPTi5zdHJpbmdpZnkoX19BUFBfSU5GT19fKVxyXG4gICAgfSxcclxuICAgIGNzczoge1xyXG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgc2Nzczoge1xyXG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAaW1wb3J0IFwiQC9zdHlsZXMvdmFyLnNjc3NcIjtgXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxyXG4gICAgICBwb3J0OiB2aXRlRW52LlZJVEVfUE9SVCxcclxuICAgICAgb3BlbjogZmFsc2UsXHJcbiAgICAgIGNvcnM6IHRydWUsXHJcbiAgICAgIC8vIExvYWQgcHJveHkgY29uZmlndXJhdGlvbiBmcm9tIC5lbnYuZGV2ZWxvcG1lbnRcclxuICAgICAgcHJveHk6IGNyZWF0ZVByb3h5KHZpdGVFbnYuVklURV9QUk9YWSlcclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBjcmVhdGVWaXRlUGx1Z2lucyh2aXRlRW52KSxcclxuICAgIGVzYnVpbGQ6IHtcclxuICAgICAgcHVyZTogdml0ZUVudi5WSVRFX0RST1BfQ09OU09MRSA/IFtcImNvbnNvbGUubG9nXCIsIFwiZGVidWdnZXJcIl0gOiBbXVxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIG91dERpcjogXCJkaXN0XCIsXHJcbiAgICAgIG1pbmlmeTogXCJlc2J1aWxkXCIsXHJcbiAgICAgIC8vIGVzYnVpbGQgXHU2MjUzXHU1MzA1XHU2NkY0XHU1RkVCXHVGRjBDXHU0RjQ2XHU2NjJGXHU0RTBEXHU4MEZEXHU1M0JCXHU5NjY0IGNvbnNvbGUubG9nXHVGRjBDdGVyc2VyXHU2MjUzXHU1MzA1XHU2MTYyXHVGRjBDXHU0RjQ2XHU4MEZEXHU1M0JCXHU5NjY0IGNvbnNvbGUubG9nXHJcbiAgICAgIC8vIG1pbmlmeTogXCJ0ZXJzZXJcIixcclxuICAgICAgLy8gdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICAvLyBcdGNvbXByZXNzOiB7XHJcbiAgICAgIC8vIFx0XHRkcm9wX2NvbnNvbGU6IHZpdGVFbnYuVklURV9EUk9QX0NPTlNPTEUsXHJcbiAgICAgIC8vIFx0XHRkcm9wX2RlYnVnZ2VyOiB0cnVlXHJcbiAgICAgIC8vIFx0fVxyXG4gICAgICAvLyB9LFxyXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICAvLyBcdTc5ODFcdTc1MjggZ3ppcCBcdTUzOEJcdTdGMjlcdTU5MjdcdTVDMEZcdTYyQTVcdTU0NEFcdUZGMENcdTUzRUZcdTc1NjVcdTVGQUVcdTUxQ0ZcdTVDMTFcdTYyNTNcdTUzMDVcdTY1RjZcdTk1RjRcclxuICAgICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlLFxyXG4gICAgICAvLyBcdTg5QzRcdTVCOUFcdTg5RTZcdTUzRDFcdThCNjZcdTU0NEFcdTc2ODQgY2h1bmsgXHU1OTI3XHU1QzBGXHJcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgLy8gU3RhdGljIHJlc291cmNlIGNsYXNzaWZpY2F0aW9uIGFuZCBwYWNrYWdpbmdcclxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9qcy9bbmFtZV0tW2hhc2hdLmpzXCIsXHJcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvanMvW25hbWVdLVtoYXNoXS5qc1wiLFxyXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IFwiYXNzZXRzL1tleHRdL1tuYW1lXS1baGFzaF0uW2V4dF1cIlxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn0pO1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXElXSVBwcm9qZWN0XFxcXGludHBsYXRmb3JtXFxcXGludHBsYXRmb3JtLXdlYlxcXFxidWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcSVdJUHByb2plY3RcXFxcaW50cGxhdGZvcm1cXFxcaW50cGxhdGZvcm0td2ViXFxcXGJ1aWxkXFxcXGdldEVudi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovSVdJUHByb2plY3QvaW50cGxhdGZvcm0vaW50cGxhdGZvcm0td2ViL2J1aWxkL2dldEVudi50c1wiO2ltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNEZXZGbihtb2RlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICByZXR1cm4gbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9kRm4obW9kZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIG1vZGUgPT09IFwicHJvZHVjdGlvblwiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNUZXN0Rm4obW9kZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIG1vZGUgPT09IFwidGVzdFwiO1xyXG59XHJcblxyXG4vKipcclxuICogV2hldGhlciB0byBnZW5lcmF0ZSBwYWNrYWdlIHByZXZpZXdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1JlcG9ydE1vZGUoKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIHByb2Nlc3MuZW52LlZJVEVfUkVQT1JUID09PSBcInRydWVcIjtcclxufVxyXG5cclxuLy8gUmVhZCBhbGwgZW52aXJvbm1lbnQgdmFyaWFibGUgY29uZmlndXJhdGlvbiBmaWxlcyB0byBwcm9jZXNzLmVudlxyXG5leHBvcnQgZnVuY3Rpb24gd3JhcHBlckVudihlbnZDb25mOiBSZWNvcmRhYmxlKTogVml0ZUVudiB7XHJcbiAgY29uc3QgcmV0OiBhbnkgPSB7fTtcclxuXHJcbiAgZm9yIChjb25zdCBlbnZOYW1lIG9mIE9iamVjdC5rZXlzKGVudkNvbmYpKSB7XHJcbiAgICBsZXQgcmVhbE5hbWUgPSBlbnZDb25mW2Vudk5hbWVdLnJlcGxhY2UoL1xcXFxuL2csIFwiXFxuXCIpO1xyXG4gICAgcmVhbE5hbWUgPSByZWFsTmFtZSA9PT0gXCJ0cnVlXCIgPyB0cnVlIDogcmVhbE5hbWUgPT09IFwiZmFsc2VcIiA/IGZhbHNlIDogcmVhbE5hbWU7XHJcbiAgICBpZiAoZW52TmFtZSA9PT0gXCJWSVRFX1BPUlRcIikgcmVhbE5hbWUgPSBOdW1iZXIocmVhbE5hbWUpO1xyXG4gICAgaWYgKGVudk5hbWUgPT09IFwiVklURV9QUk9YWVwiKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmVhbE5hbWUgPSBKU09OLnBhcnNlKHJlYWxOYW1lKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XHJcbiAgICB9XHJcbiAgICByZXRbZW52TmFtZV0gPSByZWFsTmFtZTtcclxuICB9XHJcbiAgcmV0dXJuIHJldDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB1c2VyIHJvb3QgZGlyZWN0b3J5XHJcbiAqIEBwYXJhbSBkaXIgZmlsZSBwYXRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um9vdFBhdGgoLi4uZGlyOiBzdHJpbmdbXSkge1xyXG4gIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgLi4uZGlyKTtcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXElXSVBwcm9qZWN0XFxcXGludHBsYXRmb3JtXFxcXGludHBsYXRmb3JtLXdlYlxcXFxidWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcSVdJUHByb2plY3RcXFxcaW50cGxhdGZvcm1cXFxcaW50cGxhdGZvcm0td2ViXFxcXGJ1aWxkXFxcXHByb3h5LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9JV0lQcHJvamVjdC9pbnRwbGF0Zm9ybS9pbnRwbGF0Zm9ybS13ZWIvYnVpbGQvcHJveHkudHNcIjtpbXBvcnQgdHlwZSB7IFByb3h5T3B0aW9ucyB9IGZyb20gXCJ2aXRlXCI7XHJcblxyXG50eXBlIFByb3h5SXRlbSA9IFtzdHJpbmcsIHN0cmluZ107XHJcblxyXG50eXBlIFByb3h5TGlzdCA9IFByb3h5SXRlbVtdO1xyXG5cclxudHlwZSBQcm94eVRhcmdldExpc3QgPSBSZWNvcmQ8c3RyaW5nLCBQcm94eU9wdGlvbnM+O1xyXG5cclxuLyoqXHJcbiAqIFx1NTIxQlx1NUVGQVx1NEVFM1x1NzQwNlx1RkYwQ1x1NzUyOFx1NEU4RVx1ODlFM1x1Njc5MCAuZW52LmRldmVsb3BtZW50IFx1NEVFM1x1NzQwNlx1OTE0RFx1N0Y2RVxyXG4gKiBAcGFyYW0gbGlzdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb3h5KGxpc3Q6IFByb3h5TGlzdCA9IFtdKSB7XHJcbiAgY29uc3QgcmV0OiBQcm94eVRhcmdldExpc3QgPSB7fTtcclxuICBmb3IgKGNvbnN0IFtwcmVmaXgsIHRhcmdldF0gb2YgbGlzdCkge1xyXG4gICAgY29uc3QgaHR0cHNSRSA9IC9eaHR0cHM6XFwvXFwvLztcclxuICAgIGNvbnN0IGlzSHR0cHMgPSBodHRwc1JFLnRlc3QodGFyZ2V0KTtcclxuXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vaHR0cC1wYXJ0eS9ub2RlLWh0dHAtcHJveHkjb3B0aW9uc1xyXG4gICAgcmV0W3ByZWZpeF0gPSB7XHJcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxyXG4gICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgIHdzOiB0cnVlLFxyXG4gICAgICByZXdyaXRlOiBwYXRoID0+IHBhdGgucmVwbGFjZShuZXcgUmVnRXhwKGBeJHtwcmVmaXh9YCksIFwiXCIpLFxyXG4gICAgICAvLyBodHRwcyBpcyByZXF1aXJlIHNlY3VyZT1mYWxzZVxyXG4gICAgICAuLi4oaXNIdHRwcyA/IHsgc2VjdXJlOiBmYWxzZSB9IDoge30pXHJcbiAgICB9O1xyXG4gIH1cclxuICByZXR1cm4gcmV0O1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcSVdJUHByb2plY3RcXFxcaW50cGxhdGZvcm1cXFxcaW50cGxhdGZvcm0td2ViXFxcXGJ1aWxkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxJV0lQcHJvamVjdFxcXFxpbnRwbGF0Zm9ybVxcXFxpbnRwbGF0Zm9ybS13ZWJcXFxcYnVpbGRcXFxccGx1Z2lucy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovSVdJUHByb2plY3QvaW50cGxhdGZvcm0vaW50cGxhdGZvcm0td2ViL2J1aWxkL3BsdWdpbnMudHNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgUGx1Z2luT3B0aW9uIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcclxuaW1wb3J0IHsgY3JlYXRlSHRtbFBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1odG1sXCI7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XHJcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLXN2Zy1pY29uc1wiO1xyXG5pbXBvcnQgdnVlIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWVcIjtcclxuaW1wb3J0IHZ1ZUpzeCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiO1xyXG5pbXBvcnQgZXNsaW50UGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1lc2xpbnRcIjtcclxuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tIFwidml0ZS1wbHVnaW4tY29tcHJlc3Npb25cIjtcclxuaW1wb3J0IHZ1ZVNldHVwRXh0ZW5kIGZyb20gXCJ1bnBsdWdpbi12dWUtc2V0dXAtZXh0ZW5kLXBsdXMvdml0ZVwiO1xyXG5cclxuLyoqXHJcbiAqIFx1NTIxQlx1NUVGQSB2aXRlIFx1NjNEMlx1NEVGNlxyXG4gKiBAcGFyYW0gdml0ZUVudlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZVZpdGVQbHVnaW5zID0gKHZpdGVFbnY6IFZpdGVFbnYpOiAoUGx1Z2luT3B0aW9uIHwgUGx1Z2luT3B0aW9uW10pW10gPT4ge1xyXG4gIGNvbnN0IHsgVklURV9HTE9CX0FQUF9USVRMRSwgVklURV9SRVBPUlQsIFZJVEVfUFdBIH0gPSB2aXRlRW52O1xyXG4gIHJldHVybiBbXHJcbiAgICB2dWUoKSxcclxuICAgIC8vIHZ1ZSBcdTUzRUZcdTRFRTVcdTRGN0ZcdTc1MjgganN4L3RzeCBcdThCRURcdTZDRDVcclxuICAgIHZ1ZUpzeCgpLFxyXG4gICAgLy8gZXNMaW50IFx1NjJBNVx1OTUxOVx1NEZFMVx1NjA2Rlx1NjYzRVx1NzkzQVx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NzU0Q1x1OTc2Mlx1NEUwQVxyXG4gICAgZXNsaW50UGx1Z2luKCksXHJcbiAgICAvLyBuYW1lIFx1NTNFRlx1NEVFNVx1NTE5OVx1NTcyOCBzY3JpcHQgXHU2ODA3XHU3QjdFXHU0RTBBXHJcbiAgICB2dWVTZXR1cEV4dGVuZCh7fSksXHJcbiAgICAvLyBcdTUyMUJcdTVFRkFcdTYyNTNcdTUzMDVcdTUzOEJcdTdGMjlcdTkxNERcdTdGNkVcclxuICAgIGNyZWF0ZUNvbXByZXNzaW9uKHZpdGVFbnYpLFxyXG4gICAgLy8gXHU2Q0U4XHU1MTY1XHU1M0Q4XHU5MUNGXHU1MjMwIGh0bWwgXHU2NTg3XHU0RUY2XHJcbiAgICBjcmVhdGVIdG1sUGx1Z2luKHtcclxuICAgICAgbWluaWZ5OiB0cnVlLFxyXG4gICAgICBpbmplY3Q6IHtcclxuICAgICAgICBkYXRhOiB7IHRpdGxlOiBWSVRFX0dMT0JfQVBQX1RJVExFIH1cclxuICAgICAgfVxyXG4gICAgfSksXHJcbiAgICAvLyBcdTRGN0ZcdTc1Mjggc3ZnIFx1NTZGRVx1NjgwN1xyXG4gICAgY3JlYXRlU3ZnSWNvbnNQbHVnaW4oe1xyXG4gICAgICBpY29uRGlyczogW3Jlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCJzcmMvYXNzZXRzL2ljb25zXCIpXSxcclxuICAgICAgc3ltYm9sSWQ6IFwiaWNvbi1bZGlyXS1bbmFtZV1cIlxyXG4gICAgfSksXHJcbiAgICAvLyB2aXRlUFdBXHJcbiAgICBWSVRFX1BXQSAmJiBjcmVhdGVWaXRlUHdhKHZpdGVFbnYpLFxyXG4gICAgLy8gXHU2NjJGXHU1NDI2XHU3NTFGXHU2MjEwXHU1MzA1XHU5ODg0XHU4OUM4XHVGRjBDXHU1MjA2XHU2NzkwXHU0RjlEXHU4RDU2XHU1MzA1XHU1OTI3XHU1QzBGXHU1MDVBXHU0RjE4XHU1MzE2XHU1OTA0XHU3NDA2XHJcbiAgICBWSVRFX1JFUE9SVCAmJiAodmlzdWFsaXplcih7IGZpbGVuYW1lOiBcInN0YXRzLmh0bWxcIiwgZ3ppcFNpemU6IHRydWUsIGJyb3RsaVNpemU6IHRydWUgfSkgYXMgUGx1Z2luT3B0aW9uKVxyXG4gIF07XHJcbn07XHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uIFx1NjgzOVx1NjM2RSBjb21wcmVzcyBcdTkxNERcdTdGNkVcdUZGMENcdTc1MUZcdTYyMTBcdTRFMERcdTU0MENcdTc2ODRcdTUzOEJcdTdGMjlcdTg5QzRcdTUyMTlcclxuICogQHBhcmFtIHZpdGVFbnZcclxuICovXHJcbmNvbnN0IGNyZWF0ZUNvbXByZXNzaW9uID0gKHZpdGVFbnY6IFZpdGVFbnYpOiBQbHVnaW5PcHRpb24gfCBQbHVnaW5PcHRpb25bXSA9PiB7XHJcbiAgY29uc3QgeyBWSVRFX0JVSUxEX0NPTVBSRVNTID0gXCJub25lXCIsIFZJVEVfQlVJTERfQ09NUFJFU1NfREVMRVRFX09SSUdJTl9GSUxFIH0gPSB2aXRlRW52O1xyXG4gIGNvbnN0IGNvbXByZXNzTGlzdCA9IFZJVEVfQlVJTERfQ09NUFJFU1Muc3BsaXQoXCIsXCIpO1xyXG4gIGNvbnN0IHBsdWdpbnM6IFBsdWdpbk9wdGlvbltdID0gW107XHJcbiAgaWYgKGNvbXByZXNzTGlzdC5pbmNsdWRlcyhcImd6aXBcIikpIHtcclxuICAgIHBsdWdpbnMucHVzaChcclxuICAgICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgICBleHQ6IFwiLmd6XCIsXHJcbiAgICAgICAgYWxnb3JpdGhtOiBcImd6aXBcIixcclxuICAgICAgICBkZWxldGVPcmlnaW5GaWxlOiBWSVRFX0JVSUxEX0NPTVBSRVNTX0RFTEVURV9PUklHSU5fRklMRVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgaWYgKGNvbXByZXNzTGlzdC5pbmNsdWRlcyhcImJyb3RsaVwiKSkge1xyXG4gICAgcGx1Z2lucy5wdXNoKFxyXG4gICAgICB2aXRlQ29tcHJlc3Npb24oe1xyXG4gICAgICAgIGV4dDogXCIuYnJcIixcclxuICAgICAgICBhbGdvcml0aG06IFwiYnJvdGxpQ29tcHJlc3NcIixcclxuICAgICAgICBkZWxldGVPcmlnaW5GaWxlOiBWSVRFX0JVSUxEX0NPTVBSRVNTX0RFTEVURV9PUklHSU5fRklMRVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcmV0dXJuIHBsdWdpbnM7XHJcbn07XHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uIFZpdGVQd2FcclxuICogQHBhcmFtIHZpdGVFbnZcclxuICovXHJcbmNvbnN0IGNyZWF0ZVZpdGVQd2EgPSAodml0ZUVudjogVml0ZUVudik6IFBsdWdpbk9wdGlvbiB8IFBsdWdpbk9wdGlvbltdID0+IHtcclxuICBjb25zdCB7IFZJVEVfR0xPQl9BUFBfVElUTEUgfSA9IHZpdGVFbnY7XHJcbiAgcmV0dXJuIFZpdGVQV0Eoe1xyXG4gICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcclxuICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgIG5hbWU6IFZJVEVfR0xPQl9BUFBfVElUTEUsXHJcbiAgICAgIHNob3J0X25hbWU6IFZJVEVfR0xPQl9BUFBfVElUTEUsXHJcbiAgICAgIHRoZW1lX2NvbG9yOiBcIiNmZmZmZmZcIixcclxuICAgICAgaWNvbnM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzcmM6IFwiL2xvZ28ucG5nXCIsXHJcbiAgICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXHJcbiAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzcmM6IFwiL2xvZ28ucG5nXCIsXHJcbiAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXHJcbiAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzcmM6IFwiL2xvZ28ucG5nXCIsXHJcbiAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXHJcbiAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxyXG4gICAgICAgICAgcHVycG9zZTogXCJhbnkgbWFza2FibGVcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0pO1xyXG59O1xyXG4iLCAie1xyXG4gIFwibmFtZVwiOiBcImxvZ2lzdGljcy1hZG1pblwiLFxyXG4gIFwicHJpdmF0ZVwiOiB0cnVlLFxyXG4gIFwidmVyc2lvblwiOiBcIjEuMi4wXCIsXHJcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXHJcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlx1NTQwRVx1NTJFNFx1NjcwRFx1NTJBMVx1N0VGQ1x1NTQwOFx1NUU3M1x1NTNGMFwiLFxyXG4gIFwiYXV0aG9yXCI6IHtcclxuICAgIFwibmFtZVwiOiBcImpheWRlblwiLFxyXG4gICAgXCJlbWFpbFwiOiBcIjgwNzc2ODExQHFxLmNvbVwiXHJcbiAgfSxcclxuICBcInNjcmlwdHNcIjoge1xyXG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXHJcbiAgICBcInNlcnZlXCI6IFwidml0ZVwiLFxyXG4gICAgXCJidWlsZDpkZXZcIjogXCJ2aXRlIGJ1aWxkIC0tbW9kZSBkZXZlbG9wbWVudFwiLFxyXG4gICAgXCJidWlsZDp0ZXN0XCI6IFwidnVlLXRzYyAmJiB2aXRlIGJ1aWxkIC0tbW9kZSB0ZXN0XCIsXHJcbiAgICBcImJ1aWxkOnByb1wiOiBcInZpdGUgYnVpbGQgLS1tb2RlIHByb2R1Y3Rpb25cIixcclxuICAgIFwidHlwZTpjaGVja1wiOiBcInZ1ZS10c2MgLS1ub0VtaXQgLS1za2lwTGliQ2hlY2tcIixcclxuICAgIFwicHJldmlld1wiOiBcIm5wbSBydW4gYnVpbGQ6ZGV2ICYmIHZpdGUgcHJldmlld1wiLFxyXG4gICAgXCJsaW50OmVzbGludFwiOiBcImVzbGludCAtLWZpeCAtLWV4dCAuanMsLnRzLC52dWUgLi9zcmNcIixcclxuICAgIFwibGludDpwcmV0dGllclwiOiBcInByZXR0aWVyIC0td3JpdGUgXFxcInNyYy8qKi8qLntqcyx0cyxqc29uLHRzeCxjc3MsbGVzcyxzY3NzLHZ1ZSxodG1sLG1kfVxcXCJcIixcclxuICAgIFwibGludDpzdHlsZWxpbnRcIjogXCJzdHlsZWxpbnQgLS1jYWNoZSAtLWZpeCBcXFwiKiovKi57dnVlLGxlc3MscG9zdGNzcyxjc3Msc2Nzc31cXFwiIC0tY2FjaGUgLS1jYWNoZS1sb2NhdGlvbiBub2RlX21vZHVsZXMvLmNhY2hlL3N0eWxlbGludC9cIixcclxuICAgIFwibGludDpsaW50LXN0YWdlZFwiOiBcImxpbnQtc3RhZ2VkXCIsXHJcbiAgICBcInByZXBhcmVcIjogXCJodXNreSBpbnN0YWxsXCIsXHJcbiAgICBcInJlbGVhc2VcIjogXCJzdGFuZGFyZC12ZXJzaW9uXCIsXHJcbiAgICBcImNvbW1pdFwiOiBcImdpdCBhZGQgLUEgJiYgY3pnICYmIGdpdCBwdXNoXCJcclxuICB9LFxyXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiQGVsZW1lbnQtcGx1cy9pY29ucy12dWVcIjogXCIyLjMuMVwiLFxyXG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcIjIwLjE0LjExXCIsXHJcbiAgICBcIkB2dWV1c2UvY29yZVwiOiBcIjEwLjkuMFwiLFxyXG4gICAgXCJAd2FuZ2VkaXRvci9lZGl0b3JcIjogXCI1LjEuMjNcIixcclxuICAgIFwiQHdhbmdlZGl0b3IvZWRpdG9yLWZvci12dWVcIjogXCI1LjEuMTJcIixcclxuICAgIFwiYXhpb3NcIjogXCIxLjYuN1wiLFxyXG4gICAgXCJkYXlqc1wiOiBcIjEuMTEuMTBcIixcclxuICAgIFwiZHJpdmVyLmpzXCI6IFwiMS4zLjFcIixcclxuICAgIFwiZWNoYXJ0c1wiOiBcIjUuNS4wXCIsXHJcbiAgICBcImVjaGFydHMtbGlxdWlkZmlsbFwiOiBcIjMuMS4wXCIsXHJcbiAgICBcImVsZW1lbnQtcGx1c1wiOiBcIjIuOC44XCIsXHJcbiAgICBcImZpcmViYXNlXCI6IFwiXjExLjIuMFwiLFxyXG4gICAgXCJsb2Rhc2hcIjogXCI0LjE3LjIxXCIsXHJcbiAgICBcIm1kNVwiOiBcIjIuMy4wXCIsXHJcbiAgICBcIm1pdHRcIjogXCIzLjAuMVwiLFxyXG4gICAgXCJucHJvZ3Jlc3NcIjogXCIwLjIuMFwiLFxyXG4gICAgXCJwaW5pYVwiOiBcIjIuMS43XCIsXHJcbiAgICBcInBpbmlhLXBsdWdpbi1wZXJzaXN0ZWRzdGF0ZVwiOiBcIjMuMi4xXCIsXHJcbiAgICBcInFzXCI6IFwiNi4xMS4yXCIsXHJcbiAgICBcInNjcmVlbmZ1bGxcIjogXCI2LjAuMlwiLFxyXG4gICAgXCJzb3J0YWJsZWpzXCI6IFwiMS4xNS4yXCIsXHJcbiAgICBcInNwYXJrLW1kNVwiOiBcIl4zLjAuMlwiLFxyXG4gICAgXCJ2dWVcIjogXCIzLjQuMjFcIixcclxuICAgIFwidnVlLWkxOG5cIjogXCI5LjEwLjFcIixcclxuICAgIFwidnVlLWxvYWRlclwiOiBcIjE3LjQuMlwiLFxyXG4gICAgXCJ2dWUtcXJjb2RlXCI6IFwiXjIuMi4yXCIsXHJcbiAgICBcInZ1ZS1yb3V0ZXJcIjogXCI0LjMuMFwiLFxyXG4gICAgXCJ2dWVkcmFnZ2FibGVcIjogXCI0LjEuMFwiXHJcbiAgfSxcclxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XHJcbiAgICBcIkBjb21taXRsaW50L2NsaVwiOiBcIjE4LjQuM1wiLFxyXG4gICAgXCJAY29tbWl0bGludC9jb25maWctY29udmVudGlvbmFsXCI6IFwiMTguNC4zXCIsXHJcbiAgICBcIkB0eXBlcy9tZDVcIjogXCIyLjMuNVwiLFxyXG4gICAgXCJAdHlwZXMvbnByb2dyZXNzXCI6IFwiMC4yLjNcIixcclxuICAgIFwiQHR5cGVzL3FzXCI6IFwiNi45LjEyXCIsXHJcbiAgICBcIkB0eXBlcy9zb3J0YWJsZWpzXCI6IFwiMS4xNS44XCIsXHJcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9lc2xpbnQtcGx1Z2luXCI6IFwiNy4xLjBcIixcclxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L3BhcnNlclwiOiBcIjcuMS4wXCIsXHJcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcIjUuMC40XCIsXHJcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjogXCIzLjEuMFwiLFxyXG4gICAgXCJAdnVlLWxlYWZsZXQvdnVlLWxlYWZsZXRcIjogXCJeMC4xMC4xXCIsXHJcbiAgICBcImF1dG9wcmVmaXhlclwiOiBcIjEwLjQuMThcIixcclxuICAgIFwiY3otZ2l0XCI6IFwiMS45LjBcIixcclxuICAgIFwiY3pnXCI6IFwiMS45LjBcIixcclxuICAgIFwiZXNsaW50XCI6IFwiOC41Ny4wXCIsXHJcbiAgICBcImVzbGludC1jb25maWctcHJldHRpZXJcIjogXCI5LjEuMFwiLFxyXG4gICAgXCJlc2xpbnQtcGx1Z2luLXByZXR0aWVyXCI6IFwiNS4xLjNcIixcclxuICAgIFwiZXNsaW50LXBsdWdpbi12dWVcIjogXCI5LjIyLjBcIixcclxuICAgIFwiaHVza3lcIjogXCI5LjAuMTFcIixcclxuICAgIFwibGVhZmxldFwiOiBcIl4xLjkuNFwiLFxyXG4gICAgXCJsaW50LXN0YWdlZFwiOiBcIjE1LjIuMlwiLFxyXG4gICAgXCJwb3N0Y3NzXCI6IFwiOC40LjM1XCIsXHJcbiAgICBcInBvc3Rjc3MtaHRtbFwiOiBcIjEuNi4wXCIsXHJcbiAgICBcInByZXR0aWVyXCI6IFwiMy4yLjVcIixcclxuICAgIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI6IFwiNS4xMi4wXCIsXHJcbiAgICBcInNhc3NcIjogXCIxLjcxLjFcIixcclxuICAgIFwic3RhbmRhcmQtdmVyc2lvblwiOiBcIjkuNS4wXCIsXHJcbiAgICBcInN0eWxlbGludFwiOiBcIjE2LjEuMFwiLFxyXG4gICAgXCJzdHlsZWxpbnQtY29uZmlnLWh0bWxcIjogXCIxLjEuMFwiLFxyXG4gICAgXCJzdHlsZWxpbnQtY29uZmlnLXJlY2Vzcy1vcmRlclwiOiBcIjUuMC4wXCIsXHJcbiAgICBcInN0eWxlbGludC1jb25maWctcmVjb21tZW5kZWQtc2Nzc1wiOiBcIjE0LjAuMFwiLFxyXG4gICAgXCJzdHlsZWxpbnQtY29uZmlnLXJlY29tbWVuZGVkLXZ1ZVwiOiBcIjEuNS4wXCIsXHJcbiAgICBcInN0eWxlbGludC1jb25maWctc3RhbmRhcmRcIjogXCIzNi4wLjBcIixcclxuICAgIFwic3R5bGVsaW50LWNvbmZpZy1zdGFuZGFyZC1zY3NzXCI6IFwiMTMuMC4wXCIsXHJcbiAgICBcInR5cGVzY3JpcHRcIjogXCI1LjMuM1wiLFxyXG4gICAgXCJ1bnBsdWdpbi12dWUtc2V0dXAtZXh0ZW5kLXBsdXNcIjogXCIxLjAuMVwiLFxyXG4gICAgXCJ2aXRlXCI6IFwiNS4xLjRcIixcclxuICAgIFwidml0ZS1wbHVnaW4tY29tcHJlc3Npb25cIjogXCIwLjUuMVwiLFxyXG4gICAgXCJ2aXRlLXBsdWdpbi1lc2xpbnRcIjogXCIxLjguMVwiLFxyXG4gICAgXCJ2aXRlLXBsdWdpbi1odG1sXCI6IFwiMy4yLjJcIixcclxuICAgIFwidml0ZS1wbHVnaW4tcHdhXCI6IFwiMC4xNy40XCIsXHJcbiAgICBcInZpdGUtcGx1Z2luLXN2Zy1pY29uc1wiOiBcIjIuMC4xXCIsXHJcbiAgICBcInZ1ZS10c2NcIjogXCIxLjguMjdcIlxyXG4gIH0sXHJcbiAgXCJlbmdpbmVzXCI6IHtcclxuICAgIFwibm9kZVwiOiBcIj49MTYuMC4wXCJcclxuICB9LFxyXG4gIFwiYnJvd3NlcnNsaXN0XCI6IHtcclxuICAgIFwicHJvZHVjdGlvblwiOiBbXHJcbiAgICAgIFwiPiAxJVwiLFxyXG4gICAgICBcIm5vdCBkZWFkXCIsXHJcbiAgICAgIFwibm90IG9wX21pbmkgYWxsXCJcclxuICAgIF0sXHJcbiAgICBcImRldmVsb3BtZW50XCI6IFtcclxuICAgICAgXCJsYXN0IDEgY2hyb21lIHZlcnNpb25cIixcclxuICAgICAgXCJsYXN0IDEgZmlyZWZveCB2ZXJzaW9uXCIsXHJcbiAgICAgIFwibGFzdCAxIHNhZmFyaSB2ZXJzaW9uXCJcclxuICAgIF1cclxuICB9LFxyXG4gIFwiY29uZmlnXCI6IHtcclxuICAgIFwiY29tbWl0aXplblwiOiB7XHJcbiAgICAgIFwicGF0aFwiOiBcIm5vZGVfbW9kdWxlcy9jei1naXRcIlxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdULFNBQVMsY0FBYyxlQUFzQztBQUNyWCxTQUFTLFdBQUFBLGdCQUFlOzs7QUNxQmpCLFNBQVMsV0FBVyxTQUE4QjtBQUN2RCxRQUFNLE1BQVcsQ0FBQztBQUVsQixhQUFXLFdBQVcsT0FBTyxLQUFLLE9BQU8sR0FBRztBQUMxQyxRQUFJLFdBQVcsUUFBUSxPQUFPLEVBQUUsUUFBUSxRQUFRLElBQUk7QUFDcEQsZUFBVyxhQUFhLFNBQVMsT0FBTyxhQUFhLFVBQVUsUUFBUTtBQUN2RSxRQUFJLFlBQVk7QUFBYSxpQkFBVyxPQUFPLFFBQVE7QUFDdkQsUUFBSSxZQUFZLGNBQWM7QUFDNUIsVUFBSTtBQUNGLG1CQUFXLEtBQUssTUFBTSxRQUFRO0FBQUEsTUFDaEMsU0FBUyxPQUFPO0FBQUEsTUFBQztBQUFBLElBQ25CO0FBQ0EsUUFBSSxPQUFPLElBQUk7QUFBQSxFQUNqQjtBQUNBLFNBQU87QUFDVDs7O0FDekJPLFNBQVMsWUFBWSxPQUFrQixDQUFDLEdBQUc7QUFDaEQsUUFBTSxNQUF1QixDQUFDO0FBQzlCLGFBQVcsQ0FBQyxRQUFRLE1BQU0sS0FBSyxNQUFNO0FBQ25DLFVBQU0sVUFBVTtBQUNoQixVQUFNLFVBQVUsUUFBUSxL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QUNGOzs7QUpuSEEsT0FBTyxXQUFXO0FBTmxCLElBQU0sbUNBQW1DO0FBUXpDLElBQU0sRUFBRSxjQUFjLGlCQUFpQixNQUFNLFFBQVEsSUFBSTtBQUN6RCxJQUFNLGVBQWU7QUFBQSxFQUNuQixLQUFLLEVBQUUsY0FBYyxpQkFBaUIsTUFBTSxRQUFRO0FBQUEsRUFDcEQsZUFBZSxNQUFNLEVBQUUsT0FBTyxxQkFBcUI7QUFDckQ7QUFHQSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBNkI7QUFDL0QsUUFBTSxPQUFPLFFBQVEsSUFBSTtBQUN6QixRQUFNLE1BQU0sUUFBUSxNQUFNLElBQUk7QUFDOUIsUUFBTSxVQUFVLFdBQVcsR0FBRztBQUU5QixTQUFPO0FBQUEsSUFDTCxNQUFNLFFBQVE7QUFBQSxJQUNkO0FBQUEsSUFDQSxlQUFlLENBQUMsV0FBVztBQUFBLElBQzNCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUtDLFNBQVEsa0NBQVcsT0FBTztBQUFBLFFBQy9CLFlBQVk7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sY0FBYyxLQUFLLFVBQVUsWUFBWTtBQUFBLElBQzNDO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNLFFBQVE7QUFBQSxNQUNkLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQTtBQUFBLE1BRU4sT0FBTyxZQUFZLFFBQVEsVUFBVTtBQUFBLElBQ3ZDO0FBQUEsSUFDQSxTQUFTLGtCQUFrQixPQUFPO0FBQUEsSUFDbEMsU0FBUztBQUFBLE1BQ1AsTUFBTSxRQUFRLG9CQUFvQixDQUFDLGVBQWUsVUFBVSxJQUFJLENBQUM7QUFBQSxJQUNuRTtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQVNSLFdBQVc7QUFBQTtBQUFBLE1BRVgsc0JBQXNCO0FBQUE7QUFBQSxNQUV0Qix1QkFBdUI7QUFBQSxNQUN2QixlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUE7QUFBQSxVQUVOLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBLFFBQ2xCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicmVzb2x2ZSIsICJyZXNvbHZlIl0KfQo=
