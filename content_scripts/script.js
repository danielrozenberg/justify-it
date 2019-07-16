browser.runtime.onMessage.addListener((newSelector) => {
  unjustify();
  justify(newSelector);
});

browser.runtime.sendMessage('show');

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
 * @param {string} selector string css selector.
 */
function justify(selector) {
  if (selector) {
    injectCss();
    document.querySelectorAll(selector).forEach((element) => {
      element.setAttribute('__justify_it__', '__justify_it__');
    });
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

const {hostname} = window.location;
const storagePromise = browser.storage.sync.get(hostname)
    .then((obj) => {
      if (obj[hostname] && obj[hostname].selector) {
        justify(obj[hostname].selector);
      }
    })
    .catch(() => {});

exports.storagePromise = storagePromise;
