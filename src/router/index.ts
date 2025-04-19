import {createRouter, createWebHashHistory, type RouteRecordRaw} from 'vue-router';
import Login from '@/views/Login/Index.vue';
import HomeView from '@/views/HomeView/Index.vue';
import {mapBackendRoutes} from './asyncRoutes';
import axios from 'axios';

const staticRoutes: RouteRecordRaw[]  = [
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
        children: []
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes: staticRoutes,
});


router.beforeEach(async (to, from, next) => {
    const isAuthenticated = localStorage.getItem('access_token');

    if (to.name === 'login') {
        return next();
    }

    if (!isAuthenticated) {
        return next({ name: 'login' });
    }

    next();
});



export default router;