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
                component: () => import('@/view/mobile/HomePage.vue'),
            },
            {
                path: 'discuss',
                name: 'discuss',
                component: () => import('@/view/mobile/DiscussPage.vue'),
            },
            {
                path: 'publish',
                name: 'publish',
                component: () => import('@/view/mobile/PublishPage.vue'),
            },
            {
                path: 'profile',
                name: 'profile',
                component: () => import('@/view/mobile/ProfilePage.vue'),
            },
        ]
    },
    {
        path: '/tree-hole',
        component: () => import('@/view/mobile/Test.vue'),
        meta: {hidden: true}
    },
    {
        path: '/test',
        component: () => import('@/view/mobile/Test.vue'),
        meta: {hidden: true}
    },
    {
        path:'/login',
        component: () => import('@/view/login/Login.vue'),
        meta: {hidden: true}
    }
]

export default routes;
