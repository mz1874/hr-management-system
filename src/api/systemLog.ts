import axios from "@/api/axios.ts";

export function getSystemLogs(params) {
    // params = { page: 1, page_size: 10, search: 'admin', ordering: '-operation_time' }
    return axios.get('/api/system-log/', { params });
}
