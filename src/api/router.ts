import axios from './axios'
import type {RouteItem} from "@/interface/RouteInterface.ts";

export function getUserRoutes() {
    return axios.get('/api/authorization/menu/')
}

/**
 * 获取所有的路由
 */
export function getMenuRoutes() {
    return axios.get('/api/authorization/routes/');
}

export function addMenuRoute(menuRoute: RouteItem) {
    return axios.post('/api/authorization/', menuRoute);
}

export function deleteMenuRoute(id: number) {
    return axios.delete(`/api/authorization/${id}/`);
}