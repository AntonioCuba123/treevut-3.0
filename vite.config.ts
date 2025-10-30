import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import viteImagemin from 'vite-plugin-imagemin';
import { visualizer } from 'rollup-plugin-visualizer';
import strip from '@rollup/plugin-strip';
import CompressionPlugin from 'compression-webpack-plugin';
import lightningcss from 'vite-plugin-lightningcss';
import imagePreload from 'vite-plugin-image-preload';

// Plugin personalizado para preload
function preloadLinks(): Plugin {
  return {
    name: 'preload-links',
    transformIndexHtml(html) {
      const preloads = [
        // Preload main chunks
        `<link rel="preload" href="/assets/vendor.js" as="script">`,
        `<link rel="preload" href="/assets/index.js" as="script">`,
        // Preload critical CSS
        `<link rel="preload" href="/assets/index.css" as="style">`
      ];
      return html.replace(
        '</head>',
        `${preloads.join('\n')}\n</head>`
      );
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
        },
      },
      plugins: [
        react(),
        preloadLinks(),
        viteImagemin({
          gifsicle: {
            optimizationLevel: 7,
            interlaced: false
          },
          optipng: {
            optimizationLevel: 7
          },
          mozjpeg: {
            quality: 80,
            progressive: true
          },
          pngquant: {
            quality: [0.8, 0.9],
            speed: 4,
            strip: true
          },
          svgo: {
            plugins: [
              { name: 'removeViewBox' },
              { name: 'removeEmptyAttrs', active: false },
              { name: 'removeDimensions' },
              { name: 'removeComments' }
            ]
          },
          webp: {
            quality: 80,
            method: 6
          }
        }),
        lightningcss({
          minify: true
        }),
        strip({
          include: ['**/*.tsx', '**/*.ts'],
          functions: ['console.log', 'console.debug', 'console.info'],
          sourceMap: false
        }),
        visualizer({
          filename: './dist/stats.html',
          gzipSize: true,
          brotliSize: true,
          template: 'treemap'
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        target: 'esnext',
        minify: 'esbuild',
        cssMinify: true,
        cssCodeSplit: true,
        chunkSizeWarningLimit: 800,
        reportCompressedSize: true,
        modulePreload: {
          polyfill: true
        },
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor': [
                'react',
                'react-dom',
                '@google/genai'
              ],
              'core': [
                './components/Header.tsx',
                './components/ActionButtons.tsx',
                './components/WalletView.tsx'
              ],
              'analysis': [
                './components/AnalysisView.tsx',
                './components/ExpenseChart.tsx',
                './components/CategoryAnalysis.tsx',
                './components/TrendAnalysis.tsx'
              ],
              'ai-features': [
                './components/AIAssistantChat.tsx',
                './services/geminiService.ts'
              ],
              'expense-management': [
                './components/AddExpenseModal.tsx',
                './components/ExpenseCard.tsx',
                './services/taxService.ts'
              ],
              'auth': [
                './components/Welcome.tsx',
                './components/ProfileSetup.tsx',
                './contexts/AuthContext.tsx'
              ]
            },
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            format: 'es',
            generatedCode: {
              constBindings: true,
              objectShorthand: true
            }
          },
          treeshake: {
            moduleSideEffects: true,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false
          }
        },
        assetsInlineLimit: 4096, // Inline small assets
        sourcemap: false, // Disable sourcemaps in production
        write: true,
        emptyOutDir: true
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
