/**
 * API Test Script for Money Manager
 * Tests all API endpoints to verify they are working correctly
 * 
 * Run with: npx ts-node --esm scripts/test-api.ts
 * Or: npx tsx scripts/test-api.ts
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
    endpoint: string;
    method: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    statusCode?: number;
    message: string;
    responseTime: number;
}

const results: TestResult[] = [];

// Test helper function
async function testEndpoint(
    method: string,
    endpoint: string,
    options: {
        body?: Record<string, unknown>;
        cookie?: string;
        expectedStatus?: number[];
        description?: string;
    } = {}
): Promise<{ status: number; data: unknown; headers: Headers }> {
    const startTime = Date.now();
    const { body, cookie, expectedStatus = [200], description } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (cookie) {
        headers['Cookie'] = cookie;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const responseTime = Date.now() - startTime;
        let data: unknown;

        try {
            data = await response.json();
        } catch {
            data = { rawResponse: 'Unable to parse JSON' };
        }

        const passed = expectedStatus.includes(response.status);

        results.push({
            endpoint,
            method,
            status: passed ? 'PASS' : 'FAIL',
            statusCode: response.status,
            message: description || (passed ? 'OK' : `Expected ${expectedStatus.join(' or ')}, got ${response.status}`),
            responseTime,
        });

        return { status: response.status, data, headers: response.headers };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        results.push({
            endpoint,
            method,
            status: 'FAIL',
            message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            responseTime,
        });
        throw error;
    }
}

// Add a test result without actually testing (for skipped or info tests)
function addResult(endpoint: string, method: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string) {
    results.push({
        endpoint,
        method,
        status,
        message,
        responseTime: 0,
    });
}

async function runTests() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 MONEY MANAGER API TEST SUITE');
    console.log('='.repeat(80));
    console.log(`\n📍 Base URL: ${BASE_URL}`);
    console.log(`📅 Test Run: ${new Date().toISOString()}\n`);

    // ============================================================================
    // 1. TEST AUTH ENDPOINTS (Unauthenticated)
    // ============================================================================
    console.log('\n📋 TESTING AUTH ENDPOINTS (Unauthenticated)');
    console.log('-'.repeat(50));

    // Test signup with missing fields
    await testEndpoint('POST', '/api/auth/signup', {
        body: {},
        expectedStatus: [400],
        description: 'Returns 400 for missing fields',
    });

    // Test signup with short username
    await testEndpoint('POST', '/api/auth/signup', {
        body: { username: 'ab', password: 'password123' },
        expectedStatus: [400],
        description: 'Returns 400 for short username',
    });

    // Test signup with short password
    await testEndpoint('POST', '/api/auth/signup', {
        body: { username: 'testuser', password: '12345' },
        expectedStatus: [400],
        description: 'Returns 400 for short password',
    });

    // Create a test user (might already exist)
    const testUsername = `testuser_${Date.now()}`;
    const testPassword = 'testpassword123';

    await testEndpoint('POST', '/api/auth/signup', {
        body: { username: testUsername, password: testPassword },
        expectedStatus: [200, 409], // 200 for new user, 409 if exists
        description: 'Creates a new user or returns 409 if exists',
    });

    console.log(`   Created test user: ${testUsername}`);

    // ============================================================================
    // 2. TEST PROTECTED ENDPOINTS WITHOUT AUTH (Should fail with 401)
    // ============================================================================
    console.log('\n📋 TESTING PROTECTED ENDPOINTS WITHOUT AUTH');
    console.log('-'.repeat(50));

    const protectedEndpoints = [
        { method: 'GET', endpoint: '/api/categories' },
        { method: 'POST', endpoint: '/api/categories' },
        { method: 'GET', endpoint: '/api/transactions' },
        { method: 'POST', endpoint: '/api/transactions' },
        { method: 'GET', endpoint: '/api/ledgers' },
        { method: 'POST', endpoint: '/api/ledgers' },
        { method: 'GET', endpoint: '/api/user/ledger' },
        { method: 'GET', endpoint: '/api/user/preferences' },
        { method: 'PATCH', endpoint: '/api/user/preferences' },
        { method: 'GET', endpoint: '/api/ledger/invite' },
        { method: 'POST', endpoint: '/api/ledger/invite' },
        { method: 'GET', endpoint: '/api/receipts/stats' },
    ];

    for (const { method, endpoint } of protectedEndpoints) {
        await testEndpoint(method, endpoint, {
            expectedStatus: [401],
            description: 'Returns 401 when not authenticated',
        });
    }

    // ============================================================================
    // 3. TEST NEXT-AUTH SESSION ENDPOINT
    // ============================================================================
    console.log('\n📋 TESTING NEXT-AUTH ENDPOINTS');
    console.log('-'.repeat(50));

    await testEndpoint('GET', '/api/auth/session', {
        expectedStatus: [200],
        description: 'Returns session info (empty when not logged in)',
    });

    await testEndpoint('GET', '/api/auth/providers', {
        expectedStatus: [200],
        description: 'Returns available auth providers',
    });

    await testEndpoint('GET', '/api/auth/csrf', {
        expectedStatus: [200],
        description: 'Returns CSRF token',
    });

    // ============================================================================
    // 4. ATTEMPT LOGIN VIA CREDENTIALS
    // ============================================================================
    console.log('\n📋 TESTING LOGIN FLOW');
    console.log('-'.repeat(50));

    // Get CSRF token first
    const csrfResult = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfResult.json() as { csrfToken: string };
    const csrfToken = csrfData.csrfToken;

    // Get cookies from CSRF response
    let cookieString = csrfResult.headers.get('set-cookie') || '';
    console.log(`   Got CSRF token: ${csrfToken.substring(0, 20)}...`);

    // Attempt login with credentials
    const loginResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieString,
        },
        body: new URLSearchParams({
            csrfToken,
            username: testUsername,
            password: testPassword,
            callbackUrl: `${BASE_URL}/`,
            json: 'true',
        }),
        redirect: 'manual',
    });

    // Collect all cookies
    const loginCookies = loginResponse.headers.get('set-cookie');
    if (loginCookies) {
        cookieString += '; ' + loginCookies;
    }

    if (loginResponse.status === 302 || loginResponse.status === 200) {
        addResult('/api/auth/callback/credentials', 'POST', 'PASS', `Login successful (${loginResponse.status})`);
        console.log('   Login successful!');
    } else {
        addResult('/api/auth/callback/credentials', 'POST', 'FAIL', `Login failed with status ${loginResponse.status}`);
        console.log(`   Login failed with status ${loginResponse.status}`);
    }

    // Get session after login to verify
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
        headers: { Cookie: cookieString },
    });
    const sessionData = await sessionResponse.json() as { user?: { id?: string; username?: string } };

    if (sessionData.user) {
        addResult('/api/auth/session', 'GET', 'PASS', `Session verified for user: ${sessionData.user.username}`);
        console.log(`   Session verified for user: ${sessionData.user.username}`);
    } else {
        addResult('/api/auth/session', 'GET', 'SKIP', 'No session found - some tests may be skipped');
        console.log('   No session found - some tests may be skipped');
    }

    // ============================================================================
    // 5. TEST PROTECTED ENDPOINTS WITH AUTH (if session exists)
    // ============================================================================
    if (sessionData.user) {
        console.log('\n📋 TESTING PROTECTED ENDPOINTS WITH AUTH');
        console.log('-'.repeat(50));

        // Test categories
        const categoriesResult = await fetch(`${BASE_URL}/api/categories`, {
            headers: { Cookie: cookieString },
        });
        const categoriesData = await categoriesResult.json() as unknown[];
        addResult('/api/categories', 'GET', categoriesResult.status === 200 ? 'PASS' : 'FAIL',
            `Got ${Array.isArray(categoriesData) ? categoriesData.length : 0} categories`);

        // Test user ledger
        const ledgerResult = await fetch(`${BASE_URL}/api/user/ledger`, {
            headers: { Cookie: cookieString },
        });
        const ledgerData = await ledgerResult.json() as { id?: string; name?: string; currency?: string };
        addResult('/api/user/ledger', 'GET', ledgerResult.status === 200 ? 'PASS' : 'FAIL',
            ledgerData.id ? `Got ledger: ${ledgerData.name} (${ledgerData.currency})` : 'No ledger found');

        // Test all ledgers
        const ledgersResult = await fetch(`${BASE_URL}/api/ledgers`, {
            headers: { Cookie: cookieString },
        });
        const ledgersData = await ledgersResult.json() as unknown[];
        addResult('/api/ledgers', 'GET', ledgersResult.status === 200 ? 'PASS' : 'FAIL',
            `Got ${Array.isArray(ledgersData) ? ledgersData.length : 0} ledgers`);

        // Test transactions
        const transactionsResult = await fetch(`${BASE_URL}/api/transactions`, {
            headers: { Cookie: cookieString },
        });
        const transactionsData = await transactionsResult.json() as unknown[];
        addResult('/api/transactions', 'GET', transactionsResult.status === 200 ? 'PASS' : 'FAIL',
            `Got ${Array.isArray(transactionsData) ? transactionsData.length : 0} transactions`);

        // Test user preferences
        const preferencesResult = await fetch(`${BASE_URL}/api/user/preferences`, {
            headers: { Cookie: cookieString },
        });
        const preferencesData = await preferencesResult.json() as { currentLedgerId?: string; darkMode?: boolean };
        addResult('/api/user/preferences', 'GET', preferencesResult.status === 200 ? 'PASS' : 'FAIL',
            `Dark mode: ${preferencesData.darkMode}, Ledger ID: ${preferencesData.currentLedgerId || 'none'}`);

        // Test ledger invite list
        const inviteListResult = await fetch(`${BASE_URL}/api/ledger/invite`, {
            headers: { Cookie: cookieString },
        });
        const inviteListData = await inviteListResult.json() as { sharedUsers?: unknown[] };
        addResult('/api/ledger/invite', 'GET', inviteListResult.status === 200 ? 'PASS' : 'FAIL',
            `Shared users: ${inviteListData.sharedUsers?.length || 0}`);

        // Test receipt stats
        const receiptStatsResult = await fetch(`${BASE_URL}/api/receipts/stats`, {
            headers: { Cookie: cookieString },
        });
        const receiptStatsData = await receiptStatsResult.json() as { totalReceipts?: number; formattedSize?: string };
        addResult('/api/receipts/stats', 'GET', receiptStatsResult.status === 200 ? 'PASS' : 'FAIL',
            `Receipts: ${receiptStatsData.totalReceipts || 0}, Size: ${receiptStatsData.formattedSize || '0 Bytes'}`);

        // ============================================================================
        // 6. TEST CREATE/UPDATE/DELETE OPERATIONS
        // ============================================================================
        console.log('\n📋 TESTING CRUD OPERATIONS');
        console.log('-'.repeat(50));

        // Get the first category for creating a transaction
        const categories = Array.isArray(categoriesData) ? categoriesData : [];
        const firstCategory = categories[0] as { id: string; ledgerId: string } | undefined;

        if (firstCategory) {
            // Create a transaction
            const createTxResult = await fetch(`${BASE_URL}/api/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieString,
                },
                body: JSON.stringify({
                    description: 'Test Transaction',
                    amount: 100.50,
                    type: 'Expense',
                    date: new Date().toISOString().split('T')[0],
                    note: 'Created by API test',
                    categoryId: firstCategory.id,
                    ledgerId: firstCategory.ledgerId,
                }),
            });
            const createTxData = await createTxResult.json() as { id?: string };
            addResult('/api/transactions', 'POST', createTxResult.status === 200 ? 'PASS' : 'FAIL',
                createTxData.id ? `Created transaction: ${createTxData.id}` : 'Failed to create transaction');

            if (createTxData.id) {
                // Update the transaction
                const updateTxResult = await fetch(`${BASE_URL}/api/transactions/${createTxData.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': cookieString,
                    },
                    body: JSON.stringify({
                        description: 'Updated Test Transaction',
                        amount: 200.75,
                        type: 'Expense',
                        date: new Date().toISOString().split('T')[0],
                        note: 'Updated by API test',
                        categoryId: firstCategory.id,
                    }),
                });
                addResult(`/api/transactions/${createTxData.id}`, 'PUT', updateTxResult.status === 200 ? 'PASS' : 'FAIL',
                    updateTxResult.status === 200 ? 'Transaction updated' : 'Failed to update transaction');

                // Delete the transaction
                const deleteTxResult = await fetch(`${BASE_URL}/api/transactions/${createTxData.id}`, {
                    method: 'DELETE',
                    headers: { 'Cookie': cookieString },
                });
                addResult(`/api/transactions/${createTxData.id}`, 'DELETE', deleteTxResult.status === 200 ? 'PASS' : 'FAIL',
                    deleteTxResult.status === 200 ? 'Transaction deleted' : 'Failed to delete transaction');
            }

            // Create a new category
            const createCatResult = await fetch(`${BASE_URL}/api/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieString,
                },
                body: JSON.stringify({
                    name: 'Test Category',
                    type: 'Expense',
                    color: '#FF5733',
                    icon: '🧪',
                    ledgerId: firstCategory.ledgerId,
                }),
            });
            const createCatData = await createCatResult.json() as { id?: string };
            addResult('/api/categories', 'POST', createCatResult.status === 200 ? 'PASS' : 'FAIL',
                createCatData.id ? `Created category: ${createCatData.id}` : 'Failed to create category');

            if (createCatData.id) {
                // Update the category
                const updateCatResult = await fetch(`${BASE_URL}/api/categories/${createCatData.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': cookieString,
                    },
                    body: JSON.stringify({
                        name: 'Updated Test Category',
                        type: 'Income',
                        color: '#33FF57',
                        icon: '✅',
                    }),
                });
                addResult(`/api/categories/${createCatData.id}`, 'PUT', updateCatResult.status === 200 ? 'PASS' : 'FAIL',
                    updateCatResult.status === 200 ? 'Category updated' : 'Failed to update category');

                // Delete the category
                const deleteCatResult = await fetch(`${BASE_URL}/api/categories/${createCatData.id}`, {
                    method: 'DELETE',
                    headers: { 'Cookie': cookieString },
                });
                addResult(`/api/categories/${createCatData.id}`, 'DELETE', deleteCatResult.status === 200 ? 'PASS' : 'FAIL',
                    deleteCatResult.status === 200 ? 'Category deleted' : 'Failed to delete category');
            }
        } else {
            addResult('/api/categories', 'POST', 'SKIP', 'No categories found to test with');
        }

        // Test create ledger
        const createLedgerResult = await fetch(`${BASE_URL}/api/ledgers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieString,
            },
            body: JSON.stringify({
                name: 'Test Ledger ' + Date.now(),
                currency: 'EUR',
            }),
        });
        const createLedgerData = await createLedgerResult.json() as { id?: string; name?: string };
        addResult('/api/ledgers', 'POST', createLedgerResult.status === 200 ? 'PASS' : 'FAIL',
            createLedgerData.id ? `Created ledger: ${createLedgerData.name}` : 'Failed to create ledger');

        // Test update preferences
        const updatePrefsResult = await fetch(`${BASE_URL}/api/user/preferences`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieString,
            },
            body: JSON.stringify({
                darkMode: true,
            }),
        });
        addResult('/api/user/preferences', 'PATCH', updatePrefsResult.status === 200 ? 'PASS' : 'FAIL',
            updatePrefsResult.status === 200 ? 'Preferences updated' : 'Failed to update preferences');

        // Revert preferences
        await fetch(`${BASE_URL}/api/user/preferences`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieString,
            },
            body: JSON.stringify({
                darkMode: preferencesData.darkMode || false,
            }),
        });

        // Test invite user (with non-existent user)
        const inviteResult = await fetch(`${BASE_URL}/api/ledger/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieString,
            },
            body: JSON.stringify({
                username: 'nonexistentuser12345',
                role: 'viewer',
            }),
        });
        addResult('/api/ledger/invite', 'POST', inviteResult.status === 404 ? 'PASS' : 'FAIL',
            inviteResult.status === 404 ? 'Returns 404 for non-existent user' : `Unexpected status: ${inviteResult.status}`);

        // Test update ledger currency
        if (ledgerData.id) {
            const updateCurrencyResult = await fetch(`${BASE_URL}/api/ledger/${ledgerData.id}/currency`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieString,
                },
                body: JSON.stringify({
                    currency: 'USD',
                }),
            });
            addResult(`/api/ledger/${ledgerData.id}/currency`, 'PATCH', updateCurrencyResult.status === 200 ? 'PASS' : 'FAIL',
                updateCurrencyResult.status === 200 ? 'Currency updated' : 'Failed to update currency');
        }
    } else {
        console.log('\n⚠️  Skipping authenticated tests - no session available');
    }

    // ============================================================================
    // PRINT RESULTS SUMMARY
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(80) + '\n');

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;
    const total = results.length;

    // Print each result
    for (const result of results) {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
        const statusCol = result.status === 'PASS' ? '\x1b[32m' : result.status === 'FAIL' ? '\x1b[31m' : '\x1b[33m';
        const resetCol = '\x1b[0m';
        const time = result.responseTime > 0 ? `(${result.responseTime}ms)` : '';

        console.log(`${icon} ${result.method.padEnd(6)} ${result.endpoint.padEnd(40)} ${statusCol}${result.status}${resetCol} ${time}`);
        if (result.message && result.status !== 'PASS') {
            console.log(`         ${result.message}`);
        }
    }

    console.log('\n' + '-'.repeat(80));
    console.log(`\n📈 TOTALS: ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)`);

    const successRate = ((passed / (total - skipped)) * 100).toFixed(1);
    console.log(`📊 Success Rate: ${successRate}%\n`);

    if (failed > 0) {
        console.log('❌ SOME TESTS FAILED');
        process.exit(1);
    } else {
        console.log('✅ ALL TESTS PASSED');
        process.exit(0);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});
