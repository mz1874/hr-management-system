import axios from './axios'

export function selectAllDepartments() {
    return axios.get('/api/department/')
}