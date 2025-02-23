import {createRouter, createWebHashHistory} from 'vue-router'
import HomeView from '@/views/HomeView/Index.vue'
import AboutView from "@/views/AboutView.vue";
import Login from "../views/Login/Index.vue";
import systemLog from "@/views/SystemLog/index.vue";
import departmentManagement from "@/views/DepartmentManagement/index.vue"
import userManagement from "@/views/UserManagement/index.vue";
import authorizationManagement from "@/views/AuthorizationManagement/index.vue";
import routerManagement from "@/views/RouterManagement/index.vue";
import surveyManagement from "@/views/SurveyManagement/index.vue";
import leaveManagement from "@/views/LeaveManagement/index.vue";
import leaveApplication from "@/views/LeaveApplication/index.vue";
import notificationCenter from "@/views/NotificationCenter/index.vue";
import notificationView from "@/views/NotificationView/index.vue";
import rewardMall from "@/views/RewardMall/index.vue";
import pointDetails from "../views/RewardMall/PointDetails/index.vue";
import rewardHistory from "../views/RewardMall/RewardHistory/index.vue";
import leaderBoard from "@/views/LeaderBoard/index.vue";
import KPIManagement from "@/views/KPIManagement/admin/index.vue";
import HomeDefault from "@/views/HomeView/HomeDefault/index.vue";
import personalKPIManagement from "@/views/PersonalKPIManagement/index.vue";
import rewardManagement from "@/views/RewardManagement/index.vue";
import redemptionStatus from "@/views/RedemptionStatus/index.vue";
import PersonalKPIDetails from "@/views/PersonalKPIManagementDetails/index.vue";
import KPIDashboard from "@/views/KPIDashboard/index.vue" ;
import roleManagement from "@/views/RoleManagement/index.vue";
import reportGeneration from "@/views/ReportGeneration/index.vue" ;
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
                },
                {
                    path : "survey-management",
                    name: 'survey-management',
                    component: surveyManagement,
                },
                {
                    path : "leave-management",
                    name: 'leave-management',
                    component: leaveManagement,
                },
                {
                    path : "leave-application",
                    name: 'leave-application',
                    component: leaveApplication,
                },
                {
                    path : "reward-mall",
                    name: 'reward-mall',
                    component: rewardMall,
                },
                {
                    path: "reward-mall/point-details",
                    name: "point-details",
                    component: pointDetails,
                },
                {
                    path: "reward-mall/reward-history",
                    name: "rewardHistory",
                    component: rewardHistory,
                },
                {
                    path : "leader-board",
                    name: 'leader-board',
                    component: leaderBoard,
                },
                {
                    path : "KPI-Management",
                    name: 'KPI-Management',
                    component: KPIManagement,
                },
                {
                    path : "notification-center",
                    name: 'notification-center',
                    component: notificationCenter,
                },
                {
                    path : "notification-view",
                    name: 'notification-view',
                    component: notificationView,
                },
                {
                    path : "personal-KPI-Management",
                    name: 'personal-KPI-Management',
                    component: personalKPIManagement,
                },
                {
                    path:'/PersonalKPIDetails',
                    name:'PersonalKPIDetails',
                    component:PersonalKPIDetails
                },
                {
                    path : "reward-management",
                    name: 'reward-management',
                    component: rewardManagement,
                },
                {
                    path : "redemption-status",
                    name: 'redemption-status',
                    component: redemptionStatus,
                },
                {
                    path : "KPI-Dashboard",
                    name: 'KPI-Dashboard',
                    component: KPIDashboard ,
                },
                {
                    path: "role-management",
                    name : "role-management",
                    component : roleManagement,
                },
                {
                    path : "report-generation",
                    name: 'report-generation',
                    component: reportGeneration ,
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
