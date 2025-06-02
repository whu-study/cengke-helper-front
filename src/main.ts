import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import router from "@/router/index.ts";
import "preline/preline";
import {setupStore} from "@/store";
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)

// 全局注册 状态管理(store)
setupStore(app);


const pinia = createPinia()
//注册piniaPluginPersistedstate插件
pinia.use(piniaPluginPersistedstate)

app.use(router)
    .use(pinia)
    .mount('#app')
