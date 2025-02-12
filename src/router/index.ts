import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import HomeView from '@/views/HomeView/Index.vue'
import AboutView from "@/views/AboutView.vue";
import Login from "../views/Login/Index.vue";

import systemLog from "@/views/SystemLog/index.vue";
import departmentManagement from "@/views/DepartmentManagement/index.vue"
import userManagement from "@/views/UserManagement/index.vue";
import authorizationManagement from "@/views/AuthorizationManagement/index.vue";
import routerManagement from "@/views/RouterManagement/index.vue";
import surveyManagement from "@/views/SurveyManagement/index.vue";
import leaveApplication from "@/views/LeaveApplication/index.vue";
import rewardMall from "@/views/RewardMall/index.vue";
import leaderBoard from "@/views/LeaderBoard/index.vue";
import KPIManagement from "@/views/KPIManagement/index.vue";
import notificationCenter from "@/views/NotificationCenter/index.vue";
import HomeDefault from "@/views/HomeView/HomeDefault/index.vue";
import pointDetails from "../views/RewardMall/PointDetails/index.vue";

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
                    path: '', // 空路径表示 `/home` 访问时的默认组件
                    name: 'home-default',
                    component: HomeDefault
                },
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
                {
                    path: 'authorization-management',
                    name: 'authorization-management',
                    component: authorizationManagement,
                },
                {
                    path: "router-management",
                    name: 'router-management',
                    component: routerManagement,
                }

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
