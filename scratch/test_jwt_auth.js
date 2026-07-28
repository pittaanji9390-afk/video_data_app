/**
 * Unit Test Script for JWT Authentication
 * Verifies POST /api/v1/auth/login and POST /api/v1/auth/refresh
 */

const http = require('http');

function postJSON(path, data) {
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
  console.log('--- Starting JWT Auth API Unit Tests ---\n');

  try {
    // Test 1: Successful Login
    console.log('Test 1: Testing POST /api/v1/auth/login (Valid Credentials)...');
    const validLoginRes = await postJSON('/api/v1/auth/login', {
      email: 'admin@videoplatform.com',
      password: 'password123',
    });
    console.log('Status Code:', validLoginRes.statusCode);
    console.log('Response Payload:', JSON.stringify(validLoginRes.data, null, 2));

    if (
      validLoginRes.statusCode === 200 &&
      validLoginRes.data?.data?.accessToken &&
      validLoginRes.data?.data?.refreshToken
    ) {
      console.log('✅ Test 1 PASSED: Tokens generated successfully!\n');
    } else {
      console.error('❌ Test 1 FAILED!\n');
    }

    // Test 2: Invalid Credentials
    console.log('Test 2: Testing POST /api/v1/auth/login (Invalid Password)...');
    const invalidLoginRes = await postJSON('/api/v1/auth/login', {
      email: 'admin@videoplatform.com',
      password: 'wrongpassword',
    });
    console.log('Status Code:', invalidLoginRes.statusCode);
    console.log('Error Message:', invalidLoginRes.data?.message);

    if (
      invalidLoginRes.statusCode === 401 &&
      invalidLoginRes.data?.message === 'Invalid email or password'
    ) {
      console.log('✅ Test 2 PASSED: Invalid credentials rejected with 401!\n');
    } else {
      console.error('❌ Test 2 FAILED!\n');
    }

    // Test 3: Refresh Token
    if (validLoginRes.data?.data?.refreshToken) {
      console.log('Test 3: Testing POST /api/v1/auth/refresh (Valid Refresh Token)...');
      const refreshRes = await postJSON('/api/v1/auth/refresh', {
        refreshToken: validLoginRes.data.data.refreshToken,
      });
      console.log('Status Code:', refreshRes.statusCode);
      console.log('Response Payload:', JSON.stringify(refreshRes.data, null, 2));

      if (refreshRes.statusCode === 200 && refreshRes.data?.data?.accessToken) {
        console.log('✅ Test 3 PASSED: Access token refreshed successfully!\n');
      } else {
        console.error('❌ Test 3 FAILED!\n');
      }
    }
  } catch (err) {
    console.error('Error executing tests:', err.message);
  }
}

runTests();
