
import pool from './db';

const setup = async () => {
    try {
        console.log('Running setup...');
        
        // Create bot_settings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bot_settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value VARCHAR(255) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table bot_settings ensured.');

        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
};

setup();
