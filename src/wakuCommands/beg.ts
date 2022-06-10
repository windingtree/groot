import { codeBlock } from '@discordjs/builders';
import { log } from 'console';
import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { constants, utils } from 'ethers';
import { WakuMessage } from 'js-waku';
import { GiveOptions } from '../commands';
import { Beg } from '../proto/seed';
import { beg as EIP712Beg } from '@windingtree/stays-models/dist/cjs/eip712';
import { Contracts } from '..';
import { eip712Domain } from '../config';
import { ServiceProviderRegistry } from '../typechain';

// Process incoming beg message
export default (
  client: Client<boolean>,
  contracts: Map<number, Contracts>,
  options: GiveOptions
) => {
  log('Waku: Helping beggars');
  return async (wakuMessage: WakuMessage) => {
    // No need to attempt to decode a message if the payload is absent
    if (!wakuMessage.payload) return;
    log('Beg message received');

    const msg: Beg = Beg.fromBinary(wakuMessage.payload);

    // iterate through all the chains to find out which chain this was sent on
    const chains = contracts.keys()
    let chain = 0;
    let beggar = '';

    for await (const _chain of chains) {
      beggar = utils.verifyTypedData(
        { chainId: '_chain', ...eip712Domain },
        EIP712Beg.Beg,
        msg.what,
        msg.signature
      )

      const serviceProviderRegistry = contracts.get(_chain)?.serviceProviderRegistry as ServiceProviderRegistry
      
      if (await serviceProviderRegistry.hasRole(utils.keccak256(utils.toUtf8Bytes('WHITELIST_ROLE')), beggar)) {
        chain = _chain
      }
    }

    if (chain > 0 && beggar.length > 0) {
      // found a legit beggar, just need to send them some gas, we can do this
      // direct from our wallet.

      const tx = (contracts.get(chain) as Contracts).giver.signer.sendTransaction({
        to: beggar,
        value: options.wadGas
      });
  
    }

    // Just need to send them some gas, we can do this direct from our wallet.

    if (client.isReady()) {
      client.channels.fetch('966250783291101235').then((channel) => {
        const TELEMETRY_EMBEDDED_MSG = new MessageEmbed()
          .setTitle('Beg')
          .addField('Content topic', wakuMessage.contentTopic || 'None')
          .addField('Receiving timestamp', new Date().toISOString())
          .addField('Who', beggar);

        (channel as TextChannel).send({ embeds: [TELEMETRY_EMBEDDED_MSG] });
      });
    }
  };
};
