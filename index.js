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
    } else if (noGmAllowed.test(message.content)) {
      await message.reply(
        'Please mooooove your `gm` and `gn` to the #gm channel'
      )
      await message.delete()
    }
  } catch (e) {
    console.error('Something failed handling a message', e)
  }
})
