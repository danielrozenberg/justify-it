import { getSelectorForHostname } from './common/options';

import type { MessageToBackground } from './types/messages';
import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

const selectorInput = document.getElementById('selector') as HTMLInputElement;
const clearButton = document.getElementById('clear') as HTMLButtonElement;

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
  const [tab] = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  if (!tab) {
    console.error(
      '[initialize] popup failed to retrieve the current active tab or its URL',
    );
    return;
  }

  const { url: tabUrl, id: tabId } = tab;
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
      browser.runtime.sendMessage({
        action: 'changeSelector',
        oldSelector,
        newSelector,
        tabId,
      } as MessageToBackground),
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
      browser.runtime.sendMessage({
        action: 'changeSelector',
        oldSelector,
        newSelector: '',
        tabId,
      } as MessageToBackground),
    ]);
    window.close();
  });
}
initialize();
