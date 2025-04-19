import axios from './axios'

export function selectAllStaffs() {
    return axios.get('/api/staff/');
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

export function getStaffByDepartment(departmentId: number): any {
    return axios.get(`/api/staff/by_department/?department_id=${departmentId}`);
}

export function assignKpiToDepartment(kpiId: number, departmentId: number, target_unit: number): any {
    return axios.post(`/api/kpi/${kpiId}/assign-to-department/`, {
        department_id: departmentId,
        target_unit: target_unit
    });
}
