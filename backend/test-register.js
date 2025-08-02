// Test register functionality
const API_URL = 'http://localhost:4000/api';

async function testRegister() {
  console.log('🧪 Testing register functionality...');
  
  const testData = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#',
    name: 'Test User'
  };
  
  console.log('📝 Test data:', testData);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success response:', {
      user: data.user,
      hasTokens: !!(data.access_token && data.refresh_token)
    });
    
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
}

// Test CORS
async function testCORS() {
  console.log('🌐 Testing CORS...');
  
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('🌐 CORS test status:', response.status);
    console.log('🌐 CORS headers:', {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
    });
    
  } catch (error) {
    console.error('💥 CORS test error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testCORS();
  await testRegister();
}

runTests();