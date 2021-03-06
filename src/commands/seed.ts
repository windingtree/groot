import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction } from 'discord.js';
import { ContractTransaction, utils } from 'ethers';
import { GiveOptions } from '.';
import { Contracts } from '..';

export default {
  data: new SlashCommandBuilder()
    .setName('seed')
    .setDescription('Whitelist an address')
    .addStringOption((option) =>
      option
        .setName('address')
        .setDescription('Wallet address to be whitelisted and seeded')
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName('chain')
        .setDescription(
          'Which EVM chain to to whitelist and seed the address on'
        )
        .addChoices(
          { name: 'Gnosis Chain', value: 100 },
          { name: 'Sokol', value: 77 }
        )
    ),
  async execute(
    interaction: CommandInteraction<CacheType>,
    givers: Map<number, Contracts>,
    options: GiveOptions
  ) {
    const address = interaction.options.getString('address') || '';
    const chain = interaction.options.getNumber('chain', false) || Number(77);

    if (!utils.isAddress(address)) {
      await interaction.reply({
        content: 'Invalid ethereum address',
        ephemeral: true
      });
      return;
    } else if (!givers.has(chain)) {
      await interaction.reply({ content: 'Invalid chain', ephemeral: true });
      return;
    }

    // Input is valid, let's do the transaction
    const contract = (givers.get(chain) as Contracts).giver;
    contract
      .seed(address, options.wadGem, {
        value: options.wadGas
      })
      .then(handler(interaction));
  }
};


const handler = (interaction: CommandInteraction<CacheType>) => (successHandler(interaction), failureHandler(interaction))

const successHandler = (interaction: CommandInteraction<CacheType>) => (
  (tx: ContractTransaction) => {
    interaction.reply({
      content: `Transaction sent: ${tx.hash}`,
      ephemeral: true
    });
    tx.wait(1).then(
      (receipt) => {
        interaction.followUp({
          content: `Transaction successfully processed at block ${receipt.blockNumber}`,
          ephemeral: true
        });
      },
      (e) => {
        interaction.followUp({
          content: `Transaction failed`,
          ephemeral: true
        });
      }
    );
  }
)

const failureHandler = (interaction: CommandInteraction<CacheType>) => (
  (e: any) => {
    interaction.reply({
      content: `Transaction was not successfully sent to RPC: ${e}`,
      ephemeral: true
    });
  }
)