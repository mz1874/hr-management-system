import axios from './axios'

export function selectAllStaffs(page: number = 1) {
    return axios.get('/api/staff/?page=' + page);
}

export function searchStaff(name: string): any {
    return axios.get(`/api/staff/search_by_name/?name=${name}`);
}

export function deleteStaff(id: number): any {
    return axios.delete(`/api/staff/${id}/`);
}

export function resetPassword(id: number): any {
    return axios.post(`/api/staff/${id}/reset-password/`);
}
