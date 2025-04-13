// src/utils/axiosInstance.js or @/utils/axios.js

import axios from 'axios'
import { baseURL } from '@/store/constant'

const api = axios.create({
    baseURL: baseURL || '/api/v1'
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
