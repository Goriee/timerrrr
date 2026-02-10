import { Message, EmbedBuilder } from 'discord.js';
import pool from './db';
import { RowDataPacket } from 'mysql2/promise';

export async function handleKillCommand(message: Message, args: string[]) {
  const bossNameSearch = args.join(' ');
  
  if (!bossNameSearch) {
    message.reply('Please provide a boss name. Usage: `!kill BossName`');
    return;
  }

  try {
    // Find boss (case-insensitive partial match)
    // Using LOWER() to ensure case-insensitivity regardless of DB collation
    const [bosses] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM bosses WHERE LOWER(name) LIKE LOWER(?) LIMIT 1',
      [`%${bossNameSearch}%`]
    );

    if (bosses.length === 0) {
      message.reply(`Could not find a boss matching "${bossNameSearch}".`);
      return;
    }

    const boss = bosses[0];
    const now = new Date();
    
    // Calculate next spawn
    // boss.respawn_hours is likely a number in DB, but TS might see it as any. 
    const nextSpawn = new Date(now.getTime() + (boss.respawn_hours as number) * 60 * 60 * 1000);
    const unixTime = Math.floor(nextSpawn.getTime() / 1000);

    // Update boss in DB
    await pool.query(
      'UPDATE bosses SET last_kill_at = ?, next_spawn_at = ?, is_scheduled = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [now, nextSpawn, boss.id]
    );

    message.reply(`✅ **${boss.name}** killed! Next spawn in ${boss.respawn_hours}h at <t:${unixTime}:f> (<t:${unixTime}:R>).`);
  } catch (error) {
    console.error(error);
    message.reply('An error occurred while updating the boss timer.');
  }
}

// handleBossTimeCommand removed as requested

export async function handleAllBossesCommand(message: Message) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT name, respawn_hours, next_spawn_at, level FROM bosses ORDER BY (next_spawn_at IS NULL), next_spawn_at ASC'
    );

    if (rows.length === 0) {
      message.reply('No bosses found in database.');
      return;
    }

    // List of fixed spawn bosses to exclude from the main list
    const fixedBosses = [
      'Clemantis', 'Thymele', 'Saphirus', 'Neutro', 
      'Auraq', 'Roderick', 'Milavy', 'Ringor', 
      'Chaiflock', 'Benji'
    ];

    // Filter out fixed bosses (case-insensitive check)
    const dynamicBosses = rows.filter(b => 
        !fixedBosses.some(fb => b.name.toLowerCase().includes(fb.toLowerCase()))
    );

    // Header for the table
    const header = `   BOSS NAME    | LVL | INT.     | EST. IN`;
    const separator = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    // Formatting helper
    const bossListLines = dynamicBosses.map((b) => {
      const name = (b.name || "").substring(0, 12).padEnd(12, ' ');
      const level = String(b.level || "??").padStart(3, ' ');
      const respawn = (b.respawn_hours + "h").padEnd(8, ' ');
      
      let nextSpawn = "--";
      let icon = "⚪"; // Default grey for no schedule

      if (b.next_spawn_at) {
        const time = new Date(b.next_spawn_at);
        const now = new Date();
        const diffMs = time.getTime() - now.getTime();

        if (diffMs <= 0) {
            icon = "🟢"; // Spawning now or spawned
        } else if (diffMs < 3600000) { // < 1 hour
            icon = "🟡"; // Spawning soon
        } else {
            icon = "🔴"; // Spawning later
        }

        const absMs = Math.abs(diffMs);
        const d = Math.floor(absMs / 86400000);
        const h = Math.floor((absMs % 86400000) / 3600000);
        const m = Math.floor((absMs % 3600000) / 60000);
        
        const sign = diffMs < 0 ? "-" : "";
        if (d > 0) nextSpawn = `${sign}${d}d ${h}h`;
        else if (h > 0) nextSpawn = `${sign}${h}h ${m}m`;
        else nextSpawn = `${sign}${m}m`;
      }

      return `${icon} ${name} | ${level} | ${respawn} | ${nextSpawn}`;
    });

    // Create main embed
    const allRows = bossListLines.join('\n');
    const tableContent = bossListLines.length > 0 
        ? `\`\`\`text\n${header}\n${separator}\n${allRows}\n\`\`\``
        : `*No active field bosses tracked.*`;

    // 1. Send Main Boss List Embed
    const mainEmbed = new EmbedBuilder()
        .setTitle('All Bosses')
        .setDescription(tableContent)
        .setColor(0x2B2D31); // Discord dark theme color

    // Fixed Schedule Configuration
    const scheduleData = [
        { 
            dayName: 'Monday', dayIndex: 1, 
            events: [
                { time: '11:30', name: 'Clemantis (Lvl 70)' },
                { time: '19:00', name: 'Thymele (Lvl 85)' }
            ] 
        },
        { 
            dayName: 'Tuesday', dayIndex: 2, 
            events: [
                { time: '11:30', name: 'Saphirus (Lvl 80)' },
                { time: '19:00', name: 'Neutro (Lvl 80)' }
            ] 
        },
        { 
            dayName: 'Wednesday', dayIndex: 3, 
            events: [
                { time: '11:30', name: 'Thymele (Lvl 85)' },
                { time: '21:00', name: 'Auraq (Lvl 100)' }
            ] 
        },
        { 
            dayName: 'Thursday', dayIndex: 4, 
            events: [
                { time: '11:30', name: 'Neutro (Lvl 80)' },
                { time: '19:00', name: 'Clemantis (Lvl 70)' }
            ] 
        },
        { 
            dayName: 'Friday', dayIndex: 5, 
            events: [
                { time: '19:00', name: 'Roderick (Lvl 95)' },
                { time: '22:00', name: 'Auraq (Lvl 100)' }
            ] 
        },
        { 
            dayName: 'Saturday', dayIndex: 6, 
            events: [
                { time: '15:00', name: 'Milavy (Lvl 90)' },
                { time: '17:00', name: 'Ringor (Lvl 95)' },
                { time: '22:00', name: 'Chaiflock (Lvl 120)' }
            ] 
        },
        { 
            dayName: 'Sunday', dayIndex: 0, 
            events: [
                { time: '17:00', name: 'Saphirus (Lvl 80)' },
                { time: '21:00', name: 'Benji (Lvl 120)' }
            ] 
        }
    ];

    // Generate dynamic schedule text
    const fixedScheduleText = scheduleData.map(day => {
        const eventLines = day.events.map(ev => {
            const now = new Date();
            const [h, m] = ev.time.split(':').map(Number);
            
            // Construct target date (UTC)
            const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, 0));
            
            const currentDay = now.getUTCDay();
            let daysDiff = (day.dayIndex - currentDay + 7) % 7;

            // Adjust for past times today
            if (daysDiff === 0 && target.getTime() < now.getTime()) {
                daysDiff = 7;
            }
            
            target.setUTCDate(target.getUTCDate() + daysDiff);
            const unix = Math.floor(target.getTime() / 1000);

            return `${ev.time} — ${ev.name} (<t:${unix}:R>)`;
        }).join('\n');

        return `**${day.dayName}**\n${eventLines}`;
    }).join('\n\n');

    // 2. Create SEPARATE Fixed Schedule Embed
    const fixedEmbed = new EmbedBuilder()
        .setTitle('📅 Fixed Event Schedule')
        .setDescription(fixedScheduleText)
        .setColor(0x00A2E8); // Different color for distinction

    // Send both embeds in one message
    await message.reply({ embeds: [mainEmbed, fixedEmbed] });

  } catch (error) {
    console.error(error);
    message.reply('Failed to fetch boss list.');
  }
}
