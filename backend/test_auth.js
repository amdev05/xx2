const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ success: false, message: 'Invalid JSON response' });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

async function testAdminLogin() {
    console.log('\n🧪 Testing Admin Login...');
    try {
        const data = await makeRequest('/admin/login', 'POST', {
            email: 'admin@cinema.com',
            password: 'admin123'
        });
        
        if (data.success) {
            console.log('✅ Admin login successful!');
            console.log('📧 Email:', data.data.admin.email);
            console.log('👤 Name:', data.data.admin.nama_admin);
            console.log('🔑 Token prefix:', data.data.token.substring(0, 4));
            console.log('🕐 Token length:', data.data.token.length);
            return data.data.token;
        } else {
            console.log('❌ Admin login failed:', data.message);
            return null;
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        return null;
    }
}

async function testUserRegister() {
    console.log('\n🧪 Testing User Register...');
    try {
        const data = await makeRequest('/user/register', 'POST', {
            email: 'testuser@test.com',
            password: 'user123',
            nama_pelanggan: 'Test User'
        });
        
        if (data.success) {
            console.log('✅ User register successful!');
            console.log('📧 Email:', data.data.user.email);
            console.log('👤 Name:', data.data.user.nama_pelanggan);
            console.log('🔑 Token prefix:', data.data.token.substring(0, 4));
            console.log('🕐 Token length:', data.data.token.length);
            return data.data.token;
        } else {
            console.log('❌ User register failed:', data.message);
            return null;
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        return null;
    }
}

async function testAdminEndpointWithAdminToken(adminToken) {
    console.log('\n🧪 Testing Admin Endpoint with Admin Token...');
    try {
        const data = await makeRequest('/admin/profile', 'GET', null, adminToken);
        
        if (data.success) {
            console.log('✅ Admin can access admin endpoint!');
            console.log('👤 Admin:', data.data.nama_admin);
        } else {
            console.log('❌ Failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function testAdminEndpointWithUserToken(userToken) {
    console.log('\n🧪 Testing Admin Endpoint with User Token (should fail)...');
    try {
        const data = await makeRequest('/admin/profile', 'GET', null, userToken);
        
        if (!data.success) {
            console.log('✅ Correctly blocked! Message:', data.message);
        } else {
            console.log('❌ Security issue: User accessed admin endpoint!');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function testUserEndpointWithUserToken(userToken) {
    console.log('\n🧪 Testing User Endpoint with User Token...');
    try {
        const data = await makeRequest('/user/profile', 'GET', null, userToken);
        
        if (data.success) {
            console.log('✅ User can access user endpoint!');
            console.log('👤 User:', data.data.nama_pelanggan);
        } else {
            console.log('❌ Failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting Authentication Tests...');
    console.log('=' .repeat(50));

    const adminToken = await testAdminLogin();
    const userToken = await testUserRegister();

    if (adminToken) {
        await testAdminEndpointWithAdminToken(adminToken);
    }

    if (userToken) {
        await testUserEndpointWithUserToken(userToken);
        if (adminToken) {
            await testAdminEndpointWithUserToken(userToken);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Tests completed!');
}

runTests();
