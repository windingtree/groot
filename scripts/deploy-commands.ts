import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import 'dotenv/config';
import ping from '../src/commands/ping';
import seed from '../src/commands/seed';
import server from '../src/commands/server';
import user from '../src/commands/user';

const commands = [ping.data, server.data, user.data, seed.data].map((command) =>
  command.toJSON()
);

const rest = new REST({ version: '9' }).setToken(
  process.env.BOT_TOKEN as string
);

rest
  .put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID as string,
      process.env.GUILD_ID as string
    ),
    { body: commands }
  )
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
