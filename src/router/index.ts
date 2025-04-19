import {createRouter, createWebHashHistory} from 'vue-router';
import Login from '@/views/Login/Index.vue';
import HomeView from '@/views/HomeView/Index.vue';
import {mapBackendRoutes} from './asyncRoutes';
import axios from 'axios';

const staticRoutes = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
    },
    {
        path: '/home',
        name: 'home',
        component: HomeView,
        children: []  // 预留子路由位置
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes: staticRoutes,
});

let isRouteLoaded = false;

router.beforeEach(async (to, from, next) => {
    const isAuthenticated = localStorage.getItem('access_token');

    // 如果当前访问的是登录页面，直接放行
    if (to.name === 'login') {
        return next();
    }

    // 如果未登录，则跳转到登录页面
    if (!isAuthenticated) {
        return next({name: 'login'});
    }
});

export default router;