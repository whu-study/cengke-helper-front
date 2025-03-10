import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "@/router/index.ts";
import {setupStore} from "@/store";

const app = createApp(App)

// 全局注册 状态管理(store)
setupStore(app);

app.use(router)
    .mount('#app')
