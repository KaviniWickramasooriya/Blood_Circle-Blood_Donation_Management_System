import axios from 'axios';

// Base URL for your backend
const API_BASE_URL = 'http://localhost:3002/api'; 

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle response data
apiClient.interceptors.response.use(
  (response) => response.data, 
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// Export helper methods
const apiGateway = {
  get: (url, params) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  delete: (url) => apiClient.delete(url),
};

export default apiGateway;