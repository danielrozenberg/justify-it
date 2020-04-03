const selectorInput = document.getElementById('selector');
const clearButton = document.getElementById('clear');

selectorInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    window.close();
  }
});

browser.tabs.query({
  currentWindow: true,
  active: true,
}).then(async (tabs) => {
  for (const tab of tabs) {
    const hostname = new URL(tab.url).hostname;
    const storage = await browser.storage.sync.get(hostname);
    selectorInput.value =
        (storage[hostname] && storage[hostname].selector) || '';

    selectorInput.addEventListener('input', () => {
      const selector = selectorInput.value;
      if (selector) {
        browser.storage.sync.set({
          [hostname]: {
            selector,
          },
        });
      } else {
        browser.storage.sync.remove(hostname);
      }
      browser.tabs.sendMessage(tab.id, selector);
    });

    clearButton.addEventListener('click', () => {
      browser.storage.sync.remove(hostname);
      browser.tabs.sendMessage(tab.id, '');
      window.close();
    });
  }
});
