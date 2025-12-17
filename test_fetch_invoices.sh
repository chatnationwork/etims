#!/bin/bash

# Summary test - just show counts for each combination
BASE_URL="https://kratest.pesaflow.com/api/ussd/buyer-initiated/fetch"
HEADER="x-forwarded-for: triple_2_ussd"
PHONE="254745050238"

echo "=========================================="
echo "SUMMARY: Fetch Invoices by Status + Actor"
echo "Phone: $PHONE"
echo "=========================================="
echo ""
echo "| Status            | Actor    | Count |"
echo "|-------------------|----------|-------|"

for status in "pending" "accepted" "rejected" "awaiting_approval"; do
  for actor in "buyer" "supplier"; do
    URL="${BASE_URL}/${PHONE}?page=1&page_size=10&status=${status}&actor=${actor}&source=whatsapp"
    response=$(curl -s --location "$URL" --header "$HEADER")
    count=$(echo "$response" | jq '.invoices.total_entries // 0' 2>/dev/null)
    printf "| %-17s | %-8s | %5s |\n" "$status" "$actor" "$count"
  done
done

echo ""
echo "=========================================="
echo "KEY FINDINGS:"
echo "=========================================="
echo ""
echo "The 'actor' parameter filters invoices by the user's role:"
echo "  - actor=buyer   → Invoices where the user is the BUYER"
echo "  - actor=supplier → Invoices where the user is the SUPPLIER/SELLER"
echo ""
echo "Combined with 'status' you can filter by:"
echo "  - pending           → Invoices awaiting any action"
echo "  - accepted          → Approved/accepted invoices"
echo "  - rejected          → Rejected invoices"  
echo "  - awaiting_approval → Invoices awaiting approval"
