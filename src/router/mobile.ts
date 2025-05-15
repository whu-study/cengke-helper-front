import type { RouteRecordRaw } from "vue-router";

// 布局组件，所有主要的视图都将作为其子路由
const Layout = () => import('@/layout/mobile/BasicLayout.vue');

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home', // 默认重定向到首页
        component: Layout, // 使用 BasicLayout 作为这些路由的父布局
        children: [
            {
                path: 'home', // 主应用首页路径
                name: 'home', // 主应用首页路由名 (与 mobile.txt 保持一致)
                component: () => import('@/view/mobile/HomePage.vue'),
            },
            {
                path: 'discuss', // 论坛主页路径 (帖子列表)
                name: 'DiscussHome', // 论坛主页路由名 (可以自定义，例如 'ForumHome' 或保持 'discuss')
                                     // 在 DiscussPage.txt 中，它作为论坛的入口，显示 PostList
                component: () => import('@/view/mobile/DiscussPage.vue'),
            },
            {
                path: 'publish', // 创建新帖的路径 (与 mobile.txt 保持一致)
                name: 'CreatePost', // 路由名更新为 'CreatePost' 以匹配 DiscussPage.vue 中的导航调用
                                    // 之前 mobile.txt 中为 'publish'
                component: () => import('@/view/mobile/PublishPage.vue'), // 假设 PublishPage.vue 是创建新帖的视图
                meta: {
                    // title: '发布新帖', // 可选的路由元信息
                    // requiresAuth: true, // 通常发布帖子需要用户登录
                }
            },
            {
                path: 'profile', // 用户个人中心路径
                name: 'profile', // 用户个人中心路由名 (与 mobile.txt 保持一致)
                component: () => import('@/view/mobile/ProfilePage.vue'),
                meta: {
                    // requiresAuth: true, // 通常查看个人中心需要用户登录
                }
            },
            {
                // 新增：帖子详情页路由
                // 路径参数 :id 将用于传递帖子的唯一标识符
                path: 'post/:id', // 作为 Layout 的子路由，完整路径将是 /post/:id
                name: 'PostDetail', // 路由名称，PostItem.vue 中使用此名称进行导航
                component: () => import('@/view/mobile/PostDetailView.vue'), // 指向帖子详情视图组件
                props: true, // 将路由参数 (如 :id) 作为 props 传递给 PostDetailView 组件
                meta: {
                    // title: '帖子详情', // 可选的路由元信息
                }
            },

            {
                // 可选新增：编辑帖子页路由
                // 路径参数 :id 将用于传递要编辑的帖子的唯一标识符
                path: 'post/edit/:id', // 作为 Layout 的子路由，完整路径将是 /post/edit/:id
                name: 'EditPost',    // 路由名称，PostDetailView.vue 中可能使用此名称进行导航
                component: () => import('@/view/mobile/EditPostView.vue'), // 指向编辑帖子视图组件 (你需要创建此组件)
                props: true, // 将路由参数 (如 :id) 作为 props 传递给 EditPostView 组件
                meta: {
                    // title: '编辑帖子',
                    // requiresAuth: true, // 编辑帖子通常需要用户登录且是帖子作者
                }
            },

        ]
    },
    // 以下是 mobile.txt 中已有的其他顶层路由，保持不变
    {
        path: '/tree-hole',
        component: () => import('@/view/mobile/Test.vue'),
        meta: { hidden: true }
    },
    {
        path: '/test',
        component: () => import('@/view/mobile/Test.vue'),
        meta: { hidden: true }
    },
    // (可选) 添加一个全局的 404 Not Found 路由，应该放在所有路由定义的最后
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'NotFound',
    //   component: () => import('@/views/NotFoundView.vue'), // 假设你有一个 NotFoundView
    //   meta: {
    //     hidden: true // 通常不在导航菜单中显示
    //   }
    // }
];

export default routes;
