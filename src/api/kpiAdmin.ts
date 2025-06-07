import axios from './axios'

/* 查询所有的 KPI */
export function selectAllKpis(params = {}) {
    return axios.get('/api/kpi/', { params })
}

/* 创建新的 KPI */
export function createKpi(payload) {
    return axios.post('/api/kpi/', payload)
}

/* 获取特定的 KPI */
export function getKpi(id: number) {
    return axios.get(`/api/kpi/${id}/`)
}

/* 终止一个 KPI，更新其状态为 "Terminated" */
export function terminateKpi(id: number, payload: any) {
    return axios.patch(`/api/kpi/${id}/`, payload)
}

export function addAssignedUser(payload) {
    return axios.post('/api/kpi/', payload)
}

/* 更新 KPI */
export function updateKpi(id: number, payload) {
    return axios.put(`/api/kpi/${id}/`, payload)
}

/* 部分更新 KPI */
export function partialUpdateKpi(id: number, payload) {
    return axios.patch(`/api/kpi/${id}/`, payload)
}

/* 删除 KPI */
export function deleteKpi(id: number) {
    return axios.delete(`/api/kpi/${id}/`)
}

/* 标记 KPI 为已完成 */
export function markKpiAsComplete(id: number) {
    return axios.post(`/api/kpi/${id}/mark-complete/`)
}

/* 将KPI任务分配给个人 - 使用已实现的后端接口 */
export function assignKpiToStaff(kpiId: number, staffId: number, departmentId: number, targetUnit: number) {
    return axios.post(`/api/personal-details/`, {
        kpi_task_id: kpiId,
        staff_id: staffId,
        department_id: departmentId,
        target_unit: targetUnit
    });
}

/* 获取KPI任务的个人分配详情 */
export function getKpiPersonalDetails(kpiId: number) {
    return axios.get(`/api/personal-details/?kpi_task_id=${kpiId}`);
}

/* 更新个人KPI任务进度 */
export function updateKpiProgress(personalDetailId: number, data: any) {
    return axios.post(`/api/personal-details/${personalDetailId}/update-progress/`, data);
}

/* 删除员工的 KPI 分配 */
export function removeKpiFromStaff(personalDetailId: number): any {
    return axios.delete(`/api/personal-details/${personalDetailId}/`);
}

/* 标记个人KPI任务为已完成 */
export function markPersonalKpiAsComplete(personalDetailId: number) {
    return axios.post(`/api/personal-details/${personalDetailId}/mark-complete/`);
}

/* 设置/更新 KPI 的部门 */
export function setKpiDepartment(kpiId: number, departmentId: number) {
    return axios.post(`/api/kpi/${kpiId}/set-department/`, {
        department_id: departmentId
    });
}

export function removeKpiDepartment(kpiId:number) {
    return axios.post(`/api/kpi/${kpiId}/clear-department/`)
        .then(res => {
            console.log(res.data.message);
        })
        .catch(err => {
            console.error("取消部门失败", err);
        });
}