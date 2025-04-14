import axios from './axios'
import type {RoleItem} from "@/interface/RoleInterface.ts";

export function getAllRoles() {
    return axios.get('/api/role/');
}

export function deleteRoleByRoleId(id: Number) {
    return axios.delete(`/api/role/${id}/`);
}

export function addRole(role: RoleItem)
{
    return axios.post('/api/role/', role);
}

