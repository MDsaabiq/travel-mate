import axios from 'axios';

const testData = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  city: "Mumbai",
  travelPersona: "solo",
  age: 25,
  gender: "male",
  interests: ["Adventure", "Photography"]
};

async function testRegister() {
  try {
    console.log('Testing registration with data:', testData);
    const response = await axios.post('http://localhost:3000/api/auth/register', testData);
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testRegister();
