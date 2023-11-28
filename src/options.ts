import { localizeDocument } from './common/localization';
import { type Options, getOptions } from './common/options';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

async function initialize() {
  const displayToastElement = document.getElementById(
    'displayToast',
  ) as HTMLInputElement;

  displayToastElement.addEventListener('input', () => {
    browser.storage.sync.set({
      options: {
        displayToast: displayToastElement.checked,
      } as Options,
    });
  });

  const { displayToast } = await getOptions();
  displayToastElement.checked = displayToast;
}

initialize();
localizeDocument();
