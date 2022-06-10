import { Client, Intents } from 'discord.js';
import 'dotenv/config';
import { providers, utils, Wallet } from 'ethers';
import { HDNode } from 'ethers/lib/utils';
import {
  Giver,
  Giver__factory,
  LineRegistry,
  LineRegistry__factory,
  ServiceProviderRegistry,
  ServiceProviderRegistry__factory
} from './typechain';
import moderator from './moderator';
import commands, { GiveOptions } from './commands';
import wire from './wire';

const log = console.log;

// --- blockchain configuration

export type Contracts = {
  giver: Giver;
  lineRegistry: LineRegistry;
  serviceProviderRegistry: ServiceProviderRegistry;
};

const contracts = new Map<number, Contracts>();
const wallet = new Wallet(
  HDNode.fromMnemonic(process.env.MNEMONIC as string).privateKey
);

const chainProviders = {
  77: wallet.connect(new providers.JsonRpcProvider('https://sokol.poa.network'))
};

// add sokol giver contract
contracts.set(77, {
  giver: Giver__factory.connect(
    '0xb2BF9a28A7f92153686F94C71883f360D546a27C',
    chainProviders[77]
  ),
  lineRegistry: LineRegistry__factory.connect(
    '0xE7de8c7F3F9B24F9b8b519035eC53887BE3f5443',
    chainProviders[77]
  ),
  serviceProviderRegistry: ServiceProviderRegistry__factory.connect(
    '0xC1A95DD6184C6A37A9Dd7b4b5E7DfBd5065C8Dd5',
    chainProviders[77]
  )
});

// set default giving options
const options: GiveOptions = {
  wadGem: utils.parseEther('1000'),
  wadGas: utils.parseEther('0.1')
};

log('Groot blockchain configuration');
log('Wallet:', wallet.address);
for (const chain of contracts.keys()) {
  const chainContracts = contracts.get(77) as Contracts
  log(`Chain ${chain}`);
  log(`* giver: ${chainContracts.giver.address}`)
  log(`* line registry: ${chainContracts.lineRegistry.address}`)
  log(`* service provider registry: ${chainContracts.serviceProviderRegistry.address}`)
}

// --- waku configuration

const wakuPeers = [
  '/dns4/node-01.us-east-1.waku.windingtree.com/tcp/443/wss/p2p/16Uiu2HAmHXSN2XDZXdy8Dvyty5LtT7iSnWLGLMPoYbBnHaKeURxb',
  '/dns4/node-01.eu-central-1.waku.windingtree.com/tcp/443/wss/p2p/16Uiu2HAmV2PXCqrrjHbkceguC4Y2q7XgmzzYfjEgd69RvAU3wKvU',
  '/dns4/node-01.ap-southeast-2.waku.windingtree.com/tcp/443/wss/p2p/16Uiu2HAmGdTv8abaCW2BHYUhGeH97x7epzzbRY1CsgPbKhiJUB6C'
];

log('Waku configuration');
for (const peer of wakuPeers) {
  log(`Peer: ${peer}`);
}

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES
  ]
});

client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
  if (client.user) log(`Logged in as ${client.user.tag}!`);
});

// Slash commands
client.on('interactionCreate', commands(contracts, options));

// Automatically reply to messages in chat / delete some messages
client.on('messageCreate', moderator);

// Monitor waku
const waku = wire(wakuPeers, client, contracts, options);
