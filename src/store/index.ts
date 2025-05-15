import type { App } from "vue";
import { createPinia } from "pinia";
import persist from 'pinia-plugin-persistedstate'

const store = createPinia().use(persist);

// 全局注册 store
export function setupStore(app: App<Element>) {
    app.use(store);
}


export { store };
