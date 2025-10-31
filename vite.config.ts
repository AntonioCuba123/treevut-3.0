import path from 'path';
import { defineConfig, loadEnv, Plugin, IndexHtmlTransformContext } from 'vite';
import react from '@vitejs/plugin-react';
import viteImagemin from 'vite-plugin-imagemin';
import { visualizer } from 'rollup-plugin-visualizer';
import strip from '@rollup/plugin-strip';
import CompressionPlugin from 'compression-webpack-plugin';
import lightningcss from 'vite-plugin-lightningcss';
import imagePreload from 'vite-plugin-image-preload';
import type { OutputAsset, OutputChunk } from 'rollup';

// Plugin personalizado para preload
function preloadLinks(): Plugin {
  return {
    name: 'preload-links',
    enforce: 'post',
    transformIndexHtml(html: string, ctx?: IndexHtmlTransformContext) {
      if (!ctx?.bundle) {
        return html;
      }

      const bundleEntries = Object.values(ctx.bundle);

      const findChunkByName = (name: string): OutputChunk | undefined =>
        bundleEntries.find(
          (item): item is OutputChunk =>
            item.type === 'chunk' && item.name === name
        );

      const scriptChunks = ['vendor', 'index']
        .map(findChunkByName)
        .filter((chunk): chunk is OutputChunk => Boolean(chunk));

      const cssAssets = bundleEntries.filter(
        (item): item is OutputAsset =>
          item.type === 'asset' && item.fileName.endsWith('.css')
      );

      const tags = [
        ...scriptChunks.map((chunk) => ({
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'script',
            href: `/${chunk.fileName}`,
            crossorigin: ''
          },
          injectTo: 'head' as const
        })),
        ...cssAssets.map((asset) => ({
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'style',
            href: `/${asset.fileName}`
          },
          injectTo: 'head' as const
        }))
      ];

      if (!tags.length) {
        return html;
      }

      return {
        html,
        tags
      };
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
      preview: {
        port: 4173,
        host: '0.0.0.0',
        strictPort: false,
        allowedHosts: [
          '.manusvm.computer',
          'localhost',
          '127.0.0.1'
        ]
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
        // strip({
        //   include: ['**/*.tsx', '**/*.ts'],
        //   functions: ['console.log', 'console.debug', 'console.info'],
        //   sourceMap: false
        // }),
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
