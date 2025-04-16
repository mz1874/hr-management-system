import axios from './axios'

export function selectAllStaffs(page: number = 1) {
    return axios.get('/api/staff/?page=' + page);
}

export function searchStaff(
    name: string = '',
    departmentId?: number,
    page: number = 1
): any {
    const params = new URLSearchParams();

    if (name.trim()) {
        params.append('name', name.trim());
    }
    if (departmentId !== undefined && departmentId !== null) {
        params.append('department_id', departmentId.toString());
    }
    params.append('page', String(page));
    return axios.get(`/api/staff/search/?${params.toString()}`);
}


export function deleteStaff(id: number): any {
    return axios.delete(`/api/staff/${id}/`);
}

export function resetPassword(id: number): any {
    return axios.post(`/api/staff/${id}/reset-password/`);
}
