import { db } from '@/db';
import { appointments } from '@/db/schema';

/**
 * Cleanup Script - Delete All Appointments
 * WARNING: This will permanently delete all appointment data
 */

async function cleanup() {
    console.log('⚠️  WARNING: This will delete ALL appointments from the database!');
    console.log('Starting cleanup in 3 seconds...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        console.log('🗑️  Deleting all appointments...');

        // Delete all appointments
        const result = await db.delete(appointments);

        console.log(`✅ Successfully deleted all appointments`);
        console.log('✅ Cleanup complete!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
