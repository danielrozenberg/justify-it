import { getOptions } from '../common/options';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

const TOAST_DISPLAY_MS = 1000;
const TOAST_FADE_OUT_MS = 200;

const STYLE_TEXT = `
@keyframes autohide {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

:host {
  animation: autohide ${TOAST_FADE_OUT_MS}ms ease-out ${TOAST_DISPLAY_MS}ms forwards;
  background-color: rgba(0, 0, 0, .5);
  border: 0;
  border-radius: 1em;
  color: white;
  margin-block-start: .5em;
  margin-inline-end: .5em;
  padding: 1em;
}`;

export class HTMLToastElement extends HTMLElement {
  constructor(title: string, message: string) {
    super();
    this.setAttribute('popover', 'manual');

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const style = shadowRoot.appendChild(document.createElement('style'));
    style.textContent = STYLE_TEXT;

    const titleTextElement = shadowRoot.appendChild(
      document.createElement('strong'),
    );
    titleTextElement.textContent = title;

    shadowRoot.appendChild(document.createTextNode(' '));

    const messageTextElement = shadowRoot.appendChild(
      document.createElement('span'),
    );
    messageTextElement.textContent = message;

    document.body.appendChild(this);
    this.showPopover();

    setTimeout(() => {
      this.remove();
    }, TOAST_DISPLAY_MS + TOAST_FADE_OUT_MS);
  }
}

export function registerToastCustomElement() {
  customElements.define('justify-it-toast', HTMLToastElement);
}

export class ToastController {
  toastElement: HTMLToastElement;

  constructor() {
    registerToastCustomElement();
  }

  /**
   * Displays a toast notification with the changed selector.
   */
  async displayToast(selector: string) {
    this.toastElement?.remove();

    const { displayToast } = await getOptions();
    if (displayToast) {
      if (selector) {
        this.toastElement = new HTMLToastElement(
          browser.i18n.getMessage('toastTitle'),
          browser.i18n.getMessage('toastMessageOn', [selector]),
        );
      } else {
        this.toastElement = new HTMLToastElement(
          browser.i18n.getMessage('toastTitle'),
          browser.i18n.getMessage('toastMessageOff'),
        );
      }
    }
  }
}
