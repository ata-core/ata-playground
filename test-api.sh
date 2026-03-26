#!/bin/bash
# Quick API test script

URL="http://localhost:3000"

echo "=== Health ==="
curl -s $URL/health | jq .

echo ""
echo "=== Create User (valid) ==="
curl -s -X POST $URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Mert","email":"mert@example.com","age":"26"}' | jq .

echo ""
echo "=== Create User (invalid - missing email) ==="
curl -s -X POST $URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Mert"}' | jq .

echo ""
echo "=== Create User (coerceTypes - age as string) ==="
curl -s -X POST $URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","age":"30"}' | jq .

echo ""
echo "=== Create User (removeAdditional - extra fields stripped) ==="
curl -s -X POST $URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","hack":"evil","secret":"password"}' | jq .

echo ""
echo "=== Create User (defaults applied) ==="
curl -s -X POST $URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com"}' | jq .

echo ""
echo "=== Create Product ==="
curl -s -X POST $URL/api/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Keyboard","price":99.99,"tags":["tech","input"]}' | jq .

echo ""
echo "=== Search ==="
curl -s -X POST $URL/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"json validator"}' | jq .

echo ""
echo "=== Create Order ==="
curl -s -X POST $URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"items":[{"productId":42,"quantity":2}],"coupon":"SAVE20"}' | jq .

echo ""
echo "=== Login ==="
curl -s -X POST $URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mert@example.com","password":"12345678"}' | jq .

echo ""
echo "=== Invalid Order (bad coupon pattern) ==="
curl -s -X POST $URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"items":[{"productId":1,"quantity":1}],"coupon":"bad"}' | jq .
