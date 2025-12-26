// Fix imports for Node.js execution (no webpack aliases)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Helper to handle both standard and relative imports if needed, 
// strictly pointing to src/lib/dbConnect.js relative to scripts/
const dbConnect = require('../src/lib/dbConnect').default || require('../src/lib/dbConnect');
const User = require('../src/models/User').default || require('../src/models/User');
const Admin = require('../src/models/Admin').default || require('../src/models/Admin');
const Pizza = require('../src/models/Pizza').default || require('../src/models/Pizza');
const Topping = require('../src/models/Topping').default || require('../src/models/Topping');
const Order = require('../src/models/Order').default || require('../src/models/Order');
const bcrypt = require('bcryptjs');

// Default Data (Inlined for script compatibility)
const DEFAULT_TOPPINGS = [
    { id: 1, name: 'cherry tomatoes', image: '/cherry.png?v=1.0.0', price: 150, enabled: true },
    { id: 2, name: 'corn', image: '/corn.png?v=1.0.0', price: 120, enabled: true },
    { id: 3, name: 'fresh tomatoes', image: '/fresh-tomatoes.png?v=1.0.0', price: 130, enabled: true },
    { id: 4, name: 'jalapeno', image: '/jalapeno.png?v=1.0.0', price: 140, enabled: true },
    { id: 5, name: 'parmesan', image: '/parmesan.png?v=1.0.0', price: 180, enabled: true },
    { id: 6, name: 'mozzarella', image: '/mozzarella.png?v=1.0.0', price: 200, enabled: true },
    { id: 7, name: 'mushrooms', image: '/mushrooms.png?v=1.0.0', price: 160, enabled: true },
    { id: 8, name: 'olives', image: '/olives.png?v=1.0.0', price: 150, enabled: true },
];

const DEFAULT_PIZZAS = [
    { id: 1, name: 'Fire Grilled Chicken', description: 'Grilled chicken with crushed pepper and melted cheese.', image: '/pizzas/pizza1.jpg', priceSm: 1400, priceMd: 1800, priceLg: 2400, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.8, ratingCount: 1240, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 2, name: 'BBQ Chicken Feast', description: 'Smoky BBQ chicken with onion and mozzarella.', image: '/pizzas/pizza2.jpg', priceSm: 1450, priceMd: 1850, priceLg: 2450, category: 'Chicken', tags: ['Chicken'], rating: 4.7, ratingCount: 980, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 3, name: 'Volcano Chicken', description: 'Extra spicy chicken with fiery sauce and cheese.', image: '/pizzas/pizza3.jpg', priceSm: 1500, priceMd: 1900, priceLg: 2500, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.6, ratingCount: 850, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 4, name: 'Triple Cheese Burst', description: 'Mozzarella, cheddar, and parmesan in every bite.', image: '/pizzas/pizza4.jpg', priceSm: 1600, priceMd: 2100, priceLg: 2800, category: 'Cheese', tags: ['Cheese'], rating: 4.9, ratingCount: 2100, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 5, name: 'Farmhouse Veg Supreme', description: 'Loaded with onion, capsicum, olives, and golden cheese.', image: '/pizzas/pizza5.jpg', priceSm: 1200, priceMd: 1600, priceLg: 2000, category: 'Veg', tags: ['Veg'], rating: 4.5, ratingCount: 750, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 6, name: 'Classic Chicken Sausage', description: 'Chicken sausage slices with a rich tomato base.', image: '/pizzas/pizza6.jpg', priceSm: 1300, priceMd: 1700, priceLg: 2200, category: 'Chicken', tags: ['Chicken'], rating: 4.4, ratingCount: 600, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 7, name: 'Hot Chilli Chicken', description: 'Red chilli flakes, hot sauce, and juicy chicken.', image: '/pizzas/pizza7.jpg', priceSm: 1400, priceMd: 1800, priceLg: 2300, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.6, ratingCount: 820, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 8, name: 'Cheese Lovers Classic', description: 'Simple, rich, and ultra-cheesy.', image: '/pizzas/pizza8.jpg', priceSm: 1100, priceMd: 1500, priceLg: 1900, category: 'Cheese', tags: ['Cheese'], rating: 4.5, ratingCount: 900, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 9, name: 'Pepper Chicken Crunch', description: 'Crispy chicken bites with bold pepper flavor.', image: '/pizzas/pizza9.jpg', priceSm: 1450, priceMd: 1850, priceLg: 2400, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.7, ratingCount: 1100, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 10, name: 'Creamy Cheese Melt', description: 'Smooth creamy cheese with a soft base.', image: '/pizzas/pizza10.jpg', priceSm: 1250, priceMd: 1650, priceLg: 2150, category: 'Cheese', tags: ['Cheese'], rating: 4.6, ratingCount: 880, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 11, name: 'Spicy Pepperoni Heat', description: 'Pepperoni-style chicken with bold spice.', image: '/pizzas/pizza11.jpg', priceSm: 1550, priceMd: 1950, priceLg: 2600, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.8, ratingCount: 1500, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 12, name: 'Sweet Corn & Cheese', description: 'Classic sweet corn paired with rich melted cheese.', image: '/pizzas/pizza12.jpg', priceSm: 1150, priceMd: 1550, priceLg: 2050, category: 'Veg', tags: ['Veg', 'Cheese'], rating: 4.4, ratingCount: 700, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 13, name: 'Street Style Chicken', description: 'Inspired by street-style spicy chicken flavors.', image: '/pizzas/pizza13.jpg', priceSm: 1350, priceMd: 1750, priceLg: 2250, category: 'Chicken', tags: ['Chicken'], rating: 4.7, ratingCount: 950, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 14, name: 'Chicken Tikka Fusion', description: 'Indian-style tikka chicken with creamy cheese.', image: '/pizzas/pizza14.jpg', priceSm: 1500, priceMd: 1900, priceLg: 2500, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.8, ratingCount: 1300, enabled: true, toppingIds: [1, 2, 3, 4, 5] }
];

