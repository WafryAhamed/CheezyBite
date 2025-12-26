/**
 * Comprehensive Coupon System Test Script
 * Tests all scenarios: validation, application, edge cases, security
 */

const BASE_URL = 'http://localhost:3000';

// Test utilities
const log = {
    success: (msg) => console.log('✅', msg),
    error: (msg) => console.log('❌', msg),
    info: (msg) => console.log('ℹ️ ', msg),
    section: (msg) => console.log('\n' + '='.repeat(60) + '\n' + msg + '\n' + '='.repeat(60))
};

// Test counters
let passed = 0;
let failed = 0;

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 500, data: { error: error.message } };
    }
}

// Test: Fetch active coupons
async function testFetchActiveCoupons() {
    log.section('TEST 1: Fetch Active Coupons (Public Endpoint)');
    
    const { status, data } = await apiCall('/api/offers');
    
    if (status === 200 && data.success && Array.isArray(data.data)) {
        log.success(`Fetched ${data.data.length} active coupons`);
        data.data.forEach(coupon => {
            log.info(`${coupon.code} - ${coupon.type === 'fixed' ? `Rs. ${coupon.value}` : `${coupon.value}%`} off`);
        });
        passed++;
        return data.data;
    } else {
        log.error('Failed to fetch active coupons');
        failed++;
        return [];
    }
}

// Test: Valid coupon application
async function testValidCouponApplication(coupons) {
    log.section('TEST 2: Apply Valid Coupon');
    
    if (coupons.length === 0) {
        log.info('No coupons to test. Skipping.');
        return;
    }
    
    const testCoupon = coupons[0];
    const cartTotal = testCoupon.minOrderAmount ? testCoupon.minOrderAmount + 100 : 500;
    
    const { status, data } = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: testCoupon.code,
            cartTotal
        })
    });
    
    if (status === 200 && data.success && data.data.discountAmount > 0) {
        log.success(`Applied ${testCoupon.code}: Discount Rs. ${data.data.discountAmount}`);
        log.info(`Cart Total: Rs. ${cartTotal} → Final: Rs. ${data.data.finalTotal}`);
        passed++;
    } else {
        log.error(`Failed to apply valid coupon: ${data.message}`);
        failed++;
    }
}

// Test: Invalid coupon code
async function testInvalidCouponCode() {
    log.section('TEST 3: Invalid Coupon Code');
    
    const { status, data } = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: 'INVALIDCODE123',
            cartTotal: 500
        })
    });
    
    if (status === 404 && !data.success) {
        log.success(`Correctly rejected invalid coupon: ${data.message}`);
        passed++;
    } else {
        log.error('Failed to reject invalid coupon');
        failed++;
    }
}

// Test: Minimum order validation
async function testMinimumOrderValidation(coupons) {
    log.section('TEST 4: Minimum Order Amount Validation');
    
    const couponWithMin = coupons.find(c => c.minOrderAmount && c.minOrderAmount > 0);
    
    if (!couponWithMin) {
        log.info('No coupons with minimum order amount. Skipping.');
        return;
    }
    
    const insufficientTotal = couponWithMin.minOrderAmount - 50;
    
    const { status, data } = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: couponWithMin.code,
            cartTotal: insufficientTotal
        })
    });
    
    if (status === 400 && !data.success && data.message.includes('Minimum order amount')) {
        log.success(`Correctly enforced minimum order: ${data.message}`);
        passed++;
    } else {
        log.error('Failed to enforce minimum order amount');
        failed++;
    }
}

// Test: Percentage discount with max cap
async function testPercentageDiscountCap(coupons) {
    log.section('TEST 5: Percentage Discount with Max Cap');
    
    const percentCoupon = coupons.find(c => c.type === 'percent' && c.maxDiscount);
    
    if (!percentCoupon) {
        log.info('No percentage coupons with max cap. Skipping.');
        return;
    }
    
    // Cart total that would exceed max discount
    const highCartTotal = (percentCoupon.maxDiscount / percentCoupon.value) * 100 + 1000;
    
    const { status, data } = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: percentCoupon.code,
            cartTotal: highCartTotal
        })
    });
    
    if (status === 200 && data.data.discountAmount === percentCoupon.maxDiscount) {
        log.success(`Correctly capped discount at Rs. ${percentCoupon.maxDiscount}`);
        log.info(`Cart: Rs. ${highCartTotal} | Discount: Rs. ${data.data.discountAmount}`);
        passed++;
    } else {
        log.error('Failed to cap percentage discount');
        failed++;
    }
}

// Test: Missing required fields
async function testMissingFields() {
    log.section('TEST 6: Missing Required Fields');
    
    // Test 1: Missing code
    const test1 = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({ cartTotal: 500 })
    });
    
    if (test1.status === 400 && !test1.data.success) {
        log.success('Correctly rejected missing coupon code');
        passed++;
    } else {
        log.error('Failed to validate missing code');
        failed++;
    }
    
    // Test 2: Missing cartTotal
    const test2 = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({ code: 'TESTCODE' })
    });
    
    if (test2.status === 400 && !test2.data.success) {
        log.success('Correctly rejected missing cart total');
        passed++;
    } else {
        log.error('Failed to validate missing cart total');
        failed++;
    }
}

