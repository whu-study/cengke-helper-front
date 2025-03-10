import type {RouteRecordRaw} from "vue-router";


export const routes:Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('@/view/mobileed/HelperCollapse.vue'),
        meta: {hidden: true}
    },
    {
        path: '/tree-hole',
        component: () => import('@/view/mobileed/Test.vue'),
        meta: {hidden: true}
    },
    {
        path: '/test',
        component: () => import('@/view/mobileed/Test.vue'),
        meta: {hidden: true}
    }
]

export default routes;
