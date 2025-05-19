import axios from './axios.ts'

export function selectPersonalKPI(page: number, search?: string) {
    return axios.post(`/api/kpi-personal/search-kpi/?page=${page}`, {
        search: search || ''
    });
}
