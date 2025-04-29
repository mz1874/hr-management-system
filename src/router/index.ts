import {createRouter, createWebHashHistory, type RouteRecordRaw} from 'vue-router';
import Login from '@/views/Login/Index.vue';
import HomeView from '@/views/HomeView/Index.vue';
import {getUserRoutes} from "@/api/router.ts";
import {mapBackendRoutes} from "@/router/asyncRoutes.ts";

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


let dynamicRoutesLoaded = false;

router.beforeEach(async (to, from, next) => {
    const isAuthenticated = localStorage.getItem('access_token');
    if (to.name === 'login') {
        return next();
    }
    if (!isAuthenticated) {
        return next({ name: 'login' });
    }
    if (!dynamicRoutesLoaded) {
        const res = await getUserRoutes();
        const backendRoutes = res.data?.data;
        const dynamicRoutes = mapBackendRoutes(backendRoutes);

        dynamicRoutes.forEach(r => {
            router.addRoute('home', r);
        });
        dynamicRoutesLoaded = true;
        return next({ ...to, replace: true });
    }

    next();
});




export default router;