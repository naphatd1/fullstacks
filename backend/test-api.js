#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Test URLs
const testUrls = [
  'http://localhost:4000/api/health',
  'http://127.0.0.1:4000/api/health',
  'http://YOUR_SERVER_IP:4000/api/health',
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: 5000 }, (res) => {
      const latency = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            url,
            success: res.statusCode === 200,
            status: res.statusCode,
            latency,
            data: parsed,
            error: null
          });
        } catch (error) {
          resolve({
            url,
            success: false,
            status: res.statusCode,
            latency,
            data: null,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      const latency = Date.now() - startTime;
      resolve({
        url,
        success: false,
        status: null,
        latency,
        data: null,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const latency = Date.now() - startTime;
      resolve({
        url,
        success: false,
        status: null,
        latency,
        data: null,
        error: 'Request timeout'
      });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing API endpoints...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    console.log(`Testing: ${url}`);
    const result = await testUrl(url);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Success (${result.latency}ms) - Status: ${result.data?.status || 'unknown'}`);
    } else {
      console.log(`❌ Failed (${result.latency}ms) - Error: ${result.error || 'HTTP ' + result.status}`);
    }
    console.log('');
  }
  
  // Summary
  console.log('📊 Summary:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🚀 Working endpoints:');
    successful
      .sort((a, b) => a.latency - b.latency)
      .forEach(result => {
        console.log(`  ${result.url} (${result.latency}ms)`);
      });
  }
  
  if (failed.length > 0) {
    console.log('\n💥 Failed endpoints:');
    failed.forEach(result => {
      console.log(`  ${result.url} - ${result.error || 'HTTP ' + result.status}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (successful.length === 0) {
    console.log('  - Make sure the backend server is running on port 4000');
    console.log('  - Check if any firewall is blocking the connections');
    console.log('  - Verify the API endpoints are correctly configured');
  } else {
    const fastest = successful[0];
    console.log(`  - Use ${fastest.url} for best performance (${fastest.latency}ms)`);
    console.log(`  - Update NEXT_PUBLIC_API_URL in frontend/.env.local to: ${fastest.url.replace('/health', '')}`);
  }
}

// Run the tests
runTests().catch(console.error);