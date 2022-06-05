import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import { utils } from 'ethers'
import { GiveOptions } from '..'
import { Giver } from '../typechain'

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
    givers: Map<number, Giver>,
    options: GiveOptions
  ) {
    const address = interaction.options.getString('address') || ''
    const chain = interaction.options.getNumber('chain', false) || Number(77)

    if (!utils.isAddress(address)) {
      await interaction.reply({
        content: 'Invalid ethereum address',
        ephemeral: true
      })
      return
    } else if (!givers.has(chain)) {
      await interaction.reply({ content: 'Invalid chain', ephemeral: true })
      return
    }

    // Input is valid, let's do the transaction
    const contract = givers.get(chain) as Giver
    contract
      .seed(address, options.wadGem, {
        value: options.wadGas,
        gasLimit: 800000,
        maxFeePerGas: utils.parseUnits('20', 'gwei'),
        maxPriorityFeePerGas: utils.parseUnits('20', 'gwei')
      })
      .then(
        (tx) => {
          interaction.reply({ content: `Transaction sent: ${tx.hash}`, ephemeral: true })
          tx.wait(1).then(
            (receipt) => {
              interaction.followUp({
                content: `Transaction successfully processed at block ${receipt.blockNumber}`,
                ephemeral: true
              })
            },
            (e) => {
              interaction.followUp({
                content: `Transaction was not successfully mined: ${e}`,
                ephemeral: true
              })
            }
          )
        },
        (e) => {
          interaction.reply({
            content: `Transaction was not successfully sent to RPC: ${e}`,
            ephemeral: true
          })
        }
      )
  }
}
