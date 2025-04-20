import axios from './axios'

//create staff
export function createStaff(payload: any): any {
    return axios.post('/api/staff/', payload);
}


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

export function getStaffByDepartment(departmentId: number): any {
    return axios.get(`/api/staff/by_department/?department_id=${departmentId}`);
}

export function assignKpiToDepartment(kpiId: number, departmentId: number, target_unit: number): any {
    return axios.post(`/api/kpi/${kpiId}/assign-to-department/`, {
        department_id: departmentId,
        target_unit: target_unit
    });
}
