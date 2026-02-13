import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { handleKillCommand, handleAllBossesCommand, handleSetChannelCommand } from './commands';
import { startNotificationScanner } from './notifications';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  
  // Start the notification scanner
  startNotificationScanner(client);
  
  // Generate an invite link for the bot
  const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=277025773568&scope=bot`;
  console.log(`Invite link: ${inviteLink}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'kill') {
    await handleKillCommand(message, args);
  } else if (command === 'bosslist') {
    await handleAllBossesCommand(message);
  } else if (command === 'setchannel') {
    await handleSetChannelCommand(message);
  }
});

// Try to get token from multiple environment variables
const token = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;

if (!token) {
  console.error('Error: Discord bot token not found!');
  console.error('Please set DISCORD_BOT_TOKEN (or BOT_TOKEN) in your environment variables or .env file.');
  process.exit(1);
}

client.login(token);