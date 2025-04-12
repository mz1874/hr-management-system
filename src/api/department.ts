import axios from './axios'

/* 查询所有的部门*/
export function selectAllDepartments() {
    return axios.get('/api/department/')
}

export function addDepartment(payload) {
    return axios.post('/api/department/', payload)
}

export function deleteDepartment(id) {
    return axios.delete(`/api/department/${id}/`)
}

/**
 * update department
 * @param id
 * @param payload
 */
export function updateDepartment(id, payload) {
    return axios.patch(`/api/department/${id}/`, payload)
}