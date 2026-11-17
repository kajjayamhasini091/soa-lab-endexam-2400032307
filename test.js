// test.js — Run this to auto test everything!
const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(data) });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('  JWT TOURIST AUTH — AUTO TEST');
  console.log('========================================\n');

  // --- TEST 1: LOGIN ---
  console.log('TEST 1: POST /api/login');
  const loginBody = JSON.stringify({ username: 'tourist1', password: 'pass123' });
  const loginRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginBody.length }
  }, loginBody);

  console.log('Status:', loginRes.status, loginRes.status === 200 ? '✅ 200 OK' : '❌ FAILED');
  console.log('Response:', JSON.stringify(loginRes.body, null, 2));
  const token = loginRes.body.token;
  console.log('\nToken received:', token ? '✅ YES' : '❌ NO');

  // --- TEST 2: VALIDATE ---
  console.log('\n----------------------------------------');
  console.log('TEST 2: GET /api/validate (with token)');
  const validateRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/validate', method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('Status:', validateRes.status, validateRes.status === 200 ? '✅ 200 OK' : '❌ FAILED');
  console.log('Response:', JSON.stringify(validateRes.body, null, 2));

  // --- TEST 3: UPDATE TOKEN ---
  console.log('\n----------------------------------------');
  console.log('TEST 3: POST /api/update-token');
  const updateRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/update-token', method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('Status:', updateRes.status, updateRes.status === 200 ? '✅ 200 OK' : '❌ FAILED');
  console.log('Response:', JSON.stringify(updateRes.body, null, 2));

  // --- TEST 4: PROFILE ---
  console.log('\n----------------------------------------');
  console.log('TEST 4: GET /api/profile');
  const profileRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/profile', method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('Status:', profileRes.status, profileRes.status === 200 ? '✅ 200 OK' : '❌ FAILED');
  console.log('Response:', JSON.stringify(profileRes.body, null, 2));

  console.log('\n========================================');
  console.log('  ALL TESTS DONE!');
  console.log('========================================\n');
}

runTests().catch(err => console.error('❌ Server not running! Start with: node server.js\n', err.message));
