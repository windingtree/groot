import { DMChannel, Message, MessageEmbed } from 'discord.js';

const log = console.log;

const noGmAllowed = /^(gn|gm)(\s+|$)/i;
const noHello = /^(hi+|hey|hello|h?ola)!?\s*$/i;
const secretChannel = /^!join$/;
const noCommands = /^!/;
const verifyCommand = /^!verify/;
const noChannelTags = /^\s*\\<#\d+\\>\s*$/;

// auto-replies
const whereToken = /.*where (to |.*)(claim|airdrop).*/i;
const howToClaim = /.*(how) (.*)(claim|airdrop).*/i;
const whenTrade = /.*(wh?en|how|where) .*(trade|exchange|swap|sell|listing).*/i;
const isTradeable = /.*(is|can) (trade(able)?|list(ed)?).*/i;
const wenVote = /.*(wh?en) .*(vote|voting).*/i;
const sellToken = /.*(where|how|wh?en).*(sell).*/i;
const tokenPrice = /.*(what)?.*(token)? price.*/i;
const wenMoon = /.*(wh?en|where).*mo+n.*/i;
const wenLambo = /.*(wh?en|where).*lambo.*/i;
const meaningOfLife = /.*meaning of life.*/i;
const wenBinance = /.*wh?en binance.*/i;
const wenTracking = /.*(wh?en) .*(price)? tracking.*/i;
const contractAddress = /.*(contract|token) .*address.*/i;
const totalSupply = /.*(total|max|maximum|token) supply.*/i;
const addGChain =
  /.*add (gchain|gnosis ?chain|xdai)( to (mm|metamask|mmask|wallet))?.*/i;
const howToSwap = /.*(how (to )?swap|LIF1 to LIF2).*/i;

const wenMoonGifs: string[] = [
  'https://c.tenor.com/YZWhYF-xV4kAAAAd/when-moon-admin.gif',
  'https://c.tenor.com/x-kqDAmw2NQAAAAC/parrot-party.gif',
  'https://c.tenor.com/R6Zf7aUegagAAAAd/lambo.gif'
];

const wenLamboGifs: string[] = [
  'https://c.tenor.com/5bScutaRZWgAAAAd/travolta-safemoon.gif',
  'https://c.tenor.com/_dae-kRV6jUAAAAS/lambo-cardboard.gif',
  'https://c.tenor.com/R6Zf7aUegagAAAAd/lambo.gif'
];

const meaningOfLifeGifs: string[] = [
  'https://pa1.narvii.com/6331/0e0ef4cfaf24742e0ca39e79a4df2a1aff6f928c_hq.gif',
  'https://i.giphy.com/media/dYgDRfc61SGtO/giphy.webp',
  'https://i.giphy.com/media/OY9XK7PbFqkNO/giphy.webp'
];

const dunnoGifs: string[] = [
  'https://i.giphy.com/media/Ll2fajzk9DgaY/giphy.webp',
  'https://media3.giphy.com/media/3ornjSL2sBcPflIDiU/giphy.gif?cid=790b7611a6dda9fdddbbdf71cdfa0e041f5b7ca24c516d90&rid=giphy.gif&ct=g',
  'https://i.giphy.com/media/y65VoOlimZaus/giphy.webp',
  'https://i.giphy.com/media/4HnRkHk77nStQSGxgi/giphy.webp'
];

function pickFromList(list: string | string[]) {
  let count = -1;
  return () => {
    count += 1;
    if (count > list.length - 1) {
      count = 0;
    }
    return list[count];
  };
}

const pickMoon = pickFromList(wenMoonGifs);
const pickLambo = pickFromList(wenLamboGifs);
const pickMeaningOfLife = pickFromList(meaningOfLifeGifs);
const pickDunno = pickFromList(dunnoGifs);

function helloMsgReply(msg: string) {
  if (msg.length < 2) {
    return 'Hi';
  }
  const normalized = msg.replace(/\s+/g, ' ').toLowerCase();
  return `${normalized[0].toUpperCase()}${normalized.substring(1)}`;
}

const ADDRESSES_EMBEDDED_MSG = new MessageEmbed()
  .setTitle('WindingTree relevant addresses')
  .addField(
    'Ethereum',
    `
  - Community multisig Safe: [\`eth:0x876969b13dcf884C13D4b4f003B69229E6b7966A\`](https://gnosis-safe.io/app/eth:0x876969b13dcf884C13D4b4f003B69229E6b7966A)
  - LIF2 Token: [\`0x9c38688e5acb9ed6049c8502650db5ac8ef96465\`](https://etherscan.io/token/0x9c38688e5acb9ed6049c8502650db5ac8ef96465)
  - LIF1 Token: [\`0xEB9951021698B42e4399f9cBb6267Aa35F82D59D\`](https://etherscan.io/token/0xEB9951021698B42e4399f9cBb6267Aa35F82D59D) **DEPRECATED**`
  )
  .addField(
    'Gnosis Chain',
    `
  - Community multisig Safe:  [\`gno:0x07AED86bda7B36079296C1D94C12d6F48Beeb86C\`](https://gnosis-safe.io/app/gno:0x07AED86bda7B36079296C1D94C12d6F48Beeb86C)
  - LIF2 Token: [\`0x2E9D0492A53eE882918c6db662aC37a4F344db93\`](https://blockscout.com/xdai/mainnet/token/0x2E9D0492A53eE882918c6db662aC37a4F344db93)
  `
  );

export default async (message: Message<boolean>) => {
  try {
    if (message.author.bot) {
      log('Do not reply to bots', message.author.tag);
      return;
    }
    if (message.type !== 'DEFAULT') {
      log('Can only interact with default messages', message.type);
      return;
    }
    if (message.channel instanceof DMChannel) {
      await message.reply(`I am a bot and can't reply, beep bop`);
      return;
    }

    if (noChannelTags.test(message.content)) {
      await message.reply('Please stop tagging channels with no reason');
      await message.delete();
    } else if (noGmAllowed.test(message.content)) {
      await message.reply(
        'Please move your `gm` and `gn` to the #????-gm channel'
      );
      await message.delete();
    } else if (noHello.test(message.content)) {
      await message.reply(
        `${helloMsgReply(
          message.content
        )} nice to see you too! Next time please move your \`hi\` messages to the #????-gm channel`
      );
      await message.delete();
    } else if (wenMoon.test(message.content)) {
      await message.reply(pickMoon());
    } else if (wenLambo.test(message.content)) {
      await message.reply(pickLambo());
    } else if (meaningOfLife.test(message.content)) {
      await message.reply(pickMeaningOfLife());
    } else if (wenBinance.test(message.content)) {
      await message.reply(pickDunno());
    } else if (wenTracking.test(message.content)) {
      await message.reply(pickDunno());
    } else if (wenVote.test(message.content)) {
      await message.reply(
        'Any active vote will be visible on the snapshot page https://snapshot.org/#/windingtree.eth. For current proposal in the discussion phase, check the repo (https://github.com/windingtree/wips)'
      );
    } else if (contractAddress.test(message.content)) {
      await message.channel.send({ embeds: [ADDRESSES_EMBEDDED_MSG] });
    } else if (totalSupply.test(message.content)) {
      await message.reply(
        "LIF's total supply is 24,976,439.45. For more information, check https://etherscan.io/token/0x9c38688e5acb9ed6049c8502650db5ac8ef96465"
      );
    } else if (addGChain.test(message.content)) {
      await message.reply(
        'To add Gnosis Chain to your wallet:\n1. go to https://chainlist.org/\n2. Search for Gnosis Chain\n3. Connect your wallet\n4. Click on "Add to Metamask"'
      );
    } else if (howToSwap.test(message.content)) {
      await message.reply(
        'Go to https://lif.windingtree.com/.\n1. Connect your wallet (Metamask - if using trezor or ledger, connect these to Metamask)\n2. Approve LIF2 to exchange your tokens.\n3. Execute the swap from LIF1 to LIF2.'
      );
    }
  } catch (e) {
    console.error('Something failed handling a message', e);
  }
};
