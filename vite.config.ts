import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiProxy } from './vite-plugin-api';

export default defineConfig(({ mode }) => {
  // 加载环境变量（用于本地开发）
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      // 在开发模式下启用 API 代理
      ...(mode === 'development' ? [apiProxy()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      include: ['three', 'react-globe.gl'],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    build: {
      outDir: 'dist',
      // 确保 public 目录被正确复制
      copyPublicDir: true,
    },
    // Cloudflare Pages 需要 base 路径
    base: '/',
  };
});
