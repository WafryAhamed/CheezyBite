async function testLogin() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'Admin@123'
            })
        });

        const data = await response.json();

        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ API Login Success!');
            // Also invoke verification of protected route if token is present
            // Note: In real app, cookie is used.
        } else {
            console.log('❌ API Login Failed');
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

testLogin();
