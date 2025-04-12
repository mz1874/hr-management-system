import axios from './axios'

export function selectAllStaffs()
{
    return axios.get('/api/staff/');
}

export function searchStaff(name: string): any {
    return axios.get(`/api/staff/search_by_name/?name=${name}`);
}