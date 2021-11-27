const { Client, Intents, Events, DMChannel } = require('discord.js')
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

client.on('messageCreate', async (message) => {
  console.log('got message!', message.content)
  if (message.author.bot) {
    console.log('Do not reply to bots', message.author.tag)
    return
  }
  if (message.type !== 'DEFAULT') {
    console.log('Can only interact with default messages', message.type)
    return
  }
  if (message.channel instanceof DMChannel) {
    message.reply("I am a bot and can't reply, beep bop")
    return
  }

  if (secretChannel.test(message.content)) {
    const dmChannel = await message.author.createDM()
    await dmChannel.send('There is no #cow-level 🤫')
  } else if (noGmAllowed.test(message.content)) {
    await message.reply('Please mooooove your `gm` and `gn` to the #gm channel')
    await message.delete()
  }
})
