import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express';
import { handleKillCommand, handleAllBossesCommand, handleSetChannelCommand } from './commands';
import { startNotificationScanner } from './notifications';

dotenv.config();

// Create a simple Express server for health checks (required for some hosting platforms like Render)
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Discord Bot is running!');
});

app.listen(port, () => {
  console.log(`Health check server listening on port ${port}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// The 'ready' event was renamed to 'clientReady' in discord.js v15. Listen for
// the new event and also keep listening to 'ready' for backwards compatibility.
// Ensure the handler only runs once even if both events fire in some envs.
let _readyHandled = false;
function handleClientReady() {
  if (_readyHandled) return;
  _readyHandled = true;

  console.log(`Logged in as ${client.user?.tag}!`);

  // Start the notification scanner
  startNotificationScanner(client);

  // Generate an invite link for the bot
  const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=277025773568&scope=bot`;
  console.log(`Invite link: ${inviteLink}`);
}

client.once('clientReady', handleClientReady);
client.once('ready', handleClientReady);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  // Support both prefix (!) and no prefix commands
  if (command === 'kill' || command === '!kill') {
    await handleKillCommand(message, args);
  } else if (command === 'bosslist' || command === '!bosslist') {
    await handleAllBossesCommand(message);
  } else if (command === 'setchannel' || command === '!setchannel') {
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