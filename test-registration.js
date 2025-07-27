// Test script to debug registration
import axios from 'axios';

const testRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Registration Response:', response.data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Registration Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
};

testRegistration();
