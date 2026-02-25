import apiGateway from './gateway.js';

// Fetch all blood records
export const getBloodData = () => apiGateway.get('/blood');

// Create a blood request
export const createBloodRequest = (data) => apiGateway.post('/blood-requests', data);
