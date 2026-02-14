
import pool from './db';
import { RowDataPacket } from 'mysql2';

async function migrateServers() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Starting server migration...');

    // 1. Add server column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE bosses 
        ADD COLUMN server VARCHAR(10) NOT NULL DEFAULT 'M5' AFTER name;
      `);
      console.log('✓ Added server column');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ Server column already exists');
      } else {
        throw error;
      }
    }

    // 2. Check if we already have M1 bosses
    const [rows] = await connection.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM bosses WHERE server = 'M1'");
    const m1Count = rows[0].count;

    if (m1Count === 0) {
      console.log('Duplicating bosses for M1...');
      // 3. Duplicate M5 bosses for M1
      // We select M5 bosses and insert them as M1
      // We reset last_kill_at and next_spawn_at for M1 as they have different timers
      await connection.query(`
        INSERT INTO bosses (name, server, attack_type, level, respawn_hours, location, last_kill_at, next_spawn_at, is_scheduled)
        SELECT name, 'M1', attack_type, level, respawn_hours, location, NULL, NULL, false
        FROM bosses
        WHERE server = 'M5';
      `);
      console.log('✓ Duplicated bosses for M1');
    } else {
      console.log('✓ M1 bosses already exist');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

migrateServers();