/**
 * Database Seeding Script
 * Populates MongoDB with initial data from localStorage defaults
 * Run once: node scripts/seedDatabase.js
 */

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to MongoDB
        await dbConnect();
        console.log('✅ Connected to MongoDB\n');

        // 1. Seed Admin Users
        console.log('👤 Seeding admin users...');
        const existingAdmins = await Admin.countDocuments();

        if (existingAdmins === 0) {
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            const defaultAdmins = [
                {
                    id: 1,
                    username: 'admin',
                    password: hashedPassword,
                    role: 'Super Admin',
                    isActive: true
                },
                {
                    id: 2,
                    username: 'manager',
                    password: await bcrypt.hash('Manager@123', 10),
                    role: 'Manager',
                    isActive: true
                }
            ];

            await Admin.insertMany(defaultAdmins);
            console.log(`   ✅ Created ${defaultAdmins.length} admin users`);
            console.log('   📝 Default credentials:');
            console.log('      - admin / Admin@123');
            console.log('      - manager / Manager@123\n');
        } else {
            console.log(`   ⏭️  Skipped (${existingAdmins} admins already exist)\n`);
        }

        // 2. Seed Pizzas
        console.log('🍕 Seeding pizzas...');
        const existingPizzas = await Pizza.countDocuments();

        if (existingPizzas === 0) {
            await Pizza.insertMany(DEFAULT_PIZZAS);
            console.log(`   ✅ Created ${DEFAULT_PIZZAS.length} pizzas\n`);
        } else {
            console.log(`   ⏭️  Skipped (${existingPizzas} pizzas already exist)\n`);
        }

        // 3. Seed Toppings
        console.log('🧀 Seeding toppings...');
        const existingToppings = await Topping.countDocuments();

        if (existingToppings === 0) {
            await Topping.insertMany(DEFAULT_TOPPINGS);
            console.log(`   ✅ Created ${DEFAULT_TOPPINGS.length} toppings\n`);
        } else {
            console.log(`   ⏭️  Skipped (${existingToppings} toppings already exist)\n`);
        }

        // 4. Seed Test User
        console.log('👥 Seeding test user...');
        const existingUsers = await User.countDocuments();

        if (existingUsers === 0) {
            const testUser = {
                email: 'test@cheezybite.lk',
                password: await bcrypt.hash('test123', 10),
                name: 'Test Customer',
                phone: '+94 77 123 4567',
                phone_verified: true,
                addresses: [
                    {
                        id: `addr-${Date.now()}`,
                        label: 'Home',
                        street: '123 Galle Road',
                        city: 'Colombo',
                        area: 'Bambalapitiya',
                        phone: '+94 77 123 4567',
                        isDefault: true
                    }
                ]
            };

            await User.create(testUser);
            console.log('   ✅ Created test user');
            console.log('   📝 Test credentials: test@cheezybite.lk / test123\n');
        } else {
            console.log(`   ⏭️  Skipped (${existingUsers} users already exist)\n`);
        }

        // Summary
        console.log('🎉 Database seeding completed!\n');
        console.log('📊 Summary:');
        console.log(`   - Admins: ${await Admin.countDocuments()}`);
        console.log(`   - Pizzas: ${await Pizza.countDocuments()}`);
        console.log(`   - Toppings: ${await Topping.countDocuments()}`);
        console.log(`   - Users: ${await User.countDocuments()}`);
        console.log(`   - Orders: ${await Order.countDocuments()}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run seeding
seedDatabase();
