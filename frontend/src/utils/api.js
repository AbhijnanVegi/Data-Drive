import axios from 'axios';
const token = localStorage.getItem('token'); // Get token from local storage
export default axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        Authorization: `Bearer ${token}`,
    },
});