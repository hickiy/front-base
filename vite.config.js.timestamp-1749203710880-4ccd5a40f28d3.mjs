// vite.config.js
import path2 from "path";

// vite/index.js
import vue from "file:///E:/office/ion-front-base/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///E:/office/ion-front-base/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";

// vite/auto-import.js
import autoImport from "file:///E:/office/ion-front-base/node_modules/unplugin-auto-import/dist/vite.js";
function createAutoImport() {
  return autoImport({
    imports: [
      "vue",
      "vue-router",
      "pinia"
    ],
    dts: false
  });
}

// vite/compression.js
import compression from "file:///E:/office/ion-front-base/node_modules/vite-plugin-compression/dist/index.mjs";
function createCompression(env) {
  const { VITE_BUILD_COMPRESS } = env;
  const plugin = [];
  if (VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(",");
    if (compressList.includes("gzip")) {
      plugin.push(
        compression({
          ext: ".gz",
          deleteOriginFile: false
        })
      );
    }
    if (compressList.includes("brotli")) {
      plugin.push(
        compression({
          ext: ".br",
          algorithm: "brotliCompress",
          deleteOriginFile: false
        })
      );
    }
  }
  return plugin;
}

// vite/setup-extend.js
import setupExtend from "file:///E:/office/ion-front-base/node_modules/unplugin-vue-setup-extend-plus/dist/vite.js";
function createSetupExtend() {
  return setupExtend({});
}

// vite/index.js
import tailwindcss from "file:///E:/office/ion-front-base/node_modules/@tailwindcss/vite/dist/index.mjs";

// vite/svg-Icons.js
import { createSvgIconsPlugin } from "file:///E:/office/ion-front-base/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import path from "path";
function svg_Icons_default() {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), "src/assets/svg")],
    symbolId: "icon-[name]",
    inject: "body-first"
  });
}

// vite/index.js
function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [];
  vitePlugins.push(vue());
  vitePlugins.push(vueJsx());
  vitePlugins.push(createAutoImport());
  vitePlugins.push(createSetupExtend());
  vitePlugins.push(tailwindcss());
  vitePlugins.push(svg_Icons_default());
  isBuild && vitePlugins.push(...createCompression(viteEnv));
  return vitePlugins;
}

// vite.config.js
import autoprefixer from "file:///E:/office/ion-front-base/node_modules/autoprefixer/lib/autoprefixer.js";
import px2rem from "file:///E:/office/ion-front-base/node_modules/postcss-pxtorem/index.js";
import { defineConfig, loadEnv } from "file:///E:/office/ion-front-base/node_modules/vite/dist/node/index.js";

// src/config.js
var baseRemUnit = 16;

