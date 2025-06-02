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
                    requiresAuth: true, // 通常发布帖子需要用户登录
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
                    requiresAuth: true, // 编辑帖子通常需要用户登录且是帖子作者
                }
            },
                // 新增：“我的帖子”列表页路由
    {
        path: 'user/:userId/posts', // 路径可以自定义，例如 '/my-posts'，但使用 userID 更RESTful
        name: 'MyPosts',
        // component: () => import('@/view/mobile/UserPostListPage.vue'), // 建议创建一个包装组件或直接使用 PostList
        // 如果直接使用 PostList，并假设 PostList.vue 能够处理 authorId
        component: () => import('@/view/mobile/MyPostPage.vue'), // 或者你的 PostList.vue 路径
        props: route => ({
          showControls: false, // 在“我的帖子”页面可能不需要顶部的全局排序和筛选
          authorId: route.params.userId, // 将路由参数 userId 映射为 authorId prop
          // 你可能还需要传递其他 PostList 需要的 props，例如 pageSize 的默认值等
          // 或者让 UserPostListPage.vue 内部管理 PostList 的 props
        //   pageTitle: '我的帖子' // 可以传递一个标题给 PostList 或其包装组件
        }),
        meta: {
          requiresAuth: true, // 查看“我的帖子”通常需要登录
          // title: '我的帖子'
        }
      },
    //   // (可选) 新增：编辑个人资料页路由
    //   {
    //       path: 'profile/edit',
    //       name: 'EditProfile',
    //       component: () => import('@/view/mobile/EditProfilePage.vue'), // 你需要创建这个组件
    //       meta: { requiresAuth: true }
    //   },

        ]
    },
]

export default routes;
