import { ToastController } from './content/toast';

import type { Browser } from 'webextension-polyfill';
import type {
  ActivateOnHostnameMessage,
  MessageToContent,
} from './types/messages';

declare const browser: Browser;

const { hostname } = window.location;
const toastController = new ToastController();

browser.runtime.onMessage.addListener(async (_message: unknown) => {
  const message = _message as MessageToContent;
  if (!('action' in message)) {
    console.warn(
      '[browser.runtime.onMessage] listener invoked with invalid message',
    );
    return;
  }

  switch (message.action) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case 'toastNewSelector':
      return toastController.displayToast(message.selector);

    default:
      console.warn(
        '[browser.runtime.onMessage] listener invoked with invalid message',
        { message: _message },
      );
      return;
  }
});

void browser.runtime.sendMessage<ActivateOnHostnameMessage>({
  action: 'activateOnHostname',
  hostname,
});
