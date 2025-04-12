import axios from './axios'

export function selectAllStaffs()
{
    return axios.get('/api/staff/');
}