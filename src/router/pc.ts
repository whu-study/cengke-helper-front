import {RouteRecordRaw} from "vue-router";


export const routes:Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('@/components/Test.vue'),
        meta: {hidden: true}
    }
]

export default routes;
