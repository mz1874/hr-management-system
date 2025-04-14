import axios from './axios'

// Reward
export function createReward(data: any) {
    return axios.post(`/api/reward/`, data)
}

export function getAllRewards() {
    return axios.get(`/api/reward/`)
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

export function patchUser() {
    return axios.patch(`/api/staff/`)
}

// Reward Redemption
export function createRedemption(data: any) {
    return axios.post(`/api/reward_redemption/`, data)
}

export function getRewardRedemption() {
    return axios.get(`/api/reward_redemption/`)
}

export function patchRewardRedemption(id: Number, data: any) {
    return axios.patch(`/api/reward_redemption/${id}/`, data)
}