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
      browser.pageAction.setPopup({
        popup: selector == 'p' ? '' : 'panel/panel.html',
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
  try {
    const hostname = new URL(tab.url).hostname;
    const storage = await browser.storage.sync.get(hostname);
    const currentSelector =
        (storage[hostname] && storage[hostname].selector) || '';
    if (!currentSelector) {
      await browser.storage.sync.set({
        [hostname]: {
          selector: 'p',
        }});
      browser.tabs.sendMessage(tab.id, 'p');
    } else if (currentSelector == 'p') {
      await browser.storage.sync.set({
        [hostname]: {
          selector: 'article',
        }});
      browser.tabs.sendMessage(tab.id, 'article');
    }
  } catch (e) {
    // Do nothing.
  }
});
