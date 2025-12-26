async function testProtectedApis() {
    const BASE_URL = 'http://localhost:3000/api';

    // Helper for requests
    async function request(method, endpoint, token, body = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const res = await fetch(`${BASE_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });
            const data = await res.json();
            return { status: res.status, data };
        } catch (e) {
            return { status: 500, error: e.message };
        }
    }

    console.log('🚀 Starting Protected API Verification...\n');

    // 1. Admin Login & Check
    console.log('1️⃣  Testing Admin API...');
    const adminLogin = await request('POST', '/admin/auth/login', null, {
        username: 'admin',
        password: 'Admin@123'
    });

    if (adminLogin.status === 200 && adminLogin.data.token) {
        console.log('   ✅ Admin Login Success');
        const adminToken = adminLogin.data.token;

        // Test Admin Orders
        const ordersRes = await request('GET', '/admin/orders', adminToken);
        if (ordersRes.status === 200) {
            console.log(`   ✅ Admin Protected Route (/api/admin/orders) Success: ${ordersRes.data.data.length} orders found`);
        } else {
            console.error(`   ❌ Admin API Failed: ${ordersRes.status}`, ordersRes.data);
        }
    } else {
        console.error('   ❌ Admin Login Failed', adminLogin);
    }

    console.log('\n2️⃣  Testing User API...');
    // 2. User Login & Cart
    const userLogin = await request('POST', '/auth/login', null, {
        email: 'test@example.com',
        password: 'Test@123'
    });

    if (userLogin.status === 200 && userLogin.data.token) {
        console.log('   ✅ User Login Success');
        const userToken = userLogin.data.token;

        // Test Cart GET
        const cartGet = await request('GET', '/cart', userToken);
        if (cartGet.status === 200) {
            console.log('   ✅ Cart GET Success');
        } else {
            console.error(`   ❌ Cart GET Failed: ${cartGet.status}`);
        }

        // Test Cart POST
        const cartPost = await request('POST', '/cart', userToken, {
            items: [{
                cartLineId: 'test-item-1',
                id: 1,
                name: 'Test Pizza',
                price: 1500,
                amount: 1,
                size: 'medium',
                crust: 'thin'
            }]
        });

        if (cartPost.status === 200) {
            console.log('   ✅ Cart POST Success (Item Added)');
        } else {
            console.error(`   ❌ Cart POST Failed: ${cartPost.status}`, cartPost.data);
        }

        // Test Order Creation
        console.log('\n3️⃣  Testing Order Creation...');
        const orderPost = await request('POST', '/orders', userToken, {
            items: [{
                id: 1,
                name: 'Test Pizza',
                price: 1500,
                amount: 1,
                size: 'medium',
                crust: 'thin'
            }],
            total: 1500,
            deliveryAddress: {
                street: '123 Test St',
                city: 'Test City',
                phone: '+94771234567'
            },
            paymentMethod: 'cash'
        });

        if (orderPost.status === 201 || orderPost.status === 200) {
            console.log('   ✅ Order Creation Success');
            console.log(`      Order ID: ${orderPost.data.data.id}`);
        } else {
            console.error(`   ❌ Order Creation Failed: ${orderPost.status}`, orderPost.data);
        }

    } else {
        console.error('   ❌ User Login Failed', userLogin);
    }

    // 4. Guest Order Creation
    console.log('\n4️⃣  Testing Guest Order Creation...');
    const guestOrderPost = await request('POST', '/orders', null, {
        items: [{
            cartLineId: 'guest-item-1',
            id: 2,
            name: 'Guest Pizza',
            image: '/pizzas/cheese.png',
            price: 1800,
            amount: 1,
            size: 'large',
            crust: 'cheese'
        }],
        total: 1800,
        // Use 'address' to match schema and validator expectations
        address: {
            street: 'Guest St',
            city: 'Guest City',
            phone: '+94770000000',
            label: 'Guest Home'
        },
        paymentMethod: 'cash'
    });

    if (guestOrderPost.status === 201 || guestOrderPost.status === 200) {
        console.log('   ✅ Guest Order Creation Success');
        const guestOrderId = guestOrderPost.data.data.id;
        console.log(`      Guest Order ID: ${guestOrderId}`);

        // Verify Guest Access via ID
        const guestOrderGet = await request('GET', `/orders/${guestOrderId}`, null);
        if (guestOrderGet.status === 200) {
            console.log('   ✅ Guest Order Retrieval Success (by ID)');
        } else {
            console.error(`   ❌ Guest Order Retrieval Failed: ${guestOrderGet.status}`, guestOrderGet.data);
        }

    } else {
        console.error(`   ❌ Guest Order Creation Failed: ${guestOrderPost.status}`, guestOrderPost.data);
    }

    console.log('\n🏁 Verification Complete');
}

testProtectedApis();
