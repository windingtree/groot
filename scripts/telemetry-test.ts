import { Waku, WakuMessage } from 'js-waku';
import { Telemetry } from '../src/proto/telemetry';
import 'dotenv/config';

const log = console.log;

// connect to waku
export async function initWaku(): Promise<Waku> {
  // Connect to waku
  const waku = await Waku.create({
    bootstrap: {
      /*default: true*/
      maxPeers: 6,
      peers: [
        '/dns4/node-01.us-east-1.waku.windingtree.com/tcp/443/wss/p2p/16Uiu2HAmHXSN2XDZXdy8Dvyty5LtT7iSnWLGLMPoYbBnHaKeURxb',
        '/dns4/node-01.eu-central-1.waku.windingtree.com/tcp/443/wss/p2p/16Uiu2HAmV2PXCqrrjHbkceguC4Y2q7XgmzzYfjEgd69RvAU3wKvU',
        '/dns4/node-01.ap-southeast-2.waku.windingtree.com/tcp/443/wss/p2p/16Uiu2HAmGdTv8abaCW2BHYUhGeH97x7epzzbRY1CsgPbKhiJUB6C'
      ]
    }
  });

  await waku.waitForRemotePeer(undefined, 10000);
  log('...Connected');

  return waku;
}

(async () => {
  // connect to waku
  const waku = await initWaku();
  const telemetry = {
    name: 'test of telemetry service'
  };
  const msg: Telemetry = {
    jsonPayloadOneof: {
      oneofKind: 'json',
      json: JSON.stringify(telemetry)
    },
    timestamp: new Date().toISOString()
  };
  WakuMessage.fromBytes(
    Telemetry.toBinary(msg),
    '/videre/stays/1/telemetry/proto'
  ).then((value) => {
    waku.lightPush.push(value).then(() => {
      log('Telemetry sent');
    });
  });
})();
