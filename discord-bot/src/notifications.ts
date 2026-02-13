
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
  setInterval(() => checkBosses(client), 60 * 1000);
  console.log('⏰ Notification scanner started (60s interval).');
}

async function checkBosses(client: Client) {
  try {
    // Get notification channel
    const [settings] = await pool.query<RowDataPacket[]>(
      "SELECT setting_value FROM bot_settings WHERE setting_key = 'notification_channel'"
    );

    if (settings.length === 0) return; // No channel set
    const channelId = settings[0].setting_value;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel || !(channel instanceof TextChannel)) {
      console.warn(`⚠️ Notification channel ${channelId} not found or not text.`);
      return;
    }

    // Get bosses spawning in roughly 10 minutes (9.5 - 10.5 minute window)
    // Using a tight 1-minute window to avoid duplicate alerts on the next scan
    const [bosses] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM bosses 
      WHERE next_spawn_at BETWEEN DATE_ADD(NOW(), INTERVAL 9 MINUTE 30 SECOND) 
                              AND DATE_ADD(NOW(), INTERVAL 10 MINUTE 30 SECOND)
    `);

    if (bosses.length === 0) return;

    for (const boss of bosses) {
      // Build notification
      const spawnTime = new Date(boss.next_spawn_at);
      const unixTime = Math.floor(spawnTime.getTime() / 1000);
      
      const imagePath = `../frontend/public/bosses/${boss.name.toLowerCase()}.png`;
      const attachmentName = `${boss.name.toLowerCase()}.png`;

      const embed = new EmbedBuilder()
        .setTitle(`${boss.name} spawning in ~10 minutes!`)
        .setDescription('Get ready for the boss spawn!')
        .setColor(0xE67E22) // Orange-ish like the screenshot
        .setThumbnail(`attachment://${attachmentName}`)
        .addFields(
          { name: 'Level', value: String(boss.level || '??'), inline: true },
          { name: 'Location', value: boss.location || 'Unknown', inline: true },
          { name: 'Attack Type', value: boss.attack_type || 'Unknown', inline: true },
          // Removed Continent as column may not exist
          { name: 'Spawns At', value: `<t:${unixTime}:T> (<t:${unixTime}:R>)`, inline: false }
        );

      await channel.send({ 
        embeds: [embed],
        files: [{ attachment: imagePath, name: attachmentName }]
      });
      console.log(`📢 Sent notification for ${boss.name} to ${channel.name}`);
    }

  } catch (error) {
    console.error('Error scanning for notifications:', error);
  }
}
