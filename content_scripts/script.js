let injectCss = () => {
  document.styleSheets[document.styleSheets.length-1].insertRule(`
  [__justify_it__] {
    text-align: justify !important;
    hyphens: auto !important;
  }`);
  injectCss = () => {};
};

/**
 * Justify all elements that match the selector.
 *
 * @param {string} selector string css selector.
 */
function justify(selector) {
  if (selector) {
    injectCss();
    document.querySelectorAll(selector).forEach((element) => {
      element.setAttribute('__justify_it__', '__justify_it__');
    });
    browser.runtime.sendMessage({action: 'on', selector});
  } else {
    browser.runtime.sendMessage({action: 'off'});
  }
}

/**
 * Remove justifying attribute from all.
 */
function unjustify() {
  document.querySelectorAll('[__justify_it__]').forEach((element) => {
    element.removeAttribute('__justify_it__');
  });
}

/**
 *
 */
async function initialize() {
  browser.runtime.onMessage.addListener(async (newSelector) => {
    unjustify();
    justify(newSelector);
  });

  await browser.runtime.sendMessage({action: 'show'});

  try {
    const {hostname} = window.location;
    const storage = await browser.storage.sync.get(hostname);
    const currentSelector =
        (storage[hostname] && storage[hostname].selector) || '';
    if (currentSelector) {
      justify(storage[hostname].selector);
    }
  } catch (e) {
    // Do nothing.
  }
}
initialize();
