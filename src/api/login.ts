
import axios from './axios'

export function login(username, password) {
    return axios.post('/api/token/', { username, password })
}

export function refreshToken(refresh) {
    return axios.post('/api/token/refresh/', { refresh })
}

export function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
}