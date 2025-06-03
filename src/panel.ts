import { localizeDocument } from './common/localization';
import { getSelectorForHostname } from './common/options';
import { $ } from './content/helpers';

import type { Browser } from 'webextension-polyfill';
import type { ChangeSelectorMessage } from './types/messages';

declare const browser: Browser;

const selectorInput = $('#selector') as HTMLInputElement;
const clearButton = $('#clear');

async function setOrRemoveSelectorForHostname(
  hostname: string,
  selector: string,
): Promise<void> {
  if (selector) {
    return browser.storage.sync.set({
      [hostname]: {
        selector,
      },
    });
  } else {
    return browser.storage.sync.remove(hostname);
  }
}

async function initialize() {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  if (tabs.length === 0) {
    console.error(
      '[initialize] popup failed to retrieve the current active tab or its URL',
    );
    return;
  }

  const { url: tabUrl, id: tabId } = tabs[0];
  if (!tabUrl || !tabId) {
    return;
  }

  const { hostname } = new URL(tabUrl);
  selectorInput.value = (await getSelectorForHostname(hostname)) ?? '';

  let oldSelector = selectorInput.value;
  selectorInput.addEventListener('input', async () => {
    const newSelector = selectorInput.value.trim();

    await Promise.all([
      setOrRemoveSelectorForHostname(hostname, newSelector),
      browser.runtime.sendMessage<ChangeSelectorMessage>({
        action: 'changeSelector',
        oldSelector,
        newSelector,
        tabId,
      }),
    ]);

    oldSelector = newSelector;
  });

  selectorInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      window.close();
    }
  });

  clearButton.addEventListener('click', async () => {
    await Promise.all([
      browser.storage.sync.remove(hostname),
      browser.runtime.sendMessage<ChangeSelectorMessage>({
        action: 'changeSelector',
        oldSelector,
        newSelector: '',
        tabId,
      }),
    ]);
    window.close();
  });
}

localizeDocument();
void initialize();
