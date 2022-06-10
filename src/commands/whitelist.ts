import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction } from 'discord.js';
import { ContractTransaction, utils } from 'ethers';
import { GiveOptions } from '.';
import { Contracts } from '..';

export default {
  data: new SlashCommandBuilder()
    .setName('whitelist')
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
    contracts: Map<number, Contracts>,
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
    } else if (!contracts.has(chain)) {
      await interaction.reply({ content: 'Invalid chain', ephemeral: true });
      return;
    }

    // Input is valid, let's do the transaction
    const contract = (contracts.get(chain) as Contracts).serviceProviderRegistry;
    contract
      .grantRole(utils.keccak256(utils.toUtf8Bytes('videre.roles.whitelist')), address)
      .then(successHandler(interaction))
      .catch(failureHandler(interaction));
  }
};

const successHandler = (interaction: CommandInteraction<CacheType>) => (
  async (tx: ContractTransaction) => {
    await interaction.reply({
      content: `Transaction sent: ${tx.hash}`,
      ephemeral: true
    });
    tx.wait(1).then(
      async (receipt) => {
        await interaction.followUp({
          content: `Transaction successfully processed at block ${receipt.blockNumber}`,
          ephemeral: true
        });
      },
      async (e) => {
        await interaction.followUp({
          content: `Transaction failed`,
          ephemeral: true
        });
      }
    );
  }
)

const failureHandler = (interaction: CommandInteraction<CacheType>) => (
  async (e: any) => {
    console.log(e);
    await interaction.reply({
      content: `Transaction was not successfully sent to RPC: ${e}`,
      ephemeral: true
    });
  }
)