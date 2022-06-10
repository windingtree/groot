import { CacheType, Interaction } from 'discord.js';
import { BigNumberish } from 'ethers';
import { Contracts } from '..';
import ping from './ping';
import seed from './seed';
import server from './server';
import user from './user';

export interface GiveOptions {
  wadGem: BigNumberish;
  wadGas: BigNumberish;
}

export default (contracts: Map<number, Contracts>, options: GiveOptions) =>
  async (interaction: Interaction<CacheType>) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
      ping.execute(interaction);
    } else if (commandName === 'server' && interaction.guild) {
      server.execute(interaction);
    } else if (commandName === 'user') {
      user.execute(interaction);
    } else if (commandName === 'seed') {
      seed.execute(interaction, contracts, options);
    }
  };
