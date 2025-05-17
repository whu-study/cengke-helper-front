import {createRouter, createWebHashHistory} from 'vue-router';
import pcRoutes from './pc';
import mobileRoutes from './mobile';
import {isMobile} from "@/utils/globalFunc";
import { useUserStore } from '@/store/modules/userStore';
import { ElMessage } from 'element-plus';
const routes = isMobile() ? mobileRoutes : pcRoutes;

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
})


//全局前置路由守卫————初始化的时候被调用、每次路由切换之前被调用
router.beforeEach((to, from, next) => {
    const userStore = useUserStore(); // 获取 Pinia store 实例
    // 或者 const tokenStore = useUserToken();
    // const isAuthenticated = tokenStore.token; // 或者 userStore.isAuthenticated;
  
    // 检查目标路由是否标记了 requiresAuth
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // 如果路由需要认证
      // 检查用户是否已登录 (例如，通过检查 Pinia store 中的 token 或登录状态)
      if (userStore.ifLogin) { // 或者 userStore.ifLogin, 或者 !!userStore.token
        // 用户已登录，允许导航
        next();
      } else {
        // 用户未登录，重定向到登录页
        ElMessage.warning('此页面需要登录才能访问，请先登录。'); // 可选提示
        next({
          name: 'Login', // 重定向到登录页的路由名称
          query: { redirect: to.fullPath } // 可选：在登录后重定向回原页面
        });
      }
    } else {
      // 如果路由不需要认证，或者没有 meta.requiresAuth 标记，则直接允许导航
      next();
    }
  });


export default router;

