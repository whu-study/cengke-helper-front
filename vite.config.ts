import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {NaiveUiResolver} from 'unplugin-vue-components/resolvers'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import {VantResolver} from "@vant/auto-import-resolver";
import tailwindcss from '@tailwindcss/vite'

import ElementPlus from "unplugin-element-plus/vite";

import path from 'path';


const pathSrc = path.resolve(__dirname, "src");
// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: '0.0.0.0',
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler", // or 'modern'
            }
        }
    },
    plugins: [
        vue(),
        tailwindcss(),
        AutoImport({
            imports: [
                'vue',
                {
                    'naive-ui': [
                        'useDialog',
                        'useMessage',
                        'useNotification',
                        'useLoadingBar'
                    ]
                }
            ],
            resolvers: [ElementPlusResolver(), NaiveUiResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver(), NaiveUiResolver(),VantResolver()],
        }),
        ElementPlus({}),
    ],
    resolve: {
        alias: {
            "@": pathSrc,
        },
    }
})
