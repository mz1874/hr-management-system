import axios from './axios'

export function getUserRoutes() {
    return axios.get('/api/authorization/menu/');
}
