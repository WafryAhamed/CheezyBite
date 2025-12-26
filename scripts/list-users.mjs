import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env (explicit path to be safe)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined in .env.local');
    process.exit(1);
}

console.log(`🔌 Connecting to: ${MONGODB_URI}`);

const userSchema = new mongoose.Schema({ email: String }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const count = await User.countDocuments();
        console.log(`📊 Total Users: ${count}`);

        const users = await User.find({}, 'email name phone emailVerified');
        console.table(users.map(u => ({
            id: u._id.toString(),
            email: u.email,
            name: u.name,
            verified: u.emailVerified
        })));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
}

checkUsers();
