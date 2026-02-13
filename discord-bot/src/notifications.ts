
import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import pool from './db';
import { RowDataPacket } from 'mysql2/promise';

interface Boss extends RowDataPacket {
  id: number;
  name: string;
  level: number;
  location: string;
  attack_type: string;       // Might be mapped
  continent: string;
  next_spawn_at: Date;
  respawn_hours: number;
}

export function startNotificationScanner(client: Client) {
  // Check every 60 seconds
  const interval = setInterval(() => checkBosses(client), 60 * 1000);
  console.log('⏰ Notification scanner started (60s interval).');
  
  // Run an immediate check on startup
  checkBosses(client);
}

async function checkBosses(client: Client) {
  try {
    // Get notification channel
    const [settings] = await pool.query<RowDataPacket[]>(
      "SELECT setting_value FROM bot_settings WHERE setting_key = 'notification_channel'"
    );

    if (settings.length === 0) {
        console.log('No notification channel set in DB.'); 
        return; 
    }
    const channelId = settings[0].setting_value;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    
    // Check if channel exists and is a type that can convert to TextChannel/NewsChannel/ThreadChannel
    // Using simple type assertion to TextChannel for simplicity as we filtered for text-based content
    // but explicit check is better
    if (!channel || (!channel.isTextBased())) {
      console.warn(`⚠️ Notification channel ${channelId} not found or not text-based.`);
      return;
    }

    // Cast to TextChannel or similar interface that has .send
    // In discord.js v14, isTextBased() includes TextChannel, DMChannel, NewsChannel, ThreadChannel, VoiceChannel
    const textChannel = channel as TextChannel;

    const [bosses] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM bosses 
      WHERE next_spawn_at BETWEEN DATE_ADD(NOW(), INTERVAL 9 MINUTE) 
                              AND DATE_ADD(NOW(), INTERVAL 11 MINUTE)
    `);

    if (bosses.length === 0) return;

    for (const boss of bosses) {
      console.log(`Found boss: ${boss.name} spawning at ${boss.next_spawn_at}`);

      // Build notification
      const spawnTime = new Date(boss.next_spawn_at);
      const unixTime = Math.floor(spawnTime.getTime() / 1000);
      
      // Fix path: currently assumes ../frontend/public from dist/src/notifications.js which is wrong
      // dist is usually parallel to frontend if built at root or inside discord-bot
      // process.cwd() is usually /app or project root.
      // let's try a safer image resolution or just use a placeholder if missing
      
      const embed = new EmbedBuilder()
        .setTitle(`⚔️ **${boss.name}** Spawning Soon!`)
        .setDescription(`**${boss.name}** will spawn in approximately **10 minutes**!`)
        .setColor(0xE67E22) // Orange-ish like the screenshot
        .addFields(
          { name: 'Level', value: String(boss.level || '??'), inline: true },
          { name: 'Location', value: boss.location || 'Unknown', inline: true },
          { name: 'Attack Type', value: boss.attack_type || 'Unknown', inline: true },
          { name: 'Spawn Time', value: `<t:${unixTime}:T> (<t:${unixTime}:R>)`, inline: false }
        )
        .setTimestamp();

      await textChannel.send({ 
        embeds: [embed]
        // Removed local file attachment for now to prevent crashes if file path is wrong on Render
      });
      console.log(`📢 Sent notification for ${boss.name} to ${textChannel.id}`);
    }

  } catch (error) {
    console.error('Error scanning for notifications:', error);
  }
}
