import axios from './axios'

export function getAllRoles() {
    return axios.get('/api/role/');
}