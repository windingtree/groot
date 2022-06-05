import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import 'dotenv/config'

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!'),
  new SlashCommandBuilder()
    .setName('server')
    .setDescription('Replies with server info!'),
  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with user info!')
].map((command) => command.toJSON())

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN as string)

rest
  .put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID as string,
      process.env.GUILD_ID as string
    ),
    { body: commands }
  )
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)