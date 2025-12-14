# CheezyBite - Full-Stack Pizza Ordering Application

> **Modern Next.js 16 pizza ordering app with MongoDB backend, real-time order tracking, and admin dashboard**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone & Install**
```bash
cd cheezybite
npm install
```

2. **Setup Environment**
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your MongoDB URI
```

3. **Install & Start MongoDB** (Local Setup)
```powershell
# Windows (using Chocolatey)
choco install mongodb

# Start MongoDB service
net start MongoDB

# Or using MongoDB Compass (GUI)
# Download: https://www.mongodb.com/try/download/compass
```

4. **Seed Database**
```bash
npm run seed
```

This creates:
- 2 admin users (`admin/Admin@123`, `manager/Manager@123`)
- 25 pizzas
- 8 toppings
- 1 test user (`test@cheezybite.lk/test123`)

5. **Start Development Servers**
```bash
# Option 1: Run both servers concurrently
npm run dev:all

# Option 2: Run separately
# Terminal 1: Next.js
npm run dev

# Terminal 2: Socket.IO server
npm run server
```

6. **Open Application**
- Frontend: http://localhost:3000
- API Health: http://localhost:3000/api/health
- Socket.IO: http://localhost:4000

---

## 📁 Project Structure

```
cheezybite/
├── src/
│   ├── app/
│   │   ├── (shop)/              # Customer-facing pages
│   │   │   ├── menu/            # Pizza menu
│   │   │   ├── checkout/        # Checkout flow
│   │   │   ├── track/           # Order tracking
│   │   │   └── order/           # Order details
│   │   ├── admin/               # Admin dashboard
│   │   │   ├── pizzas/          # Pizza management
│   │   │   ├── toppings/        # Topping management
│   │   │   ├── orders/          # Order management
│   │   │   └── users/           # User management
│   │   ├── api/                 # Next.js API Routes
│   │   │   ├── auth/            # Authentication
│   │   │   ├── pizzas/          # Pizza CRUD
│   │   │   ├── toppings/        # Topping CRUD
│   │   │   ├── orders/          # Order management
│   │   │   └── admin/           # Admin operations
│   │   ├── context/             # React Context providers
│   │   └── components/          # Reusable components
│   ├── lib/                     # Utilities
│   │   ├── dbConnect.js         # MongoDB connection
│   │   ├── auth.js              # JWT & authentication
│   │   ├── validators.js        # Input validation
│   │   └── apiResponse.js       # Standard responses
│   └── models/                  # MongoDB models
│       ├── User.js
│       ├── Admin.js
│       ├── Pizza.js
│       ├── Topping.js
│       └── Order.js
├── server/
│   └── index.js                 # Express + Socket.IO server
├── scripts/
│   └── seedDatabase.js          # Database seeding
└── public/                      # Static assets
```

---

## 🔐 Authentication

### User Authentication
- **Registration**: Email + password (min 6 chars)
- **Login**: JWT tokens (7 day expiry)
- **Protected Routes**: Checkout, order tracking, profile

### Admin Authentication
- **Login**: Username + password
- **Roles**: Super Admin, Manager
- **Protected Routes**: All `/admin/*` pages

---

## 📡 API Endpoints

### Customer APIs

#### Authentication
```
POST   /api/auth/register        - User registration
POST   /api/auth/login           - User login
GET    /api/auth/me              - Get current user (requires auth)
```

#### Products
```
GET    /api/pizzas               - Get all enabled pizzas
GET    /api/toppings             - Get all enabled toppings
```

#### Orders
```
POST   /api/orders               - Create new order (requires auth)
GET    /api/orders               - Get user's orders (requires auth)
GET    /api/orders/:id           - Get single order (requires auth)
POST   /api/orders/:id           - Cancel order (requires auth)
```

### Admin APIs

#### Authentication
```
POST   /api/admin/auth/login     - Admin login
```

#### Pizza Management
```
GET    /api/admin/pizzas         - Get all pizzas + disabled (requires admin)
POST   /api/admin/pizzas         - Create pizza (requires admin)
PUT    /api/admin/pizzas/:id     - Update pizza (requires admin)
DELETE /api/admin/pizzas/:id     - Delete pizza (requires admin)
PATCH  /api/admin/pizzas/:id     - Toggle enabled (requires admin)
```

#### Topping Management
```
GET    /api/admin/toppings       - Get all toppings + disabled (requires admin)
POST   /api/admin/toppings       - Create topping (requires admin)
PUT    /api/admin/toppings/:id   - Update topping (requires admin)
DELETE /api/admin/toppings/:id   - Delete topping (requires admin)
PATCH  /api/admin/toppings/:id   - Toggle enabled (requires admin)
```

#### Order Management
```
GET    /api/admin/orders                  - Get all orders (requires admin)
PATCH  /api/admin/orders/:id/status       - Update order status (requires admin)
```

---

## 🔄 Real-Time Features (Socket.IO)

### Events

**Server → Client (Customer)**
```javascript
socket.on('order:update', (data) => {
  // Order status changed
  // { orderId, status, currentStage }
});

socket.on('order:delivered', (data) => {
  // Order delivered
  // { orderId, timestamp }
});
```

**Server → Client (Admin)**
```javascript
socket.on('order:created', (data) => {
  // New order received
  // { orderId, total, items, customerName }
});

socket.on('order:statusChanged', (data) => {
  // Order status updated
  // { orderId, status, currentStage }
});
```

**Client → Server**
```javascript
// Customer tracks order
socket.emit('order:track', { orderId: 'ORD-123' });

// Admin subscribes to dashboard
socket.emit('admin:subscribe');
```

---

## 🧪 Testing

### Manual Testing

**Health Check**
```bash
curl http://localhost:3000/api/health
```

**User Registration**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

**User Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Get Pizzas**
```bash
curl http://localhost:3000/api/pizzas
```

**Admin Login**
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Backend Mode (toggle API vs localStorage)
NEXT_PUBLIC_USE_API_BACKEND=false  # Set to true when ready

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/cheezybite

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# Socket.IO Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
SOCKET_IO_PORT=4000

# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 🚀 Deployment

### Production Build

```bash
# Build Next.js app
npm run build

# Start production server
npm start
```

### MongoDB Atlas (Production)

1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `.env.production`:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cheezybite
```

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy Socket.IO server separately (Railway, Heroku, etc.)

---

## 📝 NPM Scripts

```json
{
  "dev": "next dev",                    // Start Next.js dev server
  "build": "next build",                 // Build for production
  "start": "next start",                 // Start production server
  "lint": "next lint",                   // Run ESLint
  "server": "node server/index.js",      // Start Socket.IO server
  "seed": "node scripts/seedDatabase.js", // Seed MongoDB
  "dev:all": "concurrently npm:dev npm:server" // Run both servers
}
```

---

## 🎯 Features

### Customer Features
- ✅ Browse pizza menu with filtering
- ✅ Customize pizza (size, crust, toppings)
- ✅ Dynamic pricing with topping selection
- ✅ Shopping cart persistence
- ✅ Checkout with address management
- ✅ Multiple payment methods (Card, Cash, Wallet)
- ✅ Order tracking with real-time updates
- ✅ Order history
- ✅ User profile management
- ✅ Responsive design

### Admin Features
- ✅ Dashboard with KPIs and charts
- ✅ Pizza CRUD operations
- ✅ Topping CRUD operations
- ✅ Order management
- ✅ Order status updates
- ✅ User management
- ✅ Real-time order notifications
- ✅ Analytics and reporting

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Real-time**: Socket.IO
- **State Management**: React Context API
- **UI Components**: Headless UI, Lucide Icons, Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form (implicit via validation)

---

## 📄 License

MIT License - CheezyBite © 2025

---

## 🆘 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
Get-Service MongoDB

# Start MongoDB
net start MongoDB

# Check connection string in .env.local
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 4000
npx kill-port 4000
```

### Seed Script Fails
```bash
# Drop database and re-seed
# In MongoDB shell (mongosh):
use cheezybite
db.dropDatabase()

# Then re-run seed
npm run seed
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

This is a demo project for learning purposes.

---

## 📧 Support

For issues and questions, please open an issue on GitHub.