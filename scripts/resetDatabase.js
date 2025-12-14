const mongoose = require('mongoose');

/**
 * Database Reset Script
 * Drops all collections and re-seeds the database
 * DANGEROUS: Use only in development
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cheezybite';

async function resetDatabase() {
    try {
        console.log('⚠️  WARNING: This will DELETE ALL DATA in the database!');
        console.log('🗑️  Connecting to MongoDB...\n');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        console.log(`📦 Found ${collections.length} collections\n`);

        // Drop each collection
        for (const collection of collections) {
            console.log(`   🗑️  Dropping collection: ${collection.collectionName}`);
            await collection.drop();
        }

        console.log('\n✅ All collections dropped successfully!\n');
        console.log('💡 Run "npm run seed" to populate the database again.\n');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    }
}

// Confirmation prompt
console.log('\n==============================================');
console.log('  DATABASE RESET SCRIPT');
console.log('==============================================\n');
console.log('This will DELETE ALL DATA from:');
console.log(`Database: ${MONGODB_URI}\n`);
console.log('Are you sure? This script will run in 3 seconds...');
console.log('Press Ctrl+C to cancel\n');

setTimeout(() => {
    resetDatabase();
}, 3000);
