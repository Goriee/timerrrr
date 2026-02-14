
import pool from './db';

const updates = [
  { name: 'Undomiel', offset: '4m' },
  { name: 'Livera', offset: '9m' },
  { name: 'Araneo', offset: '18m' },
  { name: 'LadyDalia', offset: '22m' },
  { name: 'Milavy', offset: '48m' },
  { name: 'Ringor', offset: '2h48m' },
  { name: 'Venatus', offset: '4h12m' },
  { name: 'Viorent', offset: '4h13m' },
  { name: 'Titore', offset: '6h35m' },
  { name: 'Chaiflock', offset: '7h48m' },
  { name: 'Baron', offset: '8h8m' },
  { name: 'Gareth', offset: '8h21m' },
  { name: 'Ego', offset: '15h7m' },
  { name: 'Aquleus', offset: '16h17m' },
  { name: 'Amentis', offset: '16h20m' },
  { name: 'Wannitas', offset: '24h23m' },
  { name: 'Metus', offset: '24h28m' },
  { name: 'Duplican', offset: '24h31m' },
  { name: 'Saphirus', offset: '26h48m' },
  { name: 'Larba', offset: '29h45m' },
  { name: 'Shuliar', offset: '29h48m' },
  { name: 'Catena', offset: '30h31m' },
  { name: 'Benji', offset: '30h48m' },
  { name: 'Asta', offset: '32h22m' },
  { name: 'Ordo', offset: '32h37m' },
  { name: 'Secreta', offset: '33h4m' },
  { name: 'Supore', offset: '39h30m' },
  { name: 'Clementis', offset: '45h18m' },
  { name: 'Thymele', offset: '52h48m' },
  { name: 'Neutro', offset: '76h48m' },
  { name: 'Auraq', offset: '102h48m' },
  { name: 'Roderick', offset: '148h48m' },
];

function parseOffset(offset: string): number {
  let totalMinutes = 0;
  
  const hoursMatch = offset.match(/(\d+)h/);
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }
  
  const minutesMatch = offset.match(/(\d+)m/);
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }
  
  return totalMinutes * 60 * 1000;
}

async function runUpdate() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Starting manual update for M1 timers (DB Server M5)...');
    
    const now = new Date();

    for (const update of updates) {
      const msOffset = parseOffset(update.offset);
      const nextSpawn = new Date(now.getTime() + msOffset);
      
      // We need to fetch the boss first to get the respawn_hours to calculate last_kill_at
      const [rows] = await connection.query<any[]>(
        "SELECT id, respawn_hours FROM bosses WHERE name = ? AND server = 'M5'",
        [update.name]
      );
      
      if (rows.length === 0) {
        console.warn(`⚠️ Boss ${update.name} not found in M5.`);
        continue;
      }
      
      const boss = rows[0];
      const respawnMs = boss.respawn_hours * 60 * 60 * 1000;
      const lastKill = new Date(nextSpawn.getTime() - respawnMs);
      
      await connection.query(
        "UPDATE bosses SET last_kill_at = ?, next_spawn_at = ?, is_scheduled = true WHERE id = ?",
        [lastKill, nextSpawn, boss.id]
      );
      
      console.log(`✓ Updated ${update.name}: Nest spawn in ${update.offset}`);
    }
    
    console.log('All updates completed.');
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

runUpdate();
