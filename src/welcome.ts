import { type Browser } from 'webextension-polyfill';

import { ALL_HOST_PERMISSION } from './common/host-permission';
import { localizeDocument } from './common/localization';

declare const browser: Browser;

document.getElementById('grant')?.addEventListener('click', async () => {
  const granted = await browser.permissions.request(ALL_HOST_PERMISSION);
  if (granted) {
    window.close();
  }
});

localizeDocument();
