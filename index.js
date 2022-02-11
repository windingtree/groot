const { Client, Intents, DMChannel } = require('discord.js')
const cowsay = require('cowsay')

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
})

client.login(process.env.BOT_TOKEN)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

const noGmAllowed = /^(gn|gm)(\s+|$)/i
const secretChannel = /^!join$/
const noCommands = /^!/
const noChannelTags = /^\s*\<#\d+\>\s*$/

// auto-replies
const wenToken = /.*wh?en (token|airdrop|drop|claim).*/i
const whereToken = /.*where (to |.*)(claim|airdrop).*/i
const howToClaim = /.*(how) (.*)(claim|airdrop).*/i
const whenTrade = /.*(wh?en|how|where) .*(trade|exchange|swap|sell).*/i
const whenGovernance = /a/i
const sellToken = /.*(where|how|wh?en).*(sell).*/i
const tokenPrice = /.*(what)?.*(token)? price.*/i
const wenMoon = /.*wh?en.*(mo+n|lambo).*/i

const wenMoonGifs = ['https://cdn.discordapp.com/attachments/869170255266734103/941755575073660959/44aafe91f10b22af690ccb7513d03779.gif',
  'https://c.tenor.com/YZWhYF-xV4kAAAAd/when-moon-admin.gif', 'https://c.tenor.com/5bScutaRZWgAAAAd/travolta-safemoon.gif', 'https://c.tenor.com/x-kqDAmw2NQAAAAC/parrot-party.gif']

let lastMoonIndex = -1

function getMoonGif() {
  lastMoonIndex += 1
  if (lastMoonIndex > wenMoonGifs.length - 1) {
    lastMoonIndex = 0
  }
  return wenMoonGifs[lastMoonIndex]
}

function codeBlock(message) {
  return '```' + message + '```'
}

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) {
      console.log('Do not reply to bots', message.author.tag)
      return
    }
    if (message.type !== 'DEFAULT') {
      console.log('Can only interact with default messages', message.type)
      return
    }
    if (message.channel instanceof DMChannel) {
      message.reply(
        codeBlock(cowsay.say({ text: "I am a bot and can't reply, beep bop" }))
      )
      return
    }

    if (noCommands.test(message.content)) {
      await message.reply(
        'Not a valid command. Actually, there are no valid commands, stop that :angry:'
      )

      if (secretChannel.test(message.content)) {
        const dmChannel = await message.author.createDM()
        await dmChannel.send(
          codeBlock(cowsay.say({ text: 'There is no #cow-level 🤫', p: true }))
        )
      }
      await message.delete()
    } else if (noChannelTags.test(message.content)) {
      await message.reply('Please stop tagging channels with no reason')
      await message.delete()
    } else if (noGmAllowed.test(message.content)) {
      await message.reply(
        'Please mooooove your `gm` and `gn` to the #gm channel'
      )
      await message.delete()
    } else if (wenToken.test(message.content)) {
      await message.reply('Soon! Check #announcements channel')
    } else if (whereToken.test(message.content)) {
      await message.reply('It will be visible on CowSwap once it is ready')
    } else if (howToClaim.test(message.content)) {
      await message.reply('Follow the instructions on https://medium.com/@cow-protocol/step-by-step-guide-for-claiming-vcow-in-gnosis-chain-b1a1442a3454')
    } else if (whenTrade.test(message.content) || sellToken.test(message.content)) {
      await message.reply('vCOW is a non-transferable governance token. CowDAO might vote to make it swapable via governance vote.\nWen? After airdop is complete\nWen? 6 weeks after initial deployment\nWen? Aprox. March 25th')
    } else if (tokenPrice.test(message.content)) {
      await message.reply('The price for investing is 0.15 USD per vCOW. The equivalent in GNO, ETH and xDAI (according to what option you have, if any) was defined at the proposal creation time.\nSee https://forum.gnosis.io/t/gip-13-phase-2-cowdao-and-cow-token/2735 or Pinned messages on #general for more details')
    } else if (wenMoon.test(message.content)) {
      await message.reply(getMoonGif())
    }
  } catch (e) {
    console.error('Something failed handling a message', e)
  }
})
