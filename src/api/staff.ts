import axios from './axios'
import type {Staff} from "@/interface/UserInterface.ts";
import type {PartialStaffUpdate} from "@/interface/PartialStaffUpdate.ts";

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

export function addStaff(staff: Staff): any {
    return axios.post(`/api/staff/`, staff);
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

export function editStaff(staff: Staff): any {
    return axios.patch(`/api/staff/${staff.id}/`, staff);
}

/**
 * 更新当前用户的部分信息
 * @param staff 用户对象，需包含 id 和要更新的字段
 */
export function updateCurrentUser(staff: PartialStaffUpdate): any {
    return axios.patch(`/api/staff/${staff.id}/`, {
        username: staff.username,
        email: staff.email,
        date_of_birth: staff.date_of_birth,
        picture: staff.picture ?? null,
    });
}