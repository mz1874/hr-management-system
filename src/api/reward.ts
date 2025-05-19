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

export function getUserForLeaderboard(departmentId: number, status: string) {
    const params = {
        ...(departmentId ? { departmentId: departmentId } : {}),
        ...(status ? { status: status } : {}),
    };

    return axios.get(`/api/staff/search/`, { params })
}


// Reward Redemption
export function createRedemption(data: any) {
    return axios.post(`/api/reward_redemption/`, data)
}

//fetch specific employee reward redemption
export function getRewardRedemption(id: Number, page = 1, rewardName = '', username = '', status = '', startDate = '', endDate = '') {
    const params = {
        page,
        ...(rewardName ? { reward_title: rewardName } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
    };
  
    return axios.get(`/api/reward_redemption/staff/${id}/`, { params });
}

//fetch all employee reward redemption
export function getAllRewardRedemption(page = 1, rewardName = '', username = '', status = '', startDate = '', endDate = '') {
    const params = {
        page,
        ...(rewardName ? { reward_title: rewardName } : {}),
        ...(username ? { username: username } : {}),
        ...(status ? { reward_redemption_status: status } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
    };
  
    return axios.get(`/api/reward_redemption/`, { params });
}

export function patchRewardRedemption(id: Number, data: any) {
    return axios.patch(`/api/reward_redemption/${id}/`, data)
}

// Point History
export function getPointHistory(id: Number, page = 1, remarks = '', startDate = '', endDate = '') {
    const params = {
        page,
        ...(remarks ? { remarks } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
    };
    return axios.get(`/api/point_history/staff/${id}/`, { params })
}

export function createDeductionHistory(data: any) {
    return axios.post(`/api/point_history/`, data)
}