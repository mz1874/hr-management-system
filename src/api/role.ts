import axios from './axios'

export function getAllRoles() {
    return axios.get('/api/role/');
}

export function deleteRoleByRoleId(id: Number) {
    return axios.delete(`/api/role/${id}/`);
}