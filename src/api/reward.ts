import axios from './axios'

// Reward
export function createReward(data: any) {
    return axios.post(`/api/reward/`, data)
}

export function getAllRewards(page = 1, rewardName = '', rewardPoints = '', status = '', startDate = '', endDate = '') {
    const params = {
        page,
        ...(rewardName ? { reward_title: rewardName } : {}),
        ...(rewardPoints ? { reward_points_required: rewardPoints } : {}),
        ...(status ? { reward_status: status } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
    };
  
    return axios.get('/api/reward/', { params });
}

export function getReward(id: Number) {
    return axios.get(`/api/reward/${id}/`)
}

export function updateReward(id: Number, data: any) {
    return axios.put(`/api/reward/${id}/`, data)
}

export function patchReward(id: Number, data: any) {
    return axios.patch(`/api/reward/${id}/`, data)
}

export function deleteReward(id: Number) {
    return axios.delete(`/api/reward/${id}/`)
}

// User
export function getCurrentUser() {
    return axios.get(`/api/staff/me/`)
}

export function patchUser(id: Number, data: any) {
    return axios.patch(`/api/staff/${id}/`, data)
}

// Reward Redemption
export function createRedemption(data: any) {
    return axios.post(`/api/reward_redemption/`, data)
}

export function getRewardRedemption(page = 1, rewardName = '', username = '', status = '', startDate = '', endDate = '') {
    const params = {
        page,
        ...(rewardName ? { reward_title: rewardName } : {}),
        ...(username ? { username: username } : {}),
        ...(status ? { reward_redemption_status: status } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
    };
  
    return axios.get('/api/reward_redemption/', { params });
}

export function getEmployeeRewardRedemption(page = 1, rewardName = '', startDate = '', endDate = '') {
    const params = {
        page,
        ...(rewardName ? { reward_title: rewardName } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
    };
  
    return axios.get('/api/reward_redemption/', { params });
}



export function patchRewardRedemption(id: Number, data: any) {
    return axios.patch(`/api/reward_redemption/${id}/`, data)
}

// Point History
export function getPointHistory() {
    return axios.get(`/api/point_history/`)
}
export function createDeductionHistory(data: any) {
    return axios.post(`/api/point_history/`, data)
}