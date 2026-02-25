const axios = require('axios');

// Function to fetch organizer email from user-service API
// Fixed endpoint path to match user-service mounting: /api/users/eventOrganisor/:id
const getOrganizerEmail = async (organizerId) => {
  try {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/eventOrganisor/${organizerId}`, {
      timeout: 5000  // 5 second timeout
    });
    // Fix data extraction: response.data is { data: { email: '...' } }
    if (!response.data || !response.data.data || !response.data.data.email) {
      throw new Error('Organizer email not found in response');
    }
    console.log(`Fetched organizer email for ID ${organizerId}: ${response.data.data.email}`); // Debug log
    return response.data.data.email;
  } catch (error) {
    console.error(`Error fetching organizer email for ID ${organizerId}:`, {
      message: error.message,
      status: error.response?.status,
      url: `${process.env.USER_SERVICE_URL}/api/users/eventOrganisor/${organizerId}` // Log full URL
    });
    throw new Error('Failed to fetch organizer details');
  }
};

module.exports = { getOrganizerEmail };