import type {RouteRecordRaw} from "vue-router";

const Layout = () => import('@/layout/mobile/BasicLayout.vue');

export const routes:Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home',
        component: Layout,
        children: [
            {
                path: 'home',
                name: 'home',
                component: () => import('@/view/mobileed/HomePage.vue'),
            },
            {
                path: 'friend',
                name: 'friend',
                component: () => import('@/view/mobileed/HomePage.vue'),
            }
        ]
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
