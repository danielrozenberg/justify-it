import { ALL_HOST_PERMISSION } from './common/host-permission';
import {
  type SelectorsByHostnames,
  getSelectorForHostname,
  type Options,
} from './common/options';

import type { MessageToBackground, MessageToContent } from './types/messages';
import type { Browser } from 'webextension-polyfill';

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
    await Promise.all([
      browser.pageAction.setIcon({ path: 'icons/active.svg', tabId }),
      browser.pageAction.setTitle({
        title: browser.i18n.getMessage('pageActionOnTitle', [selector]),
        tabId,
      }),
    ]);
  } else {
    await Promise.all([
      browser.pageAction.setIcon({ path: undefined, tabId }),
      browser.pageAction.setTitle({ title: null, tabId }),
      browser.pageAction.setPopup({ popup: '', tabId }),
    ]);
  }
}

async function setNextBuiltInSelector(tabId: number, tabUrl?: string) {
  // `tab.url` is missing on Firefox for Android, so ask for it from the tab's
  // `browser.runtime.onMessage` handler.
  const hostname = tabUrl
    ? new URL(tabUrl).hostname
    : await browser.tabs.sendMessage(tabId, { action: 'hostname' });

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
    } as SelectorsByHostnames),
    browser.tabs.sendMessage(tabId, {
      action: 'toastNewSelector',
      selector: newSelector,
    } as MessageToContent),
  ]);
}

browser.runtime.onMessage.addListener(
  async (message: MessageToBackground, sender) => {
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

browser.pageAction.onClicked.addListener((tab, info) => {
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
      browser.pageAction.setPopup({ popup: 'panel.html', tabId });
      browser.pageAction.openPopup();
      return browser.pageAction.setPopup({ popup: '', tabId });

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
