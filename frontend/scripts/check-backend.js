const API_URL = 'http://localhost:4000/api';

async function checkBackend() {
  console.log('🔍 Checking backend connection...');
  console.log('API URL:', API_URL);
  
  try {
    // Test basic health endpoint
    const healthResponse = await fetch(`${API_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error(`HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
    }
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
    
    // Test auth endpoints
    try {
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        })
      });
      
      if (loginResponse.ok) {
        console.log('✅ Login test passed');
      } else {
        const errorData = await loginResponse.json();
        console.log('ℹ️ Login test (expected to work with seeded data):', errorData);
      }
    } catch (loginError) {
      console.log('ℹ️ Login test error:', loginError.message);
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      console.error('💡 Solution: Make sure the NestJS backend is running on port 4000');
      console.error('   Run: npm run start:dev (in the backend directory)');
    }
    
    process.exit(1);
  }
}

checkBackend();