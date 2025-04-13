import axios from './axios'

/* 查询所有的 KPI */
export function selectAllKpis() {
    return axios.get('/api/kpi/')
}

/* 创建新的 KPI */
export function createKpi(payload) {
    return axios.post('/api/kpi/', payload)
}

/* 获取特定的 KPI */
export function getKpi(id: number) {
    return axios.get(`/api/kpi/${id}/`)
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
