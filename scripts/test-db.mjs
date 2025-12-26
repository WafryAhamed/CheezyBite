import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/cheezybite';

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        await mongoose.connect(MONGODB_URI, { bufferCommands: false });
        console.log('✅ Connected successfully!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
