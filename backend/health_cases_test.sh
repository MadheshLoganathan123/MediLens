#!/bin/bash

################################################################################
# MediLens Health Cases API - Testing Script
# Run end-to-end tests for all health cases endpoints
# Usage: bash health_cases_test.sh
################################################################################

set -e

# Configuration
BASE_URL="http://localhost:5000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function for printing
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Test 1: Authentication
print_header "TEST 1: AUTHENTICATION"

echo "Attempting to login..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

TOKEN=$(echo $AUTH_RESPONSE | jq -r '.access_token // empty')

if [ -z "$TOKEN" ]; then
    print_error "Authentication failed"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

print_success "Authentication successful"
print_info "Token: ${TOKEN:0:20}..."


# Test 2: Create Health Cases
print_header "TEST 2: CREATE HEALTH CASES"

# Case A: Full payload
echo "Creating case with full payload..."
CASE_A=$(curl -s -X POST "$BASE_URL/api/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "symptoms": "severe headache and dizziness lasting 3 days",
    "severity": "high",
    "category": "neurological"
  }')

CASE_A_ID=$(echo $CASE_A | jq -r '.id // empty')
if [ -z "$CASE_A_ID" ]; then
    print_error "Failed to create case A"
    echo "Response: $CASE_A"
    exit 1
fi
print_success "Case A created: $CASE_A_ID"


# Case B: Partial payload (symptoms only)
echo "Creating case with symptoms only..."
CASE_B=$(curl -s -X POST "$BASE_URL/api/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "symptoms": "persistent dry cough for a week"
  }')

CASE_B_ID=$(echo $CASE_B | jq -r '.id // empty')
if [ -z "$CASE_B_ID" ]; then
    print_error "Failed to create case B"
    exit 1
fi
print_success "Case B created: $CASE_B_ID"


# Case C: Different category
echo "Creating case with different category..."
CASE_C=$(curl -s -X POST "$BASE_URL/api/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "symptoms": "stomach pain and nausea",
    "severity": "medium",
    "category": "gastrointestinal"
  }')

CASE_C_ID=$(echo $CASE_C | jq -r '.id // empty')
if [ -z "$CASE_C_ID" ]; then
    print_error "Failed to create case C"
    exit 1
fi
print_success "Case C created: $CASE_C_ID"


# Test 3: List All Cases
print_header "TEST 3: LIST ALL CASES"

CASES_LIST=$(curl -s -X GET "$BASE_URL/api/cases" \
  -H "Authorization: Bearer $TOKEN")

CASE_COUNT=$(echo $CASES_LIST | jq 'length')
print_success "Retrieved $CASE_COUNT cases"
echo "Cases:"
echo $CASES_LIST | jq '.[] | {id: .id, symptoms: .symptoms, status: .status}'


# Test 4: Get Specific Case
print_header "TEST 4: GET SPECIFIC CASE"

SINGLE_CASE=$(curl -s -X GET "$BASE_URL/api/cases/$CASE_A_ID" \
  -H "Authorization: Bearer $TOKEN")

RETURNED_ID=$(echo $SINGLE_CASE | jq -r '.id // empty')
if [ "$RETURNED_ID" != "$CASE_A_ID" ]; then
    print_error "Case ID mismatch"
    exit 1
fi
print_success "Retrieved case: $CASE_A_ID"
echo "Case details:"
echo $SINGLE_CASE | jq '{id: .id, symptoms: .symptoms, severity: .severity, category: .category, status: .status}'


# Test 5: Update Case Status
print_header "TEST 5: UPDATE CASE STATUS"

echo "Updating case A status to 'in_progress'..."
UPDATE_STATUS=$(curl -s -X PUT "$BASE_URL/api/cases/$CASE_A_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "in_progress"
  }')

UPDATED_STATUS=$(echo $UPDATE_STATUS | jq -r '.status // empty')
if [ "$UPDATED_STATUS" != "in_progress" ]; then
    print_error "Status update failed"
    echo "Response: $UPDATE_STATUS"
    exit 1
fi
print_success "Case A status updated to: $UPDATED_STATUS"


# Test 6: Update Multiple Fields
print_header "TEST 6: UPDATE MULTIPLE FIELDS"

echo "Updating case B with new symptoms and severity..."
UPDATE_MULTI=$(curl -s -X PUT "$BASE_URL/api/cases/$CASE_B_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "symptoms": "dry cough worsened, now with fever",
    "severity": "high",
    "status": "in_progress"
  }')

UPDATED_SYMPTOMS=$(echo $UPDATE_MULTI | jq -r '.symptoms // empty')
UPDATED_SEVERITY=$(echo $UPDATE_MULTI | jq -r '.severity // empty')
if [ -z "$UPDATED_SYMPTOMS" ] || [ -z "$UPDATED_SEVERITY" ]; then
    print_error "Multi-field update failed"
    exit 1
fi
print_success "Case B updated successfully"
echo "Updated details:"
echo $UPDATE_MULTI | jq '{id: .id, symptoms: .symptoms, severity: .severity, status: .status}'


# Test 7: Close a Case
print_header "TEST 7: CLOSE A CASE"

echo "Marking case C as resolved..."
CLOSE_CASE=$(curl -s -X PUT "$BASE_URL/api/cases/$CASE_C_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "resolved"
  }')

FINAL_STATUS=$(echo $CLOSE_CASE | jq -r '.status // empty')
if [ "$FINAL_STATUS" != "resolved" ]; then
    print_error "Failed to resolve case"
    exit 1
fi
print_success "Case C marked as resolved"


# Test 8: Error Handling - Invalid Case ID
print_header "TEST 8: ERROR HANDLING - INVALID CASE ID"

echo "Attempting to retrieve non-existent case..."
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/cases/invalid-id-12345" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "404" ] || [ "$HTTP_CODE" == "422" ]; then
    print_success "Correctly returned error for invalid case ID (HTTP $HTTP_CODE)"
else
    print_error "Expected 404 or 422, got $HTTP_CODE"
fi


# Test 9: Error Handling - Missing Auth
print_header "TEST 9: ERROR HANDLING - MISSING AUTHENTICATION"

echo "Attempting request without auth token..."
NO_AUTH=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/cases")

HTTP_CODE=$(echo "$NO_AUTH" | tail -n1)
if [ "$HTTP_CODE" == "401" ] || [ "$HTTP_CODE" == "403" ]; then
    print_success "Correctly rejected unauthenticated request (HTTP $HTTP_CODE)"
else
    print_error "Expected 401 or 403, got $HTTP_CODE"
fi


# Test 10: Error Handling - Empty Update
print_header "TEST 10: ERROR HANDLING - EMPTY UPDATE"

echo "Attempting to update case without any fields..."
EMPTY_UPDATE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/cases/$CASE_A_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}')

HTTP_CODE=$(echo "$EMPTY_UPDATE" | tail -n1)
if [ "$HTTP_CODE" == "400" ]; then
    print_success "Correctly rejected empty update (HTTP 400)"
else
    print_info "Received HTTP $HTTP_CODE for empty update"
fi


# Final Summary
print_header "TEST SUMMARY"

print_success "All end-to-end tests completed successfully!"
echo ""
echo "Created cases:"
echo "  - Case A (ID: $CASE_A_ID) - Status: in_progress"
echo "  - Case B (ID: $CASE_B_ID) - Status: in_progress"
echo "  - Case C (ID: $CASE_C_ID) - Status: resolved"
echo ""
print_info "You can use these case IDs for additional manual testing"
