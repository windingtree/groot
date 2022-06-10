import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with user info!'),
  async execute(interaction: CommandInteraction<CacheType>) {
    await interaction.reply(
      `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
    );
  }
};
