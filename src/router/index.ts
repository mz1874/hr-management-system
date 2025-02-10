import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from "@/views/AboutView.vue";
import Login from "@/views/Login.vue";


/**
 * Please define your page router to the below
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
    }
  ],
})

export default router
