import axios from 'axios' 
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000' 
const api = axios.create({ baseURL: BASE_URL }) 
export const getProducts = (params) => api.get('/api/products', { params }) 
export const getFeaturedProducts = () => api.get('/api/products/featured') 
export const getCategories = () => api.get('/api/categories') 
export const submitEnquiry = (data) => api.post('/api/enquiries', data) 
export const validateCoupon = (data) => api.post('/api/coupons/validate', data)
export const submitOrder = (data) => api.post('/api/orders', data)
export default api 
