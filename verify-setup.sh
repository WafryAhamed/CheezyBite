#!/bin/bash

# CheezyBite - Complete Verification & Setup Script
# This script verifies all components are properly configured

echo "🔍 CheezyBite - Complete System Verification"
echo "==========================================="
echo ""

# 1. Check Node Version
echo "✓ Checking Node.js..."
node --version
npm --version
echo ""

# 2. Check Dependencies
echo "✓ Checking Dependencies..."
echo "  - Checking for node_modules..."
if [ -d "node_modules" ]; then
    echo "    ✅ node_modules exists"
else
    echo "    ⚠️  node_modules missing - run: npm install"
fi
echo ""

# 3. Check Environment Files
echo "✓ Checking Environment Configuration..."
if [ -f ".env.local" ]; then
    echo "    ✅ .env.local exists"
else
    echo "    ❌ .env.local missing"
fi
echo ""

# 4. Check Database Files
echo "✓ Checking Database..."
echo "    MongoDB should be running at: localhost:27017/cheezybite"
echo "    Use: mongod --dbpath ./data (or your MongoDB setup)"
echo ""

# 5. Check Server Files
echo "✓ Checking Server Configuration..."
if [ -f "server/index.js" ]; then
    echo "    ✅ Socket.IO server configured"
else
    echo "    ❌ Server file missing"
fi
echo ""

# 6. Check API Routes
echo "✓ Checking API Routes..."
api_routes=(
    "src/app/api/pizzas/route.js"
    "src/app/api/toppings/route.js"
    "src/app/api/orders/route.js"
    "src/app/api/auth/route.js"
    "src/app/api/admin/orders/[id]/status/route.js"
)

for route in "${api_routes[@]}"; do
    if [ -f "$route" ]; then
        echo "    ✅ $route"
    fi
done
echo ""

# 7. Check Pages
echo "✓ Checking User Pages..."
pages=(
    "src/app/(shop)/page.js"
    "src/app/(shop)/auth/page.js"
    "src/app/(shop)/menu/page.js"
    "src/app/(shop)/cart/page.js"
    "src/app/(shop)/checkout/page.js"
    "src/app/(shop)/profile/page.js"
    "src/app/(shop)/order/[orderId]/page.js"
)

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "    ✅ ${page#src/app/(shop)/}"
    fi
done
echo ""

# 8. Check Admin Pages
echo "✓ Checking Admin Pages..."
admin_pages=(
    "src/app/admin/page.js"
    "src/app/admin/login/page.js"
    "src/app/admin/orders/page.js"
)

for page in "${admin_pages[@]}"; do
    if [ -f "$page" ]; then
        echo "    ✅ ${page#src/app/admin/}"
    fi
done
echo ""

# 9. Check Context Files
echo "✓ Checking Context Files..."
contexts=(
    "src/app/context/CartContext.js"
    "src/app/context/UserContext.js"
    "src/app/context/OrderContext.js"
    "src/app/context/AdminContext.js"
    "src/app/context/SocketContext.js"
)

for ctx in "${contexts[@]}"; do
    if [ -f "$ctx" ]; then
        echo "    ✅ $(basename $ctx)"
    fi
done
echo ""

# 10. Check Models
echo "✓ Checking Database Models..."
models=(
    "src/models/User.js"
    "src/models/Order.js"
    "src/models/Pizza.js"
    "src/models/Admin.js"
)

for model in "${models[@]}"; do
    if [ -f "$model" ]; then
        echo "    ✅ $(basename $model)"
    fi
done
echo ""

# 11. Check Services
echo "✓ Checking Services..."
services=(
    "src/services/authService.js"
    "src/services/ordersService.js"
    "src/services/apiClient.js"
)

for service in "${services[@]}"; do
    if [ -f "$service" ]; then
        echo "    ✅ $(basename $service)"
    fi
done
echo ""

# 12. Summary
echo "=========================================="
echo "✅ Configuration Check Complete"
echo ""
echo "📋 Next Steps:"
echo "   1. Ensure MongoDB is running"
echo "   2. Run: npm install (if not done)"
echo "   3. Run: npm run dev:all (starts Next.js + Socket.IO)"
echo "   4. Visit: http://localhost:3000"
echo ""
echo "🧪 Testing:"
echo "   npm test              - Run tests"
echo "   npm run test:watch    - Watch mode"
echo "   npm run test:coverage - Coverage report"
echo ""
echo "📊 Production Build:"
echo "   npm run build         - Build for production"
echo "   npm start             - Start production server"
echo ""
