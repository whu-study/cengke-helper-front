import type { RouteRecordRaw } from "vue-router";

// PC端布局组件
const Layout = () => import('@/layout/pc/BasicLayout.vue');

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home',
        component: Layout,
        children: [
            {
                path: 'home',
                name: 'Home',
                component: () => import('@/view/pc/HomePage.vue'),
                meta: { title: '首页' }
            },
            {
                path: 'discuss',
                name: 'Discuss',
                component: () => import('@/view/pc/DiscussPage.vue'),
                meta: { title: '讨论区' }
            },
            {
                path: 'publish',
                name: 'CreatePost',
                component: () => import('@/view/pc/PublishPage.vue'),
                meta: { title: '发布帖子', requiresAuth: true }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/view/pc/ProfilePage.vue'),
                meta: { title: '个人中心' }
            },
            {
                path: 'profile/edit',
                name: 'EditProfile',
                component: () => import('@/view/pc/EditProfile.vue'),
                meta: { title: '编辑资料', requiresAuth: true }
            },
            {
                path: 'user/:userId/posts',
                name: 'MyPosts',
                component: () => import('@/view/pc/MyPostPage.vue'),
                props: true,
                meta: { title: '我的帖子', requiresAuth: true }
            },
            {
                path: 'post/:id',
                name: 'PostDetail',
                component: () => import('@/view/mobile/PostDetailView.vue'), // 暂时复用移动端
                props: true,
                meta: { title: '帖子详情' }
            },
            {
                path: 'post/edit/:id',
                name: 'EditPost',
                component: () => import('@/view/mobile/EditPostView.vue'), // 暂时复用移动端
                props: true,
                meta: { title: '编辑帖子', requiresAuth: true }
            }
        ]
    },
    // 处理404等其他路由
    {
        path: '/:pathMatch(.*)*',
        redirect: '/home'
    }
]

export default routes;
