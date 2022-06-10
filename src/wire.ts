import { log } from 'console';
import { Client } from 'discord.js';
import { Waku } from 'js-waku';
import { GiveOptions } from './commands';
import telemetry from './wakuCommands/telemetry';
import beg from './wakuCommands/beg';
import { Contracts } from '.';

// connect to waku
export default async (
  wakuPeers: string[],
  client: Client<boolean>,
  contracts: Map<number, Contracts>,
  options: GiveOptions
): Promise<Waku> => {
  const waku = await Waku.create({
    bootstrap: {
      maxPeers: 6,
      peers: wakuPeers
    }
  });

  // Wait to be connected to at least one peer
  await new Promise((resolve, reject) => {
    // If we are not connected to any peer within 10sec, let's just reject
    // As we are not implementing connection management in this example

    setTimeout(reject, 10000);
    waku.libp2p.connectionManager.on('peer:connect', () => {
      log('Peer connected');
      resolve(null);
    });
  });

  // display telemetry
  waku.relay.addObserver(telemetry(client, contracts, options), [
    '/videre/stays/1/telemetry/proto'
  ]);

  // display and handle begging (they're after gas!)
  waku.relay.addObserver(beg(client, contracts, options), [
    '/videre/genesis/1/seed/proto'
  ]);

  return waku;
};
