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
export function patchUser(id: Number, data: any) {
    return axios.patch(`/api/staff/${id}/`, data)
}

export function resetUserPoints() {
    return axios.patch(`/api/staff/reset-points/`)
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

// Fetch specific employee reward redemption
export function getUserRewardRedemption(id: Number, page = 1, rewardName = '', startDate = '', endDate = '') {
    const params = {
        page,
        ...(rewardName ? { reward_title: rewardName } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
    };
  
    return axios.get(`/api/reward_redemption/staff/${id}/`, { params });
}

// Fetch all employee reward redemption
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

export const getDepartmentLeaderboard = (departmentId: number) => {
  return axios.get(`/api/staff/department-leaderboard/?department_id=${departmentId}`);
};

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

// Combined Point Transactions (point history + redemptions)
export function getCombinedPointTransactions(
  id: Number, 
  page = 1, 
  startDate = '', 
  endDate = ''
) {
  const params = {
    page,
    ...(startDate ? { start_date: startDate } : {}),
    ...(endDate ? { end_date: endDate } : {}),
  };
  return axios.get(`/api/combined-transactions/staff/${id}/`, { params });
}

/**
 * 导出Point history
 */

export function exportPointHistory(params: {
    department_id?: string | number |null;
    start_date?: string;
    end_date?: string;
}) {
    return axios.post('/api/reward/export-point-history/', params, {
        responseType: 'blob'
    });
}


/**
 * 导出兑换历史
 */

export function exportRewardRedemption(params: {
    department_id?: string | number |null;
    start_date?: string;
    end_date?: string;
}) {
    return axios.post('/api/reward/export-reward-redemption/', params, {
        responseType: 'blob'
    });
}

