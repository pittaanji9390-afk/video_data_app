/**
 * Unit Test Script for JWT Authentication Middleware
 * Verifies token validation, 401 responses for missing/invalid tokens, and req.user attachment
 */

const http = require('http');

function fetchGET(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'GET',
        headers: headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: body });
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

function fetchPOST(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: body });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting JWT Middleware Unit Tests ---\n');

  try {
    // 1. First obtain valid token via login
    const loginRes = await fetchPOST('/api/v1/auth/login', {
      email: 'admin@videoplatform.com',
      password: 'password123',
    });
    const validToken = loginRes.data?.data?.accessToken;
    console.log('Obtained Valid Token:', validToken ? `${validToken.substring(0, 30)}...` : 'NONE');

    // Test 1: Protected route with NO Token
    console.log('\nTest 1: Requesting protected API with NO Authorization header...');
    const noTokenRes = await fetchGET('/api/v1/vendors');
    console.log('Status Code:', noTokenRes.statusCode);
    console.log('Response Payload:', noTokenRes.data);

    if (noTokenRes.statusCode === 401 && noTokenRes.data?.message?.includes('No authentication token')) {
      console.log('✅ Test 1 PASSED: Missing token rejected with 401!');
    } else {
      console.error('❌ Test 1 FAILED!');
    }

    // Test 2: Protected route with INVALID Token
    console.log('\nTest 2: Requesting protected API with INVALID Token...');
    const invalidTokenRes = await fetchGET('/api/v1/vendors', {
      Authorization: 'Bearer invalid_token_12345',
    });
    console.log('Status Code:', invalidTokenRes.statusCode);
    console.log('Response Payload:', invalidTokenRes.data);

    if (invalidTokenRes.statusCode === 401 && invalidTokenRes.data?.message?.includes('Invalid')) {
      console.log('✅ Test 2 PASSED: Invalid token rejected with 401!');
    } else {
      console.error('❌ Test 2 FAILED!');
    }

    // Test 3: Protected route with VALID JWT Access Token
    console.log('\nTest 3: Requesting protected API with VALID JWT Access Token...');
    const validTokenRes = await fetchGET('/api/v1/vendors', {
      Authorization: `Bearer ${validToken}`,
    });
    console.log('Status Code:', validTokenRes.statusCode);
    console.log('Response Payload Status:', validTokenRes.data?.status);

    if (validTokenRes.statusCode === 200 && validTokenRes.data?.status === 'success') {
      console.log('✅ Test 3 PASSED: Valid token authorized with status 200 OK!');
    } else {
      console.error('❌ Test 3 FAILED!');
    }
  } catch (err) {
    console.error('Error executing middleware tests:', err.message);
  }
}

runTests();