// Test: Case insensitivity
async function testCaseInsensitivity(coupons) {
    log.section('TEST 7: Case Insensitive Coupon Codes');
    
    if (coupons.length === 0) {
        log.info('No coupons to test. Skipping.');
        return;
    }
    
    const testCoupon = coupons[0];
    const cartTotal = testCoupon.minOrderAmount ? testCoupon.minOrderAmount + 100 : 500;
    
    // Test lowercase
    const { status: status1, data: data1 } = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: testCoupon.code.toLowerCase(),
            cartTotal
        })
    });
    
    // Test mixed case
    const mixedCase = testCoupon.code.split('').map((c, i) => 
        i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
    ).join('');
    
    const { status: status2, data: data2 } = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: mixedCase,
            cartTotal
        })
    });
    
    if (status1 === 200 && status2 === 200) {
        log.success('Coupon codes are case-insensitive');
        passed++;
    } else {
        log.error('Case sensitivity issue detected');
        failed++;
    }
}

// Test: Zero or negative cart total
async function testInvalidCartTotal(coupons) {
    log.section('TEST 8: Invalid Cart Total Handling');
    
    if (coupons.length === 0) {
        log.info('No coupons to test. Skipping.');
        return;
    }
    
    const testCoupon = coupons[0];
    
    // Test zero
    const test1 = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: testCoupon.code,
            cartTotal: 0
        })
    });
    
    // Test negative
    const test2 = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: testCoupon.code,
            cartTotal: -100
        })
    });
    
    if (test1.status === 400 && test2.status === 400) {
        log.success('Correctly rejected invalid cart totals');
        passed++;
    } else {
        log.error('Failed to validate cart total');
        failed++;
    }
}

// Test: Fixed discount coupons
async function testFixedDiscount(coupons) {
    log.section('TEST 9: Fixed Discount Calculation');
    
    const fixedCoupon = coupons.find(c => c.type === 'fixed');
    
    if (!fixedCoupon) {
        log.info('No fixed discount coupons. Skipping.');
        return;
    }
    
    const cartTotal = fixedCoupon.minOrderAmount ? fixedCoupon.minOrderAmount + 100 : 500;
    
    const { status, data } = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: fixedCoupon.code,
            cartTotal
        })
    });
    
    if (status === 200 && data.data.discountAmount === fixedCoupon.value) {
        log.success(`Fixed discount correctly applied: Rs. ${data.data.discountAmount}`);
        passed++;
    } else {
        log.error('Fixed discount calculation error');
        failed++;
    }
}

// Test: Percentage discount coupons
async function testPercentageDiscount(coupons) {
    log.section('TEST 10: Percentage Discount Calculation');
    
    const percentCoupon = coupons.find(c => c.type === 'percent');
    
    if (!percentCoupon) {
        log.info('No percentage discount coupons. Skipping.');
        return;
    }
    
    const cartTotal = percentCoupon.minOrderAmount ? percentCoupon.minOrderAmount + 100 : 500;
    const expectedDiscount = (cartTotal * percentCoupon.value) / 100;
    
    const { status, data } = await apiCall('/api/offers/apply', {
        method: 'POST',
        body: JSON.stringify({
            code: percentCoupon.code,
            cartTotal
        })
    });
    
    if (status === 200 && Math.abs(data.data.discountAmount - expectedDiscount) < 0.01) {
        log.success(`Percentage discount correctly calculated: Rs. ${data.data.discountAmount}`);
        passed++;
    } else {
        log.error(`Percentage discount mismatch. Expected: ${expectedDiscount}, Got: ${data.data?.discountAmount}`);
        failed++;
    }
}

// Main test runner
async function runTests() {
    console.log('\n🧪 COUPON SYSTEM COMPREHENSIVE TEST SUITE\n');
    
    try {
        // Fetch active coupons first
        const coupons = await testFetchActiveCoupons();
        
        // Run all tests
        await testValidCouponApplication(coupons);
        await testInvalidCouponCode();
        await testMinimumOrderValidation(coupons);
        await testPercentageDiscountCap(coupons);
        await testMissingFields();
        await testCaseInsensitivity(coupons);
        await testInvalidCartTotal(coupons);
        await testFixedDiscount(coupons);
        await testPercentageDiscount(coupons);
        
        // Summary
        log.section('TEST SUMMARY');
        console.log(`Total Tests: ${passed + failed}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
        
        if (failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! Coupon system is working correctly.\n');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
        }
        
    } catch (error) {
        console.error('💥 Test suite crashed:', error);
    }
}

// Run tests
runTests();
