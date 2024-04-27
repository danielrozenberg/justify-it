import { ToastController } from './content/toast';

import type { MessageToBackground, MessageToContent } from './types/messages';
import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

const { hostname } = window.location;
const toastController = new ToastController();

browser.runtime.onMessage.addListener(async (message: MessageToContent) => {
  switch (message.action) {
    case 'toastNewSelector':
      toastController.displayToast(message.selector);
      break;
  }
});

browser.runtime.sendMessage({
  action: 'activateOnHostname',
  hostname,
} as MessageToBackground);
