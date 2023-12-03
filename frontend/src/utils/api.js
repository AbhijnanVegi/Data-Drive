import axios from 'axios';
const token = localStorage.getItem('token'); // Get token from local storage
export default axios.create({
    baseURL: '/api',
    headers: {
        Authorization: `Bearer ${token}`,
    },
});