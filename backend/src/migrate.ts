import pool from './db';
import bcrypt from 'bcrypt';

async function migrate() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('Starting migration...');
    
    // Create bosses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bosses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        attack_type VARCHAR(50) NOT NULL,
        level INT NOT NULL,
        respawn_hours INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        last_kill_at DATETIME,
        next_spawn_at DATETIME,
        is_scheduled BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Bosses table created');

    // Create settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Settings table created');

    // Hash the password "naiwan"
    const passwordHash = await bcrypt.hash('naiwan', 10);
    
    // Insert or update admin password
    await connection.query(`
      INSERT INTO settings (\`key\`, value)
      VALUES ('admin_password_hash', ?)
      ON DUPLICATE KEY UPDATE value = ?, updated_at = CURRENT_TIMESTAMP;
    `, [passwordHash, passwordHash]);
    console.log('✓ Admin password set (naiwan)');

    const sampleBosses: any[] = [];
    /* Sample bosses removed 
    const sampleBosses = [
      {
        name: 'Dragon Lord',
        
    ... 
    ];
    */

    for (const boss of sampleBosses) {
      await connection.query(`
        INSERT INTO bosses (name, attack_type, level, respawn_hours, location)
        SELECT ?, ?, ?, ?, ?
        WHERE NOT EXISTS (SELECT 1 FROM bosses WHERE name = ?);
      `, [boss.name, boss.attackType, boss.level, boss.respawnHours, boss.location, boss.name]);
    }
    console.log('✓ Sample bosses inserted');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

migrate();
