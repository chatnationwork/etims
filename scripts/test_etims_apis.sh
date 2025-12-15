#!/bin/bash

# eTIMS API Test Script
# Tests all eTIMS endpoints and reports on infrastructure errors vs business logic errors
# Run: bash scripts/test_etims_apis.sh

BASE_URL="https://kratest.pesaflow.com/api/ussd"

# Test phone number - should be a valid format
TEST_PHONE="254745050238"
# Test PIN - valid format
TEST_PIN="A012345678Z"
# Test Invoice Number
TEST_INVOICE="INV-TEST-001"

echo ""
echo "=================================================="
echo "  eTIMS API Infrastructure Test"
echo "  Base URL: $BASE_URL"
echo "  Time: $(date)"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
declare -A RESULTS

test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_codes="$5"  # Codes that indicate API is working (even if business logic fails)
    
    echo -n "Testing: $name... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "x-forwarded-for: triple_2_ussd" \
            --max-time 30)
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "x-forwarded-for: triple_2_ussd" \
            -d "$data" \
            --max-time 30)
    fi
    
    # Extract status code (last line) and body
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')
    
    # Determine result
    if [ -z "$http_code" ] || [ "$http_code" == "000" ]; then
        echo -e "${RED}NETWORK ERROR${NC} - Connection failed"
        RESULTS["$name"]="NETWORK_ERROR"
        echo "  curl -X $method \"$BASE_URL$endpoint\" -H \"Content-Type: application/json\" -d '$data'"
    elif [ "$http_code" == "401" ] || [ "$http_code" == "403" ]; then
        echo -e "${RED}AUTH ERROR${NC} - HTTP $http_code"
        RESULTS["$name"]="AUTH_ERROR:$http_code"
        echo "  Response: $body"
        echo "  curl -X $method \"$BASE_URL$endpoint\" -H \"Content-Type: application/json\" -d '$data'"
    elif [ "$http_code" == "500" ] || [ "$http_code" == "502" ] || [ "$http_code" == "503" ] || [ "$http_code" == "504" ]; then
        echo -e "${RED}SERVER ERROR${NC} - HTTP $http_code"
        RESULTS["$name"]="SERVER_ERROR:$http_code"
        echo "  Response: ${body:0:200}..."
        echo "  curl -X $method \"$BASE_URL$endpoint\" -H \"Content-Type: application/json\" -d '$data'"
    elif [ "$http_code" == "404" ]; then
        echo -e "${YELLOW}NOT FOUND${NC} - HTTP 404 (endpoint may not exist)"
        RESULTS["$name"]="NOT_FOUND:404"
        echo "  curl -X $method \"$BASE_URL$endpoint\" -H \"Content-Type: application/json\" -d '$data'"
    elif [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
        echo -e "${GREEN}OK${NC} - HTTP $http_code"
        RESULTS["$name"]="OK:$http_code"
        # Show brief response
        echo "  Response: ${body:0:100}..."
    else
        echo -e "${YELLOW}OTHER${NC} - HTTP $http_code"
        RESULTS["$name"]="OTHER:$http_code"
        echo "  Response: ${body:0:200}..."
    fi
    echo ""
}

echo "=== 1. Customer Lookup (PIN/ID) ==="
test_api "Buyer Lookup (PIN)" "POST" "/buyer-initiated/lookup" \
    '{"pin_or_id":"A012345678Z"}' "200"

echo ""
echo "=== 2. Sales Invoice ==="
test_api "Post Sale" "POST" "/post-sale" \
    "{\"msisdn\":\"$TEST_PHONE\",\"total_amount\":1000,\"items\":[{\"item_name\":\"Test Item\",\"taxable_amount\":1000,\"quantity\":1}]}" "200"

echo ""
echo "=== 3. Buyer Initiated Invoice ==="
test_api "Fetch Buyer Invoices" "GET" "/buyer-initiated/fetch/$TEST_PHONE" "" "200"

test_api "Submit Buyer Initiated Invoice" "POST" "/buyer-initiated/submit" \
    "{\"msisdn\":\"$TEST_PHONE\",\"buyer_name\":\"Test Buyer\",\"buyer_pin\":\"A012345678Z\",\"items\":[{\"item_name\":\"Test\",\"unit_price\":500,\"quantity\":2}],\"total_amount\":1000}" "200"

test_api "Accept Buyer Invoice" "POST" "/buyer-initiated/process" \
    "{\"msisdn\":\"$TEST_PHONE\",\"invoice_ref\":\"TEST-INV-001\",\"action\":\"accept\"}" "200"

echo ""
echo "=== 4. Credit Note ==="
test_api "Search Invoice for Credit Note" "POST" "/credit-note/search" \
    "{\"msisdn\":\"$TEST_PHONE\",\"invoice_no\":\"$TEST_INVOICE\"}" "200"

test_api "Submit Credit Note" "POST" "/credit-note/submit" \
    "{\"msisdn\":\"$TEST_PHONE\",\"invoice_id\":\"TEST-123\",\"invoice_no\":\"$TEST_INVOICE\",\"reason\":\"Damaged goods\",\"items\":[{\"item_name\":\"Test\",\"quantity\":1,\"unit_price\":500}],\"total_amount\":500}" "200"

echo ""
echo "=================================================="
echo "  SUMMARY REPORT"
echo "=================================================="
echo ""

# Categorize results
server_errors=()
auth_errors=()
network_errors=()
not_found=()
working=()

for key in "${!RESULTS[@]}"; do
    value="${RESULTS[$key]}"
    if [[ "$value" == SERVER_ERROR* ]]; then
        server_errors+=("$key: $value")
    elif [[ "$value" == AUTH_ERROR* ]]; then
        auth_errors+=("$key: $value")
    elif [[ "$value" == NETWORK_ERROR* ]]; then
        network_errors+=("$key: $value")
    elif [[ "$value" == NOT_FOUND* ]]; then
        not_found+=("$key: $value")
    elif [[ "$value" == OK* ]]; then
        working+=("$key: $value")
    fi
done

echo -e "${GREEN}✓ WORKING APIs (${#working[@]}):${NC}"
for item in "${working[@]}"; do
    echo "  - $item"
done
echo ""

if [ ${#server_errors[@]} -gt 0 ]; then
    echo -e "${RED}✗ SERVER ERRORS (${#server_errors[@]}):${NC}"
    for item in "${server_errors[@]}"; do
        echo "  - $item"
    done
    echo ""
fi

if [ ${#auth_errors[@]} -gt 0 ]; then
    echo -e "${RED}✗ AUTH ERRORS (${#auth_errors[@]}):${NC}"
    for item in "${auth_errors[@]}"; do
        echo "  - $item"
    done
    echo ""
fi

if [ ${#network_errors[@]} -gt 0 ]; then
    echo -e "${RED}✗ NETWORK ERRORS (${#network_errors[@]}):${NC}"
    for item in "${network_errors[@]}"; do
        echo "  - $item"
    done
    echo ""
fi

if [ ${#not_found[@]} -gt 0 ]; then
    echo -e "${YELLOW}? NOT FOUND (${#not_found[@]}):${NC}"
    for item in "${not_found[@]}"; do
        echo "  - $item"
    done
    echo ""
fi

echo "=================================================="
echo "  Test completed at $(date)"
echo "=================================================="
