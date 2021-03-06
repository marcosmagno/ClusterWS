import { UWebSocket } from '../uws/client';
import { logWarning, logReady, logError } from '../../utils/functions';
import { CustomObject, Message, Listener } from '../../utils/types';

export function BrokerClient(url: string, broadcaster: CustomObject, tries: number = 0, reconnected?: boolean): void {
  let websocket: CustomObject = new UWebSocket(url);

  websocket.on('open', (): void => {
    tries = 0;
    broadcaster.setBroker(websocket, url);
    reconnected && logReady(`Broker has been connected to ${url} \n`);
  });

  websocket.on('close', (code: number, reason: string): void => {
    websocket = null;
    logWarning(`Broker has disconnected, system is trying to reconnect to ${url} \n`);
    setTimeout(() => BrokerClient(url, broadcaster, ++tries, true), Math.floor(Math.random() * 1000) + 500);
  });

  websocket.on('error', (err: Error): void => {
    websocket = null;
    if (tries === 5)
      logWarning(`Can not connect to the Broker ${url}. System in reconnection please check your Broker and Token\n`);
    setTimeout(
      () => BrokerClient(url, broadcaster, ++tries, reconnected || tries > 5),
      Math.floor(Math.random() * 1000) + 500
    );
  });

  websocket.on('message', (message: Message): void => broadcaster.broadcastMessage(null, message));
}
