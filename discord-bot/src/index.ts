import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express'; // Import express
import { handleKillCommand, handleAllBossesCommand } from './commands';

dotenv.config();

// Create a simple web server to keep render happy
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Discord Bot is running!');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = '!';

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  
  // Generate an invite link for the bot
  const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=277025773568&scope=bot`;
  console.log(`🔗 Invite the bot to your server: ${inviteLink}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'kill') {
    await handleKillCommand(message, args);
  } else if (command === 'bosslist') {
    await handleAllBossesCommand(message);
  }
});

// Start the bot
if (process.env.DISCORD_BOT_TOKEN) {
  client.login(process.env.DISCORD_BOT_TOKEN).catch(console.error);
} else {
  console.log('DISCORD_BOT_TOKEN not found, skipping bot startup.');
}
