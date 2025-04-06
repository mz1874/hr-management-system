import axios from './axios'

/* 查询所有的部门*/
export function selectAllDepartments() {
    return axios.get('/api/department/')
}

export function addDepartment(payload) {
    return axios.post('/api/department/', payload)
}

