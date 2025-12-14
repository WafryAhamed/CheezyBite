# CheezyBite API Testing Guide

## Postman Collection

Import this collection into Postman for easy testing.

### Environment Variables
Create a Postman environment with:
```
base_url: http://localhost:3000/api
user_token: (will be set after login)
admin_token: (will be set after admin login)
```

---

## Authentication Endpoints

### 1. User Registration
```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "test123",
  "name": "Test Customer",
  "phone": "+94 77 123 4567"
}
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "...",
      "email": "customer@test.com",
      "name": "Test Customer",
      "phone": "+94 77 123 4567",
      "addresses": []
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. User Login
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "test123"
}
```

**Save token from response to `user_token` variable**

### 3. Get Current User
```http
GET {{base_url}}/auth/me
Authorization: Bearer {{user_token}}
```

### 4. Admin Login
```http
POST {{base_url}}/admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123"
}
```

**Save token from response to `admin_token` variable**

---

## Product Endpoints

### Get All Pizzas (Customer)
```http
GET {{base_url}}/pizzas
```

**Expected**: Array of enabled pizzas only

### Get All Toppings (Customer)
```http
GET {{base_url}}/toppings
```

**Expected**: Array of enabled toppings only

---

## Order Endpoints

### Create Order
```http
POST {{base_url}}/orders
Authorization: Bearer {{user_token}}
Content-Type: application/json

{
  "items": [
    {
      "cartLineId": "item-1",
      "id": "1",
      "name": "Fire Grilled Chicken",
      "image": "/pizzas/chicken-variety/fire-grilled-chicken.png",
      "size": "medium",
      "crust": "thin",
      "price": 1400,
      "amount": 1,
      "additionalTopping": [
        {
          "id": 1,
          "name": "mozzarella",
          "price": 200
        }
      ]
    }
  ],
  "total": 1400,
  "address": {
    "id": "addr-1",
    "label": "Home",
    "street": "123 Galle Road",
    "city": "Colombo",
    "phone": "+94771234567"
  },
  "paymentMethod": "cash",
  "deliveryTime": "asap",
  "deliveryInstructions": "Ring the bell twice"
}
```

### Get User Orders
```http
GET {{base_url}}/orders
Authorization: Bearer {{user_token}}
```

### Get Single Order
```http
GET {{base_url}}/orders/ORD-1734189123456
Authorization: Bearer {{user_token}}
```

### Cancel Order
```http
POST {{base_url}}/orders/ORD-1734189123456
Authorization: Bearer {{user_token}}
```

---

## Admin Endpoints

### Get All Pizzas (Admin)
```http
GET {{base_url}}/admin/pizzas
Authorization: Bearer {{admin_token}}
```

**Expected**: All pizzas including disabled ones

### Create Pizza
```http
POST {{base_url}}/admin/pizzas
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "name": "Test Pizza",
  "description": "Test pizza description here",
  "image": "/pizzas/test.png",
  "priceSm": 1000,
  "priceMd": 1500,
  "priceLg": 2000,
  "category": "Special",
  "tags": ["new", "spicy"],
  "enabled": true
}
```

### Update Pizza
```http
PUT {{base_url}}/admin/pizzas/1
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "name": "Updated Pizza Name",
  "priceSm": 1100
}
```

### Delete Pizza
```http
DELETE {{base_url}}/admin/pizzas/1
Authorization: Bearer {{admin_token}}
```

### Toggle Pizza Status
```http
PATCH {{base_url}}/admin/pizzas/1
Authorization: Bearer {{admin_token}}
```

### Get All Toppings (Admin)
```http
GET {{base_url}}/admin/toppings
Authorization: Bearer {{admin_token}}
```

### Create Topping
```http
POST {{base_url}}/admin/toppings
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "name": "pepperoni",
  "price": 180,
  "type": "meat",
  "enabled": true
}
```

### Update Topping
```http
PUT {{base_url}}/admin/toppings/1
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "name": "fresh mozzarella",
  "price": 220
}
```

### Delete Topping
```http
DELETE {{base_url}}/admin/toppings/1
Authorization: Bearer {{admin_token}}
```

### Toggle Topping Status
```http
PATCH {{base_url}}/admin/toppings/1
Authorization: Bearer {{admin_token}}
```

### Get All Orders (Admin)
```http
GET {{base_url}}/admin/orders
Authorization: Bearer {{admin_token}}
```

### Update Order Status
```http
PATCH {{base_url}}/admin/orders/ORD-123/status
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "currentStage": 1
}
```

**Valid stages**:
- 0: Order Placed
- 1: Preparing
- 2: Baking
- 3: Out for Delivery
- 4: Delivered
- -1: Cancelled

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": "Valid email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Testing Workflow

### 1. Setup
```bash
# Start servers
npm run dev:all

# In MongoDB shell, verify data
mongosh
use cheezybite
db.pizzas.countDocuments()  # Should show 25
db.toppings.countDocuments()  # Should show 8
```

### 2. Test User Flow
1. Register new user
2. Login and save token
3. Get current user profile
4. Browse pizzas
5. Browse toppings
6. Create order
7. View order history
8. Cancel order (if stage 0)

### 3. Test Admin Flow
1. Admin login
2. View all pizzas (including disabled)
3. Create new pizza
4. Update pizza
5. Toggle pizza status
6. Delete pizza
7. Same for toppings
8. View all orders
9. Update order status

### 4. Test Error Handling
1. Try accessing protected routes without token → 401
2. Try admin routes with user token → 403
3. Try invalid email format → 422
4. Try cancelling order at stage 2 → 400
5. Try accessing non-existent order → 404

---

## Socket.IO Testing

Use Socket.IO client or browser console:

```javascript
// Connect to Socket.IO server
const socket = io('http://localhost:4000');

// Customer: Track order
socket.emit('order:track', { orderId: 'ORD-123' });

socket.on('order:update', (data) => {
  console.log('Order updated:', data);
});

// Admin: Subscribe to dashboard
socket.emit('admin:subscribe');

socket.on('order:created', (data) => {
  console.log('New order:', data);
});

socket.on('order:statusChanged', (data) => {
  console.log('Status changed:', data);
});
```

---

## Performance Testing

### Load Test with Apache Bench

```bash
# Test health endpoint
ab -n 1000 -c 10 http://localhost:3000/api/health

# Test get pizzas
ab -n 500 -c 5 http://localhost:3000/api/pizzas
```

### Expected Results
- Health check: < 100ms avg
- Get pizzas: < 200ms avg
- Create order: < 500ms avg

---

## MongoDB Queries for Testing

```javascript
// In mongosh

// View all users
db.users.find().pretty()

// View all orders
db.orders.find().pretty()

// Count orders by status
db.orders.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Get orders with high totals
db.orders.find({ total: { $gt: 3000 } }).pretty()

// Find user by email
db.users.findOne({ email: "test@cheezybite.lk" })

// Delete test orders
db.orders.deleteMany({ id: /^ORD-/ })
```
