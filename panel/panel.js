const selectorInput = document.querySelector('#selector');

selectorInput.addEventListener('blur', () => {
  window.close();
});

selectorInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    window.close();
  }
});

browser.tabs.query({
  currentWindow: true,
  active: true,
}).then((tabs) => {
  for (const tab of tabs) {
    const hostname = new URL(tab.url).hostname;
    browser.storage.sync.get(hostname)
        .then((obj) => {
          if (obj[hostname] && obj[hostname].selector) {
            selectorInput.value = obj[hostname].selector;
          }
        })
        .catch(() => {})
        .then(() => {
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
        });
  }
});
