import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Import Models (Must use .js extension in Node ESM)
import dbConnect from '../src/lib/dbConnect.js';
import User from '../src/models/User.js';
import Admin from '../src/models/Admin.js';
import Pizza from '../src/models/Pizza.js';
import Topping from '../src/models/Topping.js';
import Order from '../src/models/Order.js';
import Offer from '../src/models/Offer.js';

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
    { id: 14, name: 'Chicken Tikka Fusion', description: 'Indian-style tikka chicken with creamy cheese.', image: '/pizzas/pizza14.jpg', priceSm: 1500, priceMd: 1900, priceLg: 2500, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.8, ratingCount: 1300, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 15, name: 'Chicken Dominican', description: 'Delightful combination of grilled chicken and sweet corn.', image: '/pizzas/pizza15.jpg', priceSm: 1450, priceMd: 1850, priceLg: 2450, category: 'Chicken', tags: ['Chicken'], rating: 4.6, ratingCount: 1050, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 16, name: 'Veggie Feast', description: 'Onion, capsicum, mushroom, and paneer.', image: '/pizzas/pizza16.jpg', priceSm: 1250, priceMd: 1650, priceLg: 2150, category: 'Veg', tags: ['Veg'], rating: 4.3, ratingCount: 650, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 17, name: 'Spicy Triple Tango', description: 'Corn, jalapeno, and red paprika with spicy sauce.', image: '/pizzas/pizza17.png', priceSm: 1350, priceMd: 1750, priceLg: 2250, category: 'Spicy', tags: ['Spicy', 'Veg'], rating: 4.7, ratingCount: 890, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 18, name: 'Chicken Golden Delight', description: 'Double pepper barbecue chicken and golden corn.', image: '/pizzas/pizza18.jpg', priceSm: 1500, priceMd: 1900, priceLg: 2500, category: 'Chicken', tags: ['Chicken'], rating: 4.9, ratingCount: 1400, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 19, name: 'Double Cheese Margherita', description: 'Classic delight with extra 100% real mozzarella cheese.', image: '/pizzas/pizza19.jpg', priceSm: 1300, priceMd: 1700, priceLg: 2200, category: 'Cheese', tags: ['Cheese'], rating: 4.8, ratingCount: 2200, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 20, name: 'Veggie Crunch', description: 'Crispy capsicum, onion, and fresh tomato.', image: '/pizzas/pizza20.jpg', priceSm: 1150, priceMd: 1550, priceLg: 1950, category: 'Veg', tags: ['Veg'], rating: 4.4, ratingCount: 580, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 21, name: 'Blazing Onion & Paprika', description: 'Hot and spicy onion with red paprika.', image: '/pizzas/pizza21.jpg', priceSm: 1200, priceMd: 1600, priceLg: 2000, category: 'Spicy', tags: ['Spicy', 'Veg'], rating: 4.5, ratingCount: 720, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 22, name: 'Chicken Pepperoni', description: 'American classic with spicy chicken pepperoni.', image: '/pizzas/pizza22.jpg', priceSm: 1600, priceMd: 2100, priceLg: 2800, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.9, ratingCount: 1800, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 23, name: 'Paneer & Onion', description: 'Creamy paneer and crunchy onion.', image: '/pizzas/pizza23.jpg', priceSm: 1350, priceMd: 1750, priceLg: 2250, category: 'Veg', tags: ['Veg'], rating: 4.6, ratingCount: 950, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 24, name: 'Chicken Fiesta', description: 'Grilled chicken, rashers, peri-peri chicken, onion, capsicum.', image: '/pizzas/pizza24.jpg', priceSm: 1650, priceMd: 2150, priceLg: 2850, category: 'Chicken', tags: ['Chicken'], rating: 4.8, ratingCount: 1600, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 25, name: 'Chef\'s Secret Special', description: 'Exclusive recipe available for limited time.', image: '/pizzas/pizza25.jpg', priceSm: 2000, priceMd: 2500, priceLg: 3000, category: 'Special', tags: ['Special', 'Chef'], rating: 5.0, ratingCount: 100, enabled: true, toppingIds: [1, 2, 3, 4, 5] }
];

/**
 * Database Seeding Script (ESM Version)
 * Populates MongoDB with initial data
 * Run with: node scripts/seed.mjs
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
        const existingPizzaDocs = await Pizza.find({}, { id: 1 }).lean();
        const existingIds = existingPizzaDocs.map(p => p.id);
        const newPizzas = DEFAULT_PIZZAS.filter(p => !existingIds.includes(p.id));

        if (newPizzas.length > 0) {
            await Pizza.insertMany(newPizzas);
            console.log(`   ✅ Added ${newPizzas.length} missing pizzas\n`);
        } else {
            console.log(`   ⏭️  Skipped (All ${DEFAULT_PIZZAS.length} pizzas already exist)\n`);
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

        // 5. Seed Sample Coupons
        console.log('🎟️  Seeding sample coupons...');
        const existingCoupons = await Offer.countDocuments();

        if (existingCoupons === 0) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

            const sampleCoupons = [
                {
                    name: 'Welcome Discount',
                    code: 'WELCOME10',
                    type: 'percent',
                    value: 10,
                    maxDiscount: 500,
                    minOrderAmount: 1000,
                    validFrom: new Date(),
                    validTo: futureDate,
                    usageLimitTotal: 100,
                    usageLimitPerUser: 1,
                    firstOrderOnly: true,
                    active: true
                },
                {
                    name: 'Flat 200 Off',
                    code: 'FLAT200',
                    type: 'fixed',
                    value: 200,
                    minOrderAmount: 1500,
                    validFrom: new Date(),
                    validTo: futureDate,
                    usageLimitTotal: 50,
                    usageLimitPerUser: 2,
                    active: true
                },
                {
                    name: 'Big Order Discount',
                    code: 'BIGORDER',
                    type: 'percent',
                    value: 15,
                    maxDiscount: 1000,
                    minOrderAmount: 3000,
                    validFrom: new Date(),
                    validTo: futureDate,
                    usageLimitTotal: null, // Unlimited
                    usageLimitPerUser: 3,
                    active: true
                },
                {
                    name: 'Weekend Special',
                    code: 'WEEKEND',
                    type: 'percent',
                    value: 20,
                    maxDiscount: 800,
                    minOrderAmount: 2000,
                    validFrom: new Date(),
                    validTo: futureDate,
                    usageLimitTotal: 200,
                    usageLimitPerUser: 1,
                    active: true
                }
            ];

            await Offer.insertMany(sampleCoupons);
            console.log(`   ✅ Created ${sampleCoupons.length} sample coupons\n`);
        } else {
            console.log(`   ⏭️  Skipped (${existingCoupons} coupons already exist)\n`);
        }

        // Summary
        console.log('🎉 Database seeding completed!\n');
        console.log('📊 Summary:');
        console.log(`   - Admins: ${await Admin.countDocuments()}`);
        console.log(`   - Pizzas: ${await Pizza.countDocuments()}`);
        console.log(`   - Toppings: ${await Topping.countDocuments()}`);
        console.log(`   - Coupons: ${await Offer.countDocuments()}`);
        console.log(`   - Users: ${await User.countDocuments()}`);
        console.log(`   - Orders: ${await Order.countDocuments()}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:');
        if (error.errors) {
            console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        } else if (error.message) {
            console.error('Error Message:', error.message);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

// Run seeding
seedDatabase();
