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

    // Header for the main list (pseudo-table)
    const dynamicHeader = `\`   BOSS NAME    | LVL | INT.  \` **EST. IN**`;

    // Formatting helper for Main Bosses
    const bossListLines = dynamicBosses.map((b) => {
      const name = (b.name || "").substring(0, 12).padEnd(12, ' ');
      const level = String(b.level || "??").padStart(3, ' ');
      const respawn = (b.respawn_hours + "h").padEnd(5, ' ');
      
      let nextSpawnTs = 0;
      let icon = "⚪"; 

      if (b.next_spawn_at) {
        const time = new Date(b.next_spawn_at);
        const now = new Date();
        const diffMs = time.getTime() - now.getTime();

        if (diffMs <= 0) {
            icon = "🟢"; // Spawns now
        } else if (diffMs < 3600000) { 
            icon = "🟡"; // < 1 hour
        } else {
            icon = "🔴"; // > 1 hour
        }
        
        // Unix timestamp for Discord
        nextSpawnTs = Math.floor(time.getTime() / 1000);
      }

      const infoBlock = `\`${icon} ${name} | ${level} | ${respawn}\``;
      const timerBlock = nextSpawnTs > 0 ? `<t:${nextSpawnTs}:R>` : "`--`";
      
      return `${infoBlock} ${timerBlock}`;
    });

    const mainDescription = bossListLines.length > 0 
        ? `${dynamicHeader}\n${bossListLines.join('\n')}`
        : `*No active field bosses tracked.*`;

    // 1. Send Main Boss List Embed
    const mainEmbed = new EmbedBuilder()
        .setTitle('All Bosses')
        .setDescription(mainDescription)
        .setColor(0x2B2D31);

    // ---------------------------------------------------------
    // FIXED SCHEDULE LOGIC (PH Time UTC+8)
    // ---------------------------------------------------------
    
    // Flattened schedule for upcoming events
    const rawSchedule = [
        // Monday (1)
        { d: 1, t: '11:30', n: 'Clemantis', l: 70 },
        { d: 1, t: '19:00', n: 'Thymele', l: 85 },
        // Tuesday (2)
        { d: 2, t: '11:30', n: 'Saphirus', l: 80 },
        { d: 2, t: '19:00', n: 'Neutro', l: 80 },
        // Wednesday (3)
        { d: 3, t: '11:30', n: 'Thymele', l: 85 },
        { d: 3, t: '21:00', n: 'Auraq', l: 100 },
        // Thursday (4)
        { d: 4, t: '11:30', n: 'Neutro', l: 80 },
        { d: 4, t: '19:00', n: 'Clemantis', l: 70 },
        // Friday (5)
        { d: 5, t: '19:00', n: 'Roderick', l: 95 },
        { d: 5, t: '22:00', n: 'Auraq', l: 100 },
        // Saturday (6)
        { d: 6, t: '15:00', n: 'Milavy', l: 90 },
        { d: 6, t: '17:00', n: 'Ringor', l: 95 },
        { d: 6, t: '22:00', n: 'Chaiflock', l: 120 },
        // Sunday (0)
        { d: 0, t: '17:00', n: 'Saphirus', l: 80 },
        { d: 0, t: '21:00', n: 'Benji', l: 120 },
    ];

    // Calculate next spawn for each event
    const upcomingEvents = rawSchedule.map(ev => {
        const now = new Date();
        const phtOffset = 8 * 60 * 60 * 1000;
        const nowPHT = new Date(now.getTime() + phtOffset);
        
        const [h, m] = ev.t.split(':').map(Number);
        
        // Target in PHT
        const targetPHT = new Date(Date.UTC(nowPHT.getUTCFullYear(), nowPHT.getUTCMonth(), nowPHT.getUTCDate(), h, m, 0));
        
        const currentDayIndex = nowPHT.getUTCDay();
        let daysDiff = (ev.d - currentDayIndex + 7) % 7;
        
        // If today and time passed, move to next week
        if (daysDiff === 0 && targetPHT.getTime() < nowPHT.getTime()) {
            daysDiff = 7;
        }
        
        targetPHT.setUTCDate(targetPHT.getUTCDate() + daysDiff);
        
        const unix = Math.floor((targetPHT.getTime() - phtOffset) / 1000);
        
        return {
            name: ev.n,
            level: ev.l,
            unix: unix,
            timeStr: ev.t
        };
    });

    // Sort by soonest
    upcomingEvents.sort((a, b) => a.unix - b.unix);

    // Format Fixed List
    const fixedListLines = upcomingEvents.map(ev => {
        const now = Date.now() / 1000;
        const diffSeconds = ev.unix - now;
        
        let icon = "🟢"; // Default
        if (diffSeconds > 3600) icon = "🔴";
        else if (diffSeconds > 0) icon = "🟡";

        const name = ev.name.substring(0, 12).padEnd(12, ' ');
        const level = String(ev.level).padStart(3, ' ');
        const timeCol = ev.timeStr.padEnd(5, ' '); 

        const infoBlock = `\`${icon} ${name} | ${level} | ${timeCol}\``;
        const timerBlock = `<t:${ev.unix}:R>`;
        
        return `${infoBlock} ${timerBlock}`;
    });
    
    // Header for Fixed List
    const fixedHeader = `\`   BOSS NAME    | LVL | TIME  \` **EST. IN**`;
    
    // 2. Create SEPARATE Fixed Schedule Embed
    const fixedEmbed = new EmbedBuilder()
        .setTitle('📅 Fixed Event Schedule (Upcoming)')
        .setDescription(`${fixedHeader}\n${fixedListLines.join('\n')}`)
        .setColor(0x00A2E8);

    // Send both embeds in one message
    await message.reply({ embeds: [mainEmbed, fixedEmbed] });

  } catch (error) {
    console.error(error);
    message.reply('Failed to fetch boss list.');
  }
}
