import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Admin from '@/models/Admin';
import Pizza from '@/models/Pizza';
import Topping from '@/models/Topping';
import Order from '@/models/Order';
import bcrypt from 'bcryptjs';
import { DEFAULT_PIZZAS, DEFAULT_TOPPINGS } from '@/app/utils/adminStorageHelper';

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
