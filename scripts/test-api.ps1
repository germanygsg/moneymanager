# API Test Script for Money Manager
# Tests all API endpoints

$BaseUrl = "http://localhost:3000"

function Write-TestResult {
    param($Endpoint, $Method, $Status, $Message)
    $icon = if ($Status -eq "PASS") { "[PASS]" } elseif ($Status -eq "FAIL") { "[FAIL]" } else { "[SKIP]" }
    Write-Host "$icon $Method $Endpoint - $Message"
}

Write-Host ""
Write-Host "========================================"
Write-Host "MONEY MANAGER API TEST SUITE"
Write-Host "========================================"
Write-Host ""

$passed = 0
$failed = 0
$skipped = 0

# =====================
# TEST 1: Signup Validation
# =====================
Write-Host ""
Write-Host "TESTING AUTH ENDPOINTS"
Write-Host ""

# Test signup with missing fields
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/auth/signup" -Method POST -ContentType "application/json" -Body '{}' -ErrorAction Stop
    Write-TestResult "/api/auth/signup" "POST" "FAIL" "Should have returned error"
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult "/api/auth/signup" "POST" "PASS" "Returns 400 for missing fields"
        $passed++
    } else {
        Write-TestResult "/api/auth/signup" "POST" "FAIL" "Unexpected error"
        $failed++
    }
}

# Test signup with short username
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/auth/signup" -Method POST -ContentType "application/json" -Body '{"username":"ab","password":"password123"}' -ErrorAction Stop
    Write-TestResult "/api/auth/signup" "POST" "FAIL" "Should have returned error for short username"
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult "/api/auth/signup" "POST" "PASS" "Returns 400 for short username"
        $passed++
    } else {
        Write-TestResult "/api/auth/signup" "POST" "FAIL" "Unexpected error"
        $failed++
    }
}

# Test signup with short password
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/auth/signup" -Method POST -ContentType "application/json" -Body '{"username":"testuser","password":"12345"}' -ErrorAction Stop
    Write-TestResult "/api/auth/signup" "POST" "FAIL" "Should have returned error for short password"
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult "/api/auth/signup" "POST" "PASS" "Returns 400 for short password"
        $passed++
    } else {
        Write-TestResult "/api/auth/signup" "POST" "FAIL" "Unexpected error"
        $failed++
    }
}

# Test successful signup
$testUser = "testuser_" + (Get-Date -Format 'yyyyMMddHHmmss')
$signupBody = @{username=$testUser; password="password123"} | ConvertTo-Json
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/auth/signup" -Method POST -ContentType "application/json" -Body $signupBody -ErrorAction Stop
    if ($result.userId) {
        Write-TestResult "/api/auth/signup" "POST" "PASS" "Created user $testUser"
        $passed++
    } else {
        Write-TestResult "/api/auth/signup" "POST" "FAIL" "No userId in response"
        $failed++
    }
} catch {
    Write-TestResult "/api/auth/signup" "POST" "FAIL" "Error creating user"
    $failed++
}

# =====================
# TEST 2: Protected Endpoints Without Auth
# =====================
Write-Host ""
Write-Host "TESTING PROTECTED ENDPOINTS WITHOUT AUTH"
Write-Host ""

$protectedEndpoints = @(
    @{Method="GET"; Endpoint="/api/categories"},
    @{Method="POST"; Endpoint="/api/categories"},
    @{Method="GET"; Endpoint="/api/transactions"},
    @{Method="POST"; Endpoint="/api/transactions"},
    @{Method="GET"; Endpoint="/api/ledgers"},
    @{Method="POST"; Endpoint="/api/ledgers"},
    @{Method="GET"; Endpoint="/api/user/ledger"},
    @{Method="GET"; Endpoint="/api/user/preferences"},
    @{Method="PATCH"; Endpoint="/api/user/preferences"},
    @{Method="GET"; Endpoint="/api/ledger/invite"},
    @{Method="POST"; Endpoint="/api/ledger/invite"},
    @{Method="GET"; Endpoint="/api/receipts/stats"}
)

foreach ($ep in $protectedEndpoints) {
    try {
        $params = @{
            Uri = "$BaseUrl$($ep.Endpoint)"
            Method = $ep.Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        if ($ep.Method -in @("POST", "PATCH")) {
            $params.Body = "{}"
        }
        $result = Invoke-RestMethod @params
        Write-TestResult $ep.Endpoint $ep.Method "FAIL" "Should have returned 401"
        $failed++
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 401) {
            Write-TestResult $ep.Endpoint $ep.Method "PASS" "Returns 401 when not authenticated"
            $passed++
        } else {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-TestResult $ep.Endpoint $ep.Method "FAIL" "Expected 401, got $statusCode"
            $failed++
        }
    }
}

# =====================
# TEST 3: NextAuth Endpoints
# =====================
Write-Host ""
Write-Host "TESTING NEXT-AUTH ENDPOINTS"
Write-Host ""

# Test session endpoint
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/auth/session" -Method GET -ErrorAction Stop
    Write-TestResult "/api/auth/session" "GET" "PASS" "Session endpoint works"
    $passed++
} catch {
    Write-TestResult "/api/auth/session" "GET" "FAIL" "Session endpoint failed"
    $failed++
}

# Test providers endpoint
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/auth/providers" -Method GET -ErrorAction Stop
    if ($result) {
        Write-TestResult "/api/auth/providers" "GET" "PASS" "Providers endpoint works"
        $passed++
    } else {
        Write-TestResult "/api/auth/providers" "GET" "FAIL" "Empty response"
        $failed++
    }
} catch {
    Write-TestResult "/api/auth/providers" "GET" "FAIL" "Providers endpoint failed"
    $failed++
}

# Test CSRF endpoint
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/auth/csrf" -Method GET -ErrorAction Stop
    if ($result.csrfToken) {
        Write-TestResult "/api/auth/csrf" "GET" "PASS" "CSRF token received"
        $passed++
    } else {
        Write-TestResult "/api/auth/csrf" "GET" "FAIL" "No CSRF token"
        $failed++
    }
} catch {
    Write-TestResult "/api/auth/csrf" "GET" "FAIL" "CSRF endpoint failed"
    $failed++
}

# =====================
# SUMMARY
# =====================
Write-Host ""
Write-Host "========================================"
Write-Host "TEST RESULTS SUMMARY"
Write-Host "========================================"
Write-Host ""

$total = $passed + $failed + $skipped
$successRate = 0
if (($total - $skipped) -gt 0) { 
    $successRate = [math]::Round(($passed / ($total - $skipped)) * 100, 1) 
}

Write-Host "TOTALS: $passed passed, $failed failed, $skipped skipped ($total total)"
Write-Host "Success Rate: $successRate%"
Write-Host ""

if ($failed -gt 0) {
    Write-Host "SOME TESTS FAILED"
    exit 1
} else {
    Write-Host "ALL TESTS PASSED"
    exit 0
}
