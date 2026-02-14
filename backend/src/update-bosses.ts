import pool from './db';
import bcrypt from 'bcrypt';

async function updateBosses() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('Starting boss update...');

    // Remove duplicates keeping the lowest ID (safeguard)
    // Only remove if name AND server are the same
    await connection.query(`
      DELETE t1 FROM bosses t1
      INNER JOIN bosses t2 
      WHERE 
          t1.id > t2.id AND 
          t1.name = t2.name AND
          t1.server = t2.server
    `);
    console.log('✓ Removed duplicate bosses within duplicate servers');
    
    // Clear existing bosses
    // await connection.query('DELETE FROM bosses');
    // console.log('✓ Cleared existing bosses');

    // Your actual boss list
    const bosses = [
      { name: 'Venatus', attackType: 'melee', level: 60, respawnHours: 10, location: 'Corrupted Basin' },
      { name: 'Viorent', attackType: 'melee', level: 65, respawnHours: 10, location: 'Crescent Lake' },
      { name: 'Thymele', attackType: 'magic', level: 85, respawnHours: 1, location: 'Twilight Hill' },
      { name: 'Ego', attackType: 'magic', level: 70, respawnHours: 21, location: 'Ulan Canyon' },
      { name: 'Catena', attackType: 'magic', level: 100, respawnHours: 35, location: 'Deadman 3' },
      { name: 'Shuliar', attackType: 'melee', level: 95, respawnHours: 35, location: 'Ruins of the War' },
      { name: 'Larba', attackType: 'magic', level: 98, respawnHours: 35, location: 'Ruins of the War' },
      { name: 'LadyDalia', attackType: 'melee', level: 85, respawnHours: 18, location: 'Twilight Hill' },
      { name: 'Titore', attackType: 'magic', level: 98, respawnHours: 37, location: 'Deadman 2' },
      { name: 'Aquleus', attackType: 'melee', level: 85, respawnHours: 29, location: 'Tyriosa 2F' },
      { name: 'Amentis', attackType: 'magic', level: 88, respawnHours: 29, location: 'Land of Glory' },
      { name: 'Saphirus', attackType: 'magic', level: 80, respawnHours: 18, location: 'Crescent Lake' },
      { name: 'Undomiel', attackType: 'magic', level: 80, respawnHours: 24, location: 'Secret Laboratory' },
      { name: 'Livera', attackType: 'melee', level: 75, respawnHours: 24, location: "Protector's Ruins" },
      { name: 'Araneo', attackType: 'melee', level: 75, respawnHours: 24, location: 'Tyriosa 1F' },
      { name: 'Asta', attackType: 'melee', level: 100, respawnHours: 62, location: 'Silvergrass' },
      { name: 'Ordo', attackType: 'melee', level: 100, respawnHours: 62, location: 'Silvergrass' },
      { name: 'Secreta', attackType: 'magic', level: 100, respawnHours: 62, location: 'Silvergrass' },
      { name: 'Supore', attackType: 'magic', level: 100, respawnHours: 62, location: 'Silvergrass' },
      { name: 'Neutro', attackType: 'magic', level: 80, respawnHours: 25, location: 'Desert of the Screaming' },
      { name: 'Baron', attackType: 'melee', level: 88, respawnHours: 32, location: 'Battlefield of Templar' },
      { name: 'Gareth', attackType: 'melee', level: 98, respawnHours: 32, location: 'Deadman 1' },
      { name: 'Wannitas', attackType: 'melee', level: 93, respawnHours: 48, location: 'Plateau of Revolution' },
      { name: 'Metus', attackType: 'melee', level: 93, respawnHours: 48, location: 'Plateau of Revolution' },
      { name: 'Duplican', attackType: 'melee', level: 93, respawnHours: 48, location: 'Plateau of Revolution' },
      { name: 'Auraq', attackType: 'magic', level: 100, respawnHours: 51, location: 'Garbana 2F' },
      { name: 'Clementis', attackType: 'magic', level: 70, respawnHours: 73, location: 'Corrupted Basin' },
      { name: 'Roderick', attackType: 'melee', level: 95, respawnHours: 97, location: 'Garbana 1F' },
      { name: 'Milavy', attackType: 'melee', level: 90, respawnHours: 117, location: 'Tyriosa 3F' },
      { name: 'Ringor', attackType: 'magic', level: 95, respawnHours: 119, location: 'Battlefield of Templar' },
      { name: 'Chaiflock', attackType: 'magic', level: 120, respawnHours: 124, location: 'Silvergrass' },
      { name: 'Benji', attackType: 'magic', level: 120, respawnHours: 147, location: 'Silvergrass' },
    ];

    for (const boss of bosses) {
      // 1. Ensure M5 boss exists
      const [rowsM5] = await connection.query<any[]>(
        'SELECT id FROM bosses WHERE name = ? AND server = "M5"', 
        [boss.name]
      );
      
      if (rowsM5.length === 0) {
        await connection.query(
          `INSERT INTO bosses (name, server, attack_type, level, respawn_hours, location, created_at) 
           VALUES (?, "M5", ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [boss.name, boss.attackType, boss.level, boss.respawnHours, boss.location]
        );
        console.log(`+ Added M5 ${boss.name}`);
      } else {
        await connection.query(
          `UPDATE bosses SET attack_type=?, level=?, respawn_hours=?, location=? WHERE name=? AND server="M5"`,
          [boss.attackType, boss.level, boss.respawnHours, boss.location, boss.name]
        );
      }

      // 2. Ensure M1 boss exists
      const [rowsM1] = await connection.query<any[]>(
        'SELECT id FROM bosses WHERE name = ? AND server = "M1"', 
        [boss.name]
      );
      
      if (rowsM1.length === 0) {
        await connection.query(
          `INSERT INTO bosses (name, server, attack_type, level, respawn_hours, location, created_at) 
           VALUES (?, "M1", ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [boss.name, boss.attackType, boss.level, boss.respawnHours, boss.location]
        );
        console.log(`+ Added M1 ${boss.name}`);
      } else {
        await connection.query(
          `UPDATE bosses SET attack_type=?, level=?, respawn_hours=?, location=? WHERE name=? AND server="M1"`,
          [boss.attackType, boss.level, boss.respawnHours, boss.location, boss.name]
        );
      }
    }
    console.log(`✓ Inserted/Updated bosses for M1 & M5`);

    // Remove any bosses from DB that are not in our list
    const bossNames = bosses.map(b => b.name);
    if (bossNames.length > 0) {
      const placeholders = bossNames.map(() => '?').join(',');
      const [result] = await connection.query<any>(
        `DELETE FROM bosses WHERE name NOT IN (${placeholders})`,
        bossNames
      );
      if (result.affectedRows > 0) {
        console.log(`- Removed ${result.affectedRows} obsolete bosses`);
      }
    }

    console.log('Boss update completed successfully!');
  } catch (error) {
    console.error('Boss update failed:', error);
    throw error;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

updateBosses();
