import path from 'path';
import createVitePlugins from './vite';
import autoprefixer from 'autoprefixer';
import px2rem from 'postcss-pxtorem';
import { defineConfig, loadEnv } from 'vite';
import { baseRemUnit } from './src/config.js'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    base: env.VITE_PUBLIC_PATH,
    build: {
      outDir: 'smt-sys-pc',
      rollupOptions: {
        input: './index.html'
      }
    },
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // vite 相关配置
    server: {
      port: 8010,
      host: true,
      open: true,
      proxy: {
        '/api-server': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-server/, '')
        },
        '/files': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false
        },
        '/bi': {
          target: 'https://portal.ionrocking.com/bi',
          changeOrigin: true,
          secure: false
        },
        "/battery-lease-sys": {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        },
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // 使用dart-sass
        }
      },
      postcss: {
        plugins: [
          // 自动添加浏览器前缀
          autoprefixer(),
          // px转rem，用于适配在不同屏幕下的显示
          px2rem({ rootValue: baseRemUnit, propList: ['*'], minPixelValue: 1 }),
          // 移除css中的@charset
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
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
