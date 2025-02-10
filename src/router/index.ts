import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from "@/views/AboutView.vue";
import Login from "../views/Login.vue";

import systemLog from "@/views/SystemLog/index.vue";
import departmentManagement from "@/views/DepartmentManagement/index.vue"
import userManagement from "@/views/UserManagement/index.vue";

/**
 * Please define your page router to the below
 */
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login',
            // component: HomeView,
        },
        {
            path: '/home',
            component: HomeView,
            name: 'home',
            children: [
                {
                    path: 'system-log',
                    name: 'system-log',
                    component: systemLog,
                },
                {
                    path: 'user-management',
                    name: 'user-management',
                    component: userManagement
                },
                {
                    path: 'department-management',
                    name: 'department-management',
                    component: departmentManagement,
                },
            ]
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView,
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
        },


    ],
})

export default router
