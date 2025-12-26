import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dbConnect from '../src/lib/dbConnect.js';
import Admin from '../src/models/Admin.js';

// Load environment variables
dotenv.config({ path: '../.env.local' });

async function reseedAdmins() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await dbConnect();

        console.log('🗑️ Clearing existing admins...');
        await Admin.deleteMany({});

        console.log('👤 Creating fresh admin users...');
        const hashedAdminPass = await bcrypt.hash('Admin@123', 10);
        const hashedManagerPass = await bcrypt.hash('Manager@123', 10);

        const admins = [
            {
                id: 1,
                username: 'admin',
                password: hashedAdminPass,
                role: 'Super Admin',
                isActive: true
            },
            {
                id: 2,
                username: 'manager',
                password: hashedManagerPass,
                role: 'Manager',
                isActive: true
            }
        ];

        await Admin.insertMany(admins);

        console.log('✅ Admin users reseeded successfully!');
        console.log('   - admin / Admin@123');
        console.log('   - manager / Manager@123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Reseeding failed:', error);
        process.exit(1);
    }
}

reseedAdmins();
