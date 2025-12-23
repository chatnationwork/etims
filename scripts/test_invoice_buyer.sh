#!/bin/bash

BASE_URL="https://kratest.pesaflow.com/api/ussd/post-sale"
PHONE="254745050238"

echo "=== Test 1: Standard Request ==="
curl -s -X POST "$BASE_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: triple_2_ussd' \
  -d "{\"msisdn\":\"$PHONE\",\"total_amount\":10,\"items\":[{\"item_name\":\"TestItem\",\"taxable_amount\":10,\"quantity\":1}]}" \
  | jq .

echo -e "\n=== Test 2: With buyer_name and buyer_pin ==="
curl -s -X POST "$BASE_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: triple_2_ussd' \
  -d "{\"msisdn\":\"$PHONE\",\"total_amount\":10,\"buyer_name\":\"Test Buyer\",\"buyer_pin\":\"P000000000A\",\"items\":[{\"item_name\":\"TestItem\",\"taxable_amount\":10,\"quantity\":1}]}" \
  | jq .

echo -e "\n=== Test 3: With buyer_details object ==="
curl -s -X POST "$BASE_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: triple_2_ussd' \
  -d "{\"msisdn\":\"$PHONE\",\"total_amount\":10,\"buyer_details\":{\"name\":\"Test Buyer\",\"pin\":\"P000000000A\"},\"items\":[{\"item_name\":\"TestItem\",\"taxable_amount\":10,\"quantity\":1}]}" \
  | jq .

echo -e "\n=== Test 4: With customer_name and customer_pin ==="
curl -s -X POST "$BASE_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: triple_2_ussd' \
  -d "{\"msisdn\":\"$PHONE\",\"total_amount\":10,\"customer_name\":\"Test Buyer\",\"customer_pin\":\"P000000000A\",\"items\":[{\"item_name\":\"TestItem\",\"taxable_amount\":10,\"quantity\":1}]}" \
  | jq .
