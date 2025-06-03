import { ALL_HOST_PERMISSION } from './common/host-permission';
import { localizeDocument } from './common/localization';
import { getOptions } from './common/options';
import { $ } from './content/helpers';

import type { Browser } from 'webextension-polyfill';
import type { Options } from './common/options';

declare const browser: Browser;

async function initialize() {
  // Permissions should have been granted by the user on installation, but in
  // case they weren't, un-hide the request here!
  if (!(await browser.permissions.contains(ALL_HOST_PERMISSION))) {
    const grantPermissionsContainer = $('#grantPermissionsContainer');

    grantPermissionsContainer.classList.remove('hidden');

    $('#grant').addEventListener('click', async () => {
      const granted = await browser.permissions.request(ALL_HOST_PERMISSION);
      if (granted) {
        grantPermissionsContainer.classList.add('hidden');
      }
    });
  }

  const displayToastElement = $('#displayToast') as HTMLInputElement;

  displayToastElement.addEventListener('input', async () => {
    await browser.storage.sync.set({
      options: {
        displayToast: displayToastElement.checked,
      } as Options,
    });
  });

  const { displayToast } = await getOptions();
  displayToastElement.checked = displayToast;
}

localizeDocument();
void initialize();
