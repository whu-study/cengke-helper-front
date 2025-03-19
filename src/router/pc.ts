import type {RouteRecordRaw} from "vue-router";


export const routes:Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('@/view/mobile/HomePage.vue'),
        meta: {hidden: true}
    }
]

export default routes;
