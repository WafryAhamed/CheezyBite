import dbConnect from '../src/lib/dbConnect.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

async function testUser() {
    try {
        await dbConnect();
        console.log('Connected');

        const testUser = {
            email: 'test_debug@cheezybite.lk',
            password: 'password', // skipping hash for speed or using string
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

        console.log('Creating user...');
        await User.create(testUser);
        console.log('User created');
    } catch (error) {
        console.error('Error creating user:');
        console.error(error);
        if (error.errors) {
            console.error(JSON.stringify(error.errors, null, 2));
        }
    }
    process.exit(0);
}

testUser();
