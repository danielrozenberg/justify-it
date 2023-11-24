import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

export function localizeDocument() {
  document.querySelectorAll('[data-i18n-id]').forEach((element) => {
    element.textContent = browser.i18n.getMessage(
      element.getAttribute('data-i18n-id') ?? '',
    );
  });
}
