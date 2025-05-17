import axios from './axios.ts'

export function selectPersonalKPI () {
    return axios.get('/api/kpi-personal/search-kpi/')
}