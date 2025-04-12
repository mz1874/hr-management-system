import axios from 'axios'
import router from '@/router'

const instance = axios.create({
    // baseURL: 'http://bugcreator.org.cn:8000',
    baseURL: 'http://localhost:8000',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
})

instance.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, error => {
    return Promise.reject(error)
})

instance.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status

        if (status === 401) {
            console.warn('认证失败或已过期，跳转到登录页')
            // 清除本地 token
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            // 重定向到登录页
            router.push('/login')
        } else {
            console.error('请求失败：', error.response?.data || error.message)
        }

        return Promise.reject(error)
    }
)

export default instance