// vite.config.js
var __vite_injected_original_dirname = "E:\\office\\ion-front-base";
var vite_config_default = defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    base: env.VITE_PUBLIC_PATH,
    build: {
      outDir: "smt-sys-pc",
      rollupOptions: {
        input: "./index.html"
      }
    },
    plugins: createVitePlugins(env, command === "build"),
    resolve: {
      alias: {
        // 设置路径
        "~": path2.resolve(__vite_injected_original_dirname, "./"),
        // 设置别名
        "@": path2.resolve(__vite_injected_original_dirname, "./src")
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    },
    // vite 相关配置
    server: {
      port: 8010,
      host: true,
      open: true,
      proxy: {
        "/api-server": {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-server/, "")
        },
        "/files": {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false
        },
        "/bi": {
          target: "https://portal.ionrocking.com/bi",
          changeOrigin: true,
          secure: false
        },
        "/battery-lease-sys": {
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
          // 使用dart-sass
        }
      },
      postcss: {
        plugins: [
          // 自动添加浏览器前缀
          autoprefixer(),
          // px转rem，用于适配在不同屏幕下的显示
          px2rem({ rootValue: baseRemUnit, propList: ["*"], minPixelValue: 1 }),
          // 移除css中的@charset
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === "charset") {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAidml0ZS9pbmRleC5qcyIsICJ2aXRlL2F1dG8taW1wb3J0LmpzIiwgInZpdGUvY29tcHJlc3Npb24uanMiLCAidml0ZS9zZXR1cC1leHRlbmQuanMiLCAidml0ZS9zdmctSWNvbnMuanMiLCAic3JjL2NvbmZpZy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXG9mZmljZVxcXFxpb24tZnJvbnQtYmFzZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcb2ZmaWNlXFxcXGlvbi1mcm9udC1iYXNlXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9vZmZpY2UvaW9uLWZyb250LWJhc2Uvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBjcmVhdGVWaXRlUGx1Z2lucyBmcm9tICcuL3ZpdGUnO1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInO1xuaW1wb3J0IHB4MnJlbSBmcm9tICdwb3N0Y3NzLXB4dG9yZW0nO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBiYXNlUmVtVW5pdCB9IGZyb20gJy4vc3JjL2NvbmZpZy5qcydcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUsIGNvbW1hbmQgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpO1xuICByZXR1cm4ge1xuICAgIC8vIFx1OTBFOFx1N0Y3Mlx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTQ4Q1x1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUwQlx1NzY4NFVSTFx1MzAwMlxuICAgIC8vIFx1OUVEOFx1OEJBNFx1NjBDNVx1NTFCNVx1NEUwQlx1RkYwQ3ZpdGUgXHU0RjFBXHU1MDQ3XHU4QkJFXHU0RjYwXHU3Njg0XHU1RTk0XHU3NTI4XHU2NjJGXHU4OEFCXHU5MEU4XHU3RjcyXHU1NzI4XHU0RTAwXHU0RTJBXHU1N0RGXHU1NDBEXHU3Njg0XHU2ODM5XHU4REVGXHU1Rjg0XHU0RTBBXG4gICAgYmFzZTogZW52LlZJVEVfUFVCTElDX1BBVEgsXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogJ3NtdC1zeXMtcGMnLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBpbnB1dDogJy4vaW5kZXguaHRtbCdcbiAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IGNyZWF0ZVZpdGVQbHVnaW5zKGVudiwgY29tbWFuZCA9PT0gJ2J1aWxkJyksXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgLy8gXHU4QkJFXHU3RjZFXHU4REVGXHU1Rjg0XG4gICAgICAgICd+JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vJyksXG4gICAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NTIyQlx1NTQwRFxuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpXG4gICAgICB9LFxuICAgICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcudHMnLCAnLmpzeCcsICcudHN4JywgJy5qc29uJywgJy52dWUnXVxuICAgIH0sXG4gICAgLy8gdml0ZSBcdTc2RjhcdTUxNzNcdTkxNERcdTdGNkVcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDgwMTAsXG4gICAgICBob3N0OiB0cnVlLFxuICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpLXNlcnZlcic6IHtcbiAgICAgICAgICB0YXJnZXQ6IGVudi5WSVRFX1BST1hZX1RBUkdFVCxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogKHApID0+IHAucmVwbGFjZSgvXlxcL2FwaS1zZXJ2ZXIvLCAnJylcbiAgICAgICAgfSxcbiAgICAgICAgJy9maWxlcyc6IHtcbiAgICAgICAgICB0YXJnZXQ6IGVudi5WSVRFX1BST1hZX1RBUkdFVCxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnL2JpJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHBzOi8vcG9ydGFsLmlvbnJvY2tpbmcuY29tL2JpJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBcIi9iYXR0ZXJ5LWxlYXNlLXN5c1wiOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIHNjc3M6IHtcbiAgICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLCAvLyBcdTRGN0ZcdTc1MjhkYXJ0LXNhc3NcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHBvc3Rjc3M6IHtcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgIC8vIFx1ODFFQVx1NTJBOFx1NkRGQlx1NTJBMFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NTI0RFx1N0YwMFxuICAgICAgICAgIGF1dG9wcmVmaXhlcigpLFxuICAgICAgICAgIC8vIHB4XHU4RjZDcmVtXHVGRjBDXHU3NTI4XHU0RThFXHU5MDAyXHU5MTREXHU1NzI4XHU0RTBEXHU1NDBDXHU1QzRGXHU1RTU1XHU0RTBCXHU3Njg0XHU2NjNFXHU3OTNBXG4gICAgICAgICAgcHgycmVtKHsgcm9vdFZhbHVlOiBiYXNlUmVtVW5pdCwgcHJvcExpc3Q6IFsnKiddLCBtaW5QaXhlbFZhbHVlOiAxIH0pLFxuICAgICAgICAgIC8vIFx1NzlGQlx1OTY2NGNzc1x1NEUyRFx1NzY4NEBjaGFyc2V0XG4gICAgICAgICAge1xuICAgICAgICAgICAgcG9zdGNzc1BsdWdpbjogJ2ludGVybmFsOmNoYXJzZXQtcmVtb3ZhbCcsXG4gICAgICAgICAgICBBdFJ1bGU6IHtcbiAgICAgICAgICAgICAgY2hhcnNldDogKGF0UnVsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhdFJ1bGUubmFtZSA9PT0gJ2NoYXJzZXQnKSB7XG4gICAgICAgICAgICAgICAgICBhdFJ1bGUucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXG9mZmljZVxcXFxpb24tZnJvbnQtYmFzZVxcXFx2aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxvZmZpY2VcXFxcaW9uLWZyb250LWJhc2VcXFxcdml0ZVxcXFxpbmRleC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovb2ZmaWNlL2lvbi1mcm9udC1iYXNlL3ZpdGUvaW5kZXguanNcIjtpbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcbmltcG9ydCBjcmVhdGVBdXRvSW1wb3J0IGZyb20gJy4vYXV0by1pbXBvcnQnXG5pbXBvcnQgY3JlYXRlQ29tcHJlc3Npb24gZnJvbSAnLi9jb21wcmVzc2lvbidcbmltcG9ydCBjcmVhdGVTZXR1cEV4dGVuZCBmcm9tICcuL3NldHVwLWV4dGVuZCdcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSdcbmltcG9ydCBTdmdJY29ucyBmcm9tICcuL3N2Zy1JY29ucydcblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVWaXRlUGx1Z2lucyh2aXRlRW52LCBpc0J1aWxkID0gZmFsc2UpIHtcbiAgICBjb25zdCB2aXRlUGx1Z2lucyA9IFtdXG4gICAgdml0ZVBsdWdpbnMucHVzaCh2dWUoKSlcbiAgICB2aXRlUGx1Z2lucy5wdXNoKHZ1ZUpzeCgpKVxuICAgIHZpdGVQbHVnaW5zLnB1c2goY3JlYXRlQXV0b0ltcG9ydCgpKVxuICAgIHZpdGVQbHVnaW5zLnB1c2goY3JlYXRlU2V0dXBFeHRlbmQoKSlcbiAgICB2aXRlUGx1Z2lucy5wdXNoKHRhaWx3aW5kY3NzKCkpXG4gICAgdml0ZVBsdWdpbnMucHVzaChTdmdJY29ucygpKVxuICAgIGlzQnVpbGQgJiYgdml0ZVBsdWdpbnMucHVzaCguLi5jcmVhdGVDb21wcmVzc2lvbih2aXRlRW52KSlcbiAgICByZXR1cm4gdml0ZVBsdWdpbnNcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcb2ZmaWNlXFxcXGlvbi1mcm9udC1iYXNlXFxcXHZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXG9mZmljZVxcXFxpb24tZnJvbnQtYmFzZVxcXFx2aXRlXFxcXGF1dG8taW1wb3J0LmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9vZmZpY2UvaW9uLWZyb250LWJhc2Uvdml0ZS9hdXRvLWltcG9ydC5qc1wiO2ltcG9ydCBhdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVBdXRvSW1wb3J0KCkge1xyXG4gICAgcmV0dXJuIGF1dG9JbXBvcnQoe1xyXG4gICAgICAgIGltcG9ydHM6IFtcclxuICAgICAgICAgICAgJ3Z1ZScsXHJcbiAgICAgICAgICAgICd2dWUtcm91dGVyJyxcclxuICAgICAgICAgICAgJ3BpbmlhJ1xyXG4gICAgICAgIF0sXHJcbiAgICAgICAgZHRzOiBmYWxzZVxyXG4gICAgfSlcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXG9mZmljZVxcXFxpb24tZnJvbnQtYmFzZVxcXFx2aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxvZmZpY2VcXFxcaW9uLWZyb250LWJhc2VcXFxcdml0ZVxcXFxjb21wcmVzc2lvbi5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovb2ZmaWNlL2lvbi1mcm9udC1iYXNlL3ZpdGUvY29tcHJlc3Npb24uanNcIjtpbXBvcnQgY29tcHJlc3Npb24gZnJvbSAndml0ZS1wbHVnaW4tY29tcHJlc3Npb24nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDb21wcmVzc2lvbihlbnYpIHtcclxuICAgIGNvbnN0IHsgVklURV9CVUlMRF9DT01QUkVTUyB9ID0gZW52XHJcbiAgICBjb25zdCBwbHVnaW4gPSBbXVxyXG4gICAgaWYgKFZJVEVfQlVJTERfQ09NUFJFU1MpIHtcclxuICAgICAgICBjb25zdCBjb21wcmVzc0xpc3QgPSBWSVRFX0JVSUxEX0NPTVBSRVNTLnNwbGl0KCcsJylcclxuICAgICAgICBpZiAoY29tcHJlc3NMaXN0LmluY2x1ZGVzKCdnemlwJykpIHtcclxuICAgICAgICAgICAgLy8gaHR0cDovL2RvYy5ydW95aS52aXAvcnVveWktdnVlL290aGVyL2ZhcS5odG1sI1x1NEY3Rlx1NzUyOGd6aXBcdTg5RTNcdTUzOEJcdTdGMjlcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcclxuICAgICAgICAgICAgcGx1Z2luLnB1c2goXHJcbiAgICAgICAgICAgICAgICBjb21wcmVzc2lvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0OiAnLmd6JyxcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVPcmlnaW5GaWxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29tcHJlc3NMaXN0LmluY2x1ZGVzKCdicm90bGknKSkge1xyXG4gICAgICAgICAgICBwbHVnaW4ucHVzaChcclxuICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uKHtcclxuICAgICAgICAgICAgICAgICAgICBleHQ6ICcuYnInLFxyXG4gICAgICAgICAgICAgICAgICAgIGFsZ29yaXRobTogJ2Jyb3RsaUNvbXByZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVPcmlnaW5GaWxlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwbHVnaW5cclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXG9mZmljZVxcXFxpb24tZnJvbnQtYmFzZVxcXFx2aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxvZmZpY2VcXFxcaW9uLWZyb250LWJhc2VcXFxcdml0ZVxcXFxzZXR1cC1leHRlbmQuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L29mZmljZS9pb24tZnJvbnQtYmFzZS92aXRlL3NldHVwLWV4dGVuZC5qc1wiO2ltcG9ydCBzZXR1cEV4dGVuZCBmcm9tICd1bnBsdWdpbi12dWUtc2V0dXAtZXh0ZW5kLXBsdXMvdml0ZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVNldHVwRXh0ZW5kKCkge1xyXG4gICAgcmV0dXJuIHNldHVwRXh0ZW5kKHt9KVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcb2ZmaWNlXFxcXGlvbi1mcm9udC1iYXNlXFxcXHZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXG9mZmljZVxcXFxpb24tZnJvbnQtYmFzZVxcXFx2aXRlXFxcXHN2Zy1JY29ucy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovb2ZmaWNlL2lvbi1mcm9udC1iYXNlL3ZpdGUvc3ZnLUljb25zLmpzXCI7aW1wb3J0IHsgY3JlYXRlU3ZnSWNvbnNQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1zdmctaWNvbnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcbiAgICBpY29uRGlyczogW3BhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2Fzc2V0cy9zdmcnKV0sXG4gICAgc3ltYm9sSWQ6ICdpY29uLVtuYW1lXScsXG4gICAgaW5qZWN0OiAnYm9keS1maXJzdCcsXG4gIH0pXG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcb2ZmaWNlXFxcXGlvbi1mcm9udC1iYXNlXFxcXHNyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcb2ZmaWNlXFxcXGlvbi1mcm9udC1iYXNlXFxcXHNyY1xcXFxjb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L29mZmljZS9pb24tZnJvbnQtYmFzZS9zcmMvY29uZmlnLmpzXCI7ZXhwb3J0IGNvbnN0IHVpRHNpbmdXaWR0aCA9IDE5MjA7IC8vIFx1OEJCRVx1OEJBMVx1NTZGRVx1NUJCRFx1NUVBNlxuZXhwb3J0IGNvbnN0IGJhc2VSZW1Vbml0ID0gMTY7IC8vIFx1NTdGQVx1NTFDNlx1NTkyN1x1NUMwRiBiYXNlU2l6ZVx1RkYwQ1x1NEUwRXVub2Nzc1x1NzY4NFx1NTdGQVx1NTFDNlx1NTkyN1x1NUMwRlx1NEUwMFx1ODFGNFxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnUSxPQUFPQSxXQUFVOzs7QUNBWixPQUFPLFNBQVM7QUFDclIsT0FBTyxZQUFZOzs7QUNEOFAsT0FBTyxnQkFBZ0I7QUFFelIsU0FBUixtQkFBb0M7QUFDdkMsU0FBTyxXQUFXO0FBQUEsSUFDZCxTQUFTO0FBQUEsTUFDTDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLElBQ0EsS0FBSztBQUFBLEVBQ1QsQ0FBQztBQUNMOzs7QUNYaVIsT0FBTyxpQkFBaUI7QUFFMVIsU0FBUixrQkFBbUMsS0FBSztBQUMzQyxRQUFNLEVBQUUsb0JBQW9CLElBQUk7QUFDaEMsUUFBTSxTQUFTLENBQUM7QUFDaEIsTUFBSSxxQkFBcUI7QUFDckIsVUFBTSxlQUFlLG9CQUFvQixNQUFNLEdBQUc7QUFDbEQsUUFBSSxhQUFhLFNBQVMsTUFBTSxHQUFHO0FBRS9CLGFBQU87QUFBQSxRQUNILFlBQVk7QUFBQSxVQUNSLEtBQUs7QUFBQSxVQUNMLGtCQUFrQjtBQUFBLFFBQ3RCLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUNBLFFBQUksYUFBYSxTQUFTLFFBQVEsR0FBRztBQUNqQyxhQUFPO0FBQUEsUUFDSCxZQUFZO0FBQUEsVUFDUixLQUFLO0FBQUEsVUFDTCxXQUFXO0FBQUEsVUFDWCxrQkFBa0I7QUFBQSxRQUN0QixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0EsU0FBTztBQUNYOzs7QUMzQm1SLE9BQU8saUJBQWlCO0FBRTVSLFNBQVIsb0JBQXFDO0FBQ3hDLFNBQU8sWUFBWSxDQUFDLENBQUM7QUFDekI7OztBSENBLE9BQU8saUJBQWlCOzs7QUlMcVAsU0FBUyw0QkFBNEI7QUFDbFQsT0FBTyxVQUFVO0FBRUYsU0FBUixvQkFBb0I7QUFDekIsU0FBTyxxQkFBcUI7QUFBQSxJQUMxQixVQUFVLENBQUMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0FBQUEsSUFDeEQsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLEVBQ1YsQ0FBQztBQUNIOzs7QUpBZSxTQUFSLGtCQUFtQyxTQUFTLFVBQVUsT0FBTztBQUNoRSxRQUFNLGNBQWMsQ0FBQztBQUNyQixjQUFZLEtBQUssSUFBSSxDQUFDO0FBQ3RCLGNBQVksS0FBSyxPQUFPLENBQUM7QUFDekIsY0FBWSxLQUFLLGlCQUFpQixDQUFDO0FBQ25DLGNBQVksS0FBSyxrQkFBa0IsQ0FBQztBQUNwQyxjQUFZLEtBQUssWUFBWSxDQUFDO0FBQzlCLGNBQVksS0FBSyxrQkFBUyxDQUFDO0FBQzNCLGFBQVcsWUFBWSxLQUFLLEdBQUcsa0JBQWtCLE9BQU8sQ0FBQztBQUN6RCxTQUFPO0FBQ1g7OztBRGpCQSxPQUFPLGtCQUFrQjtBQUN6QixPQUFPLFlBQVk7QUFDbkIsU0FBUyxjQUFjLGVBQWU7OztBTUgvQixJQUFNLGNBQWM7OztBTkQzQixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLE1BQU0sUUFBUSxNQUFNO0FBQ2pELFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFDdkMsU0FBTztBQUFBO0FBQUE7QUFBQSxJQUdMLE1BQU0sSUFBSTtBQUFBLElBQ1YsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsZUFBZTtBQUFBLFFBQ2IsT0FBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLGtCQUFrQixLQUFLLFlBQVksT0FBTztBQUFBLElBQ25ELFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQTtBQUFBLFFBRUwsS0FBS0MsTUFBSyxRQUFRLGtDQUFXLElBQUk7QUFBQTtBQUFBLFFBRWpDLEtBQUtBLE1BQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxNQUNBLFlBQVksQ0FBQyxRQUFRLE9BQU8sT0FBTyxRQUFRLFFBQVEsU0FBUyxNQUFNO0FBQUEsSUFDcEU7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsZUFBZTtBQUFBLFVBQ2IsUUFBUSxJQUFJO0FBQUEsVUFDWixjQUFjO0FBQUEsVUFDZCxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsaUJBQWlCLEVBQUU7QUFBQSxRQUMvQztBQUFBLFFBQ0EsVUFBVTtBQUFBLFVBQ1IsUUFBUSxJQUFJO0FBQUEsVUFDWixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0EsT0FBTztBQUFBLFVBQ0wsUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBLHNCQUFzQjtBQUFBLFVBQ3BCLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILHFCQUFxQjtBQUFBLFFBQ25CLE1BQU07QUFBQSxVQUNKLEtBQUs7QUFBQTtBQUFBLFFBQ1A7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxTQUFTO0FBQUE7QUFBQSxVQUVQLGFBQWE7QUFBQTtBQUFBLFVBRWIsT0FBTyxFQUFFLFdBQVcsYUFBYSxVQUFVLENBQUMsR0FBRyxHQUFHLGVBQWUsRUFBRSxDQUFDO0FBQUE7QUFBQSxVQUVwRTtBQUFBLFlBQ0UsZUFBZTtBQUFBLFlBQ2YsUUFBUTtBQUFBLGNBQ04sU0FBUyxDQUFDLFdBQVc7QUFDbkIsb0JBQUksT0FBTyxTQUFTLFdBQVc7QUFDN0IseUJBQU8sT0FBTztBQUFBLGdCQUNoQjtBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIiwgInBhdGgiXQp9Cg==
