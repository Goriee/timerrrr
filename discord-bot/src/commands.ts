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

    // Update boss in DB
    await pool.query(
      'UPDATE bosses SET last_kill_at = ?, next_spawn_at = ?, is_scheduled = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [now, nextSpawn, boss.id]
    );

    message.reply(`✅ **${boss.name}** killed! Next spawn in ${boss.respawn_hours}h at **${nextSpawn.toLocaleString('en-US', { timeZone: 'UTC' })} UTC**.`);
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

    // Header for the table
    const header = `   BOSS NAME    | LVL | INTERVAL | NEXT SPAWN`;
    const separator = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    // Formatting helper
    const bossListLines = rows.map((b) => {
      const name = (b.name || "").substring(0, 12).padEnd(12, ' ');
      const level = String(b.level || "??").padStart(3, ' ');
      const respawn = (b.respawn_hours + "h").padEnd(8, ' ');
      
      let nextSpawn = "Not Scheduled";
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

        // Format: Feb 10, 2026, 2:23 AM
        nextSpawn = time.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric', 
            hour12: true,
            timeZone: 'UTC'
        });
      }

      return `${icon} ${name} | ${level} | ${respawn} | ${nextSpawn}`;
    });

    // Create an embed to fit more content (up to 4096 chars in description)
    const allRows = bossListLines.join('\n');
    const tableContent = `\`\`\`text\n${header}\n${separator}\n${allRows}\n\`\`\``;

    if (tableContent.length > 4096) {
        // Fallback to chunking if it really exceeds even the embed limit (very huge lists)
        const chunkSize = 15;
        for (let i = 0; i < bossListLines.length; i += chunkSize) {
            const chunk = bossListLines.slice(i, i + chunkSize);
            await message.reply(`**All Bosses (Part ${Math.floor(i/chunkSize) + 1})**\n\`\`\`text\n${header}\n${separator}\n${chunk.join('\n')}\n\`\`\``);
        }
    } else {
        const embed = new EmbedBuilder()
            .setTitle('All Bosses')
            .setDescription(tableContent)
            .setColor(0x2B2D31); // Discord dark theme color

        await message.reply({ embeds: [embed] });
    }

  } catch (error) {
    console.error(error);
    message.reply('Failed to fetch boss list.');
  }
}
