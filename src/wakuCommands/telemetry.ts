import { codeBlock } from '@discordjs/builders';
import { log } from 'console';
import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { WakuMessage } from 'js-waku';
import { Contracts } from '..';
import { GiveOptions } from '../commands';
import { Telemetry } from '../proto/telemetry';

// Process incoming telemetry messages
export default (
  client: Client<boolean>,
  _contracts: Map<number, Contracts>,
  _options: GiveOptions
) => {
  log('Waku: Monitoring telemetry');
  return (wakuMessage: WakuMessage) => {
    // No need to attempt to decode a message if the payload is absent
    log('Message received');
    if (!wakuMessage.payload) return;

    const msg: Telemetry = Telemetry.fromBinary(wakuMessage.payload);

    if (client.isReady()) {
      client.channels.fetch('966250783291101235').then((channel) => {
        if (msg.jsonPayloadOneof.oneofKind === 'json') {
          const TELEMETRY_EMBEDDED_MSG = new MessageEmbed()
            .setTitle('Videre Telemetry')
            .addField('Sending timestamp', msg.timestamp)
            .addField('Receiving timestamp', new Date().toISOString())
            .addField('Content topic', wakuMessage.contentTopic || 'None')
            .addField(
              'Parameters',
              codeBlock('json', msg.jsonPayloadOneof.json)
            );

          (channel as TextChannel).send({ embeds: [TELEMETRY_EMBEDDED_MSG] });
        }
      });
    }
  };
};
