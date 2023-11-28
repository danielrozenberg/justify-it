import { ALL_HOST_PERMISSION } from './common/host-permission';
import { localizeDocument } from './common/localization';
import { type Options, getOptions } from './common/options';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

async function initialize() {
  // Permissions should have been granted by the user on installation, but in
  // case they weren't, un-hide the request here!
  if (!(await browser.permissions.contains(ALL_HOST_PERMISSION))) {
    const grantPermissionsContainer = document.getElementById(
      'grantPermissionsContainer',
    ) as HTMLDivElement;

    grantPermissionsContainer.classList.remove('hidden');

    document.getElementById('grant')?.addEventListener('click', async () => {
      const granted = await browser.permissions.request(ALL_HOST_PERMISSION);
      if (granted) {
        grantPermissionsContainer.classList.add('hidden');
      }
    });
  }

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
