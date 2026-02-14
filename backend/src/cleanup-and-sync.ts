
import pool from './db';

async function removeSampleBosses() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Removing sample bosses...');

    const sampleNames = ['Dragon Lord', 'Shadow Knight', 'Ice Queen', 'Thunder Beast'];
    
    // Create placeholders for the query
    const placeholders = sampleNames.map(() => '?').join(',');
    
    // Delete from both servers if they exist
    const [result] = await connection.query<any>(
      `DELETE FROM bosses WHERE name IN (${placeholders})`,
      sampleNames
    );
    
    console.log(`✓ Removed ${result.affectedRows} sample bosses`);

    // Now sync M1 times from M5 (one-time sync)
    // We update M1 bosses to match M5 bosses' schedule
    console.log('Syncing M1 times from M5...');
    
    // Get all M5 bosses
    const [m5Bosses] = await connection.query<any[]>(
        `SELECT name, last_kill_at, next_spawn_at, is_scheduled FROM bosses WHERE server = 'M5'`
    );

    for (const boss of m5Bosses) {
        if (boss.last_kill_at) {
            await connection.query(
                `UPDATE bosses 
                 SET last_kill_at = ?, next_spawn_at = ?, is_scheduled = ?
                 WHERE server = 'M1' AND name = ?`,
                [boss.last_kill_at, boss.next_spawn_at, boss.is_scheduled, boss.name]
            );
        }
    }
    console.log('✓ Synced M1 times to match M5');

    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

removeSampleBosses();
