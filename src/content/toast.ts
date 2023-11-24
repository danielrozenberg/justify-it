import { getOptions } from '../common/options';

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
  inset-inline-end: .5em;
  inset-block-start: .5em;
  position: fixed;
  z-index: 999999;
}

dialog {
  background-color: rgba(0, 0, 0, .5);
  border: 0;
  border-radius: 1em;
  color: white;
  margin: 0;
  position: static;
}`;

export class HTMLToastElement extends HTMLElement {
  constructor(title: string, message: string) {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const style = shadowRoot.appendChild(document.createElement('style'));
    style.textContent = STYLE_TEXT;

    const dialogElement = shadowRoot.appendChild(
      document.createElement('dialog'),
    );
    dialogElement.setAttribute('open', '');

    const titleTextElement = dialogElement.appendChild(
      document.createElement('strong'),
    );
    titleTextElement.textContent = title;

    dialogElement.appendChild(document.createTextNode(' '));

    const messageTextElement = dialogElement.appendChild(
      document.createElement('span'),
    );
    messageTextElement.textContent = message;

    document.body.appendChild(this);
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
          'Justify It:',
          `Justifying ${selector}`,
        );
      } else {
        this.toastElement = new HTMLToastElement('Justify It:', 'Off');
      }
    }
  }
}
