import axios from './axios'
import type {RoleItem} from "@/interface/RoleInterface.ts";

export function deleteRoleByRoleId(id: Number) {
    return axios.delete(`/api/role/${id}/`);
}

export function addRole(role: RoleItem)
{
    return axios.post('/api/role/', role);
}

export function searchByRoleName(name: string, page?: Number) {
    return axios.get(`/api/role/search_by_name/?name=${name}&page=${page}`);
}

export function editRole(role: RoleItem) {
    return axios.patch(`/api/role/${role.id}/`, role);
}
