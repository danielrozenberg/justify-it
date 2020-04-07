let injectIntoPage = () => {
  const {sheet} = document.head.appendChild(document.createElement('style'));
  sheet.insertRule(
      `[__justify_it__] {
        text-align: justify !important;
        hyphens: auto !important;
       }`);

  const toastElement = document.body.appendChild(
      document.createElement('justify-it-toast'));
  toastElement.id = '__justify_it__';
  // eslint-disable-next-line no-undef
  toastElement['toast'] = new Toast(toastElement);
  toastElement.toast.titleText = 'Justify It:';

  injectIntoPage = () => {};
};

/**
 * Justify all elements that match the selector.
 *
 * @param {string} selector string css selector.
 */
function justify(selector) {
  if (selector) {
    injectIntoPage();
    document.querySelectorAll(selector).forEach((element) => {
      element.setAttribute('__justify_it__', '__justify_it__');
    });
    browser.runtime.sendMessage({action: 'on', selector});
  } else {
    browser.runtime.sendMessage({action: 'off'});
  }
}

/** Removes justifying attribute from all. */
function unjustify() {
  document.querySelectorAll('[__justify_it__]').forEach((element) => {
    element.removeAttribute('__justify_it__');
  });
}

/**
 * Displays a toast notification with the changed selector.
 *
 * @param {string} selector string css selector.
 */
async function displayToast(selector) {
  // We perform a strict comparison (===) because by default we want to display
  // the toast, so a displayToast of undefined is treated as true.
  if ((await browser.storage.sync.get('displayToast')).displayToast !== false) {
    const {toast} = document.getElementById('__justify_it__');
    if (selector) {
      toast.message = `Justifying ${selector}`;
    } else {
      toast.message = 'Off';
    }
    toast.display();
  }
}

/**
 *
 */
async function initialize() {
  const {hostname} = window.location;

  browser.runtime.onMessage.addListener((message, _, sendResponse) => {
    try {
      const {selector} = message;

      switch (message.action) {
        case 'change':
          unjustify();
          justify(selector);
          displayToast(selector);
          break;

        case 'hostname':
          sendResponse(hostname);
          break;
      }
    } catch (e) {
      console.exception('Justify It:', e);
    }
  });

  browser.runtime.sendMessage({action: 'show'});
  browser.storage.sync.get(hostname).then((storage) => {
    const currentSelector =
        (storage[hostname] && storage[hostname].selector) || '';
    if (currentSelector) {
      justify(storage[hostname].selector);
    }
  }).catch((e) => {
    console.exception('Justify It:', e);
  });
}
initialize();
