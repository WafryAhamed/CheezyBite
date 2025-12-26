import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import dbConnect from '../src/lib/dbConnect.js';
import Admin from '../src/models/Admin.js';

dotenv.config({ path: '../.env.local' });

async function testLogin() {
    try {
        console.log('🔄 Connecting to DB...');
        await dbConnect();

        console.log('🔍 Finding user "admin"...');
        const admin = await Admin.findOne({ username: 'admin' });

        if (!admin) {
            console.error('❌ User "admin" not found in DB!');
            process.exit(1);
        }

        console.log(`✅ User found: ${admin.username}`);
        console.log(`🔐 Stored Hash: ${admin.password.substring(0, 10)}...`);

        console.log('🔑 Testing password "Admin@123"...');
        const isValid = await bcrypt.compare('Admin@123', admin.password);

        if (isValid) {
            console.log('✅ PASSWORD IS VALID! The database is correct.');
        } else {
            console.error('❌ PASSWORD INVALID! Hash mismatch.');
        }

        process.exit(0);

    } catch (e) {
        console.error('💥 Error:', e);
        process.exit(1);
    }
}

testLogin();
