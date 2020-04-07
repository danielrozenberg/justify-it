const SELECTORS_ORDER = ['', 'p', 'article'];

browser.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab.id;
  const {selector} = message;

  switch (message.action) {
    case 'show':
      browser.pageAction.show(sender.tab.id);
      break;

    case 'on':
      browser.pageAction.setIcon({path: 'icons/active.svg', tabId});
      browser.pageAction.setTitle({
        title: `Justifying ${selector}`,
        tabId,
      });
      break;

    case 'off':
      browser.pageAction.setIcon({path: null, tabId});
      browser.pageAction.setTitle({title: null, tabId});
      browser.pageAction.setPopup({popup: '', tabId});
      break;
  }
});

browser.pageAction.onClicked.addListener(async (tab) => {
  // `tab.url` is missing on Firefox for Android, so ask for it from the tab's
  // `browser.runtime.onMessage` handler.
  const hostname = tab.url ?
      new URL(tab.url).hostname :
      await browser.tabs.sendMessage(tab.id, {action: 'hostname'});


  const storage = await browser.storage.sync.get(hostname);
  const currentSelector =
        (storage[hostname] && storage[hostname].selector) || '';

  const nextSelector = SELECTORS_ORDER[
      (SELECTORS_ORDER.indexOf(currentSelector) + 1) % SELECTORS_ORDER.length];
  await browser.storage.sync.set({
    [hostname]: {
      selector: nextSelector,
    }});
  browser.tabs.sendMessage(tab.id, {
    action: 'change',
    selector: nextSelector,
  });
});
