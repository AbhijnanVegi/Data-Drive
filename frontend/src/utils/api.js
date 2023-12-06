import axios from 'axios';
const token = localStorage.getItem('token'); // Get token from local storage
/**
 * Creates an instance of axios with a base URL and authorization headers.
 * @returns {AxiosInstance} The axios instance.
 */
export default axios.create({
    baseURL: '/api',
    headers: {
        Authorization: `Bearer ${token}`,
    },
});