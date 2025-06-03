import { ALL_HOST_PERMISSION } from './common/host-permission';
import { getSelectorForHostname } from './common/options';

import type { Browser, Runtime } from 'webextension-polyfill';
import type { Options, SelectorsByHostnamesRecord } from './common/options';
import type {
  MessageToBackground,
  ToastNewSelectorMessage,
} from './types/messages';

declare const browser: Browser;

const SELECTORS_ORDER: readonly string[] = ['', 'p', 'article'];

function cssRule(selector: string) {
  return `${selector} { text-align: justify !important; hyphens: auto !important; }`;
}

async function activateOnTabByHostname(tabId: number, hostname: string) {
  const existingSelector = await getSelectorForHostname(hostname);
  if (existingSelector) {
    return activateOnTabBySelector(tabId, '', existingSelector);
  }
}

async function activateOnTabBySelector(
  tabId: number,
  oldSelector: string,
  newSelector: string,
) {
  await Promise.all([
    oldSelector
      ? browser.scripting.removeCSS({
          css: cssRule(oldSelector),
          target: { tabId },
        })
      : Promise.resolve(),
    newSelector
      ? browser.scripting.insertCSS({
          css: cssRule(newSelector),
          target: { tabId },
        })
      : Promise.resolve(),
    updatePageActionData(tabId, newSelector),
  ]);
}

async function updatePageActionData(tabId: number, selector: string) {
  if (selector) {
    await browser.pageAction.setIcon({ path: 'icons/active.svg', tabId });
    browser.pageAction.setTitle({
      title: browser.i18n.getMessage('pageActionOnTitle', [selector]),
      tabId,
    });
  } else {
    await Promise.all([
      browser.pageAction.setIcon({ path: undefined, tabId }),
      browser.pageAction.setPopup({ popup: '', tabId }),
    ]);
    browser.pageAction.setTitle({ title: null, tabId });
  }
}

async function setNextBuiltInSelector(tabId: number, tabUrl?: string) {
  if (!tabUrl) {
    console.warn('[setNextBuiltInSelector] No URL found for the current tab', {
      tabId,
    });
    return;
  }
  const hostname = new URL(tabUrl).hostname;

  const oldSelector = (await getSelectorForHostname(hostname)) ?? '';
  const newSelector =
    SELECTORS_ORDER[
      (SELECTORS_ORDER.indexOf(oldSelector) + 1) % SELECTORS_ORDER.length
    ];
  await Promise.all([
    activateOnTabBySelector(tabId, oldSelector, newSelector),
    browser.storage.sync.set({
      [hostname]: {
        selector: newSelector,
      },
    } as SelectorsByHostnamesRecord),
    browser.tabs.sendMessage<ToastNewSelectorMessage>(tabId, {
      action: 'toastNewSelector',
      selector: newSelector,
    }),
  ]);
}

browser.runtime.onMessage.addListener(
  async (_message: unknown, sender: Runtime.MessageSender) => {
    const message = _message as MessageToBackground;
    if (!('action' in message)) {
      console.warn(
        '[browser.runtime.onMessage] listener invoked with invalid message',
        { message: _message, sender },
      );
      return;
    }

    const tabId =
      sender.tab?.id ?? (message.action == 'changeSelector' && message.tabId);
    if (!tabId) {
      console.warn(
        '[browser.runtime.onMessage] listener invoked with missing tab ID',
        { message, sender },
      );
      return;
    }

    switch (message.action) {
      case 'activateOnHostname':
        return activateOnTabByHostname(tabId, message.hostname);

      case 'changeSelector':
        return activateOnTabBySelector(
          tabId,
          message.oldSelector,
          message.newSelector,
        );
    }
  },
);

browser.pageAction.onClicked.addListener(async (tab, info) => {
  const tabId = tab.id;
  if (!tabId) {
    console.warn(
      '[browser.pageAction.onClicked] listener invoked with missing tab ID',
      { tab },
    );
    return;
  }

  switch (info?.button) {
    case 1:
      // I'm not sure why, but awaiting these calls breaks the popup opening.
      // If you know why, please open an issue!
      void browser.pageAction.setPopup({ popup: 'panel.html', tabId });
      void browser.pageAction.openPopup();
      void browser.pageAction.setPopup({ popup: '', tabId });
      break;

    default:
      return setNextBuiltInSelector(tabId, tab.url);
  }
});

browser.runtime.onInstalled.addListener(async ({ previousVersion }) => {
  // Returns true if the "other" SemVer is newer than the "pivot" SemVer.
  function semVerIsOlder(other: string, pivot: string) {
    return other.localeCompare(pivot, undefined, { numeric: true }) === -1;
  }

  // Migrate settings from previous versions of Justify It.
  if (previousVersion && semVerIsOlder(previousVersion, '1.0.11')) {
    const { displayToast } = await browser.storage.sync.get('displayToast');
    if (displayToast !== undefined) {
      await browser.storage.sync.set({
        options: { displayToast } as Options,
      });
      await browser.storage.sync.remove('displayToast');
    }
  }

  if (!(await browser.permissions.contains(ALL_HOST_PERMISSION))) {
    await browser.tabs.create({
      active: true,
      url: browser.runtime.getURL('welcome.html'),
    });
  }
});
