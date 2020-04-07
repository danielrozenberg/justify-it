const TOAST_DISPLAY_MS = 1000;

/**
 * Toast element.
 */
class Toast {
  /**
   * Constructor.
   *
   * @param {Element} element an empty element to make into a Toast.
   */
  constructor(element) {
    const shadowRoot = element.attachShadow({mode: 'open'});

    const style = shadowRoot.appendChild(document.createElement('style'));
    style.textContent =
    [
      `:host {
        display: block;
        margin-top: .5em;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 999999;
      }`,
      `dialog {
        background-color: rgba(0, 0, 0, .5);
        border: 0;
        border-radius: 1em;
        color: white;
        margin-inline-end: .5em;
        transition: none;
       }`,
      `dialog.animating {
        transition: opacity 1s;
       }`,
      `dialog[open] {
        opacity: 1;
       }`,
      `dialog[open].closing {
       opacity: 0;
      }`,
    ].join('\n');

    this.dialogElement = shadowRoot.appendChild(
        document.createElement('dialog'));

    this.titleTextElement = this.dialogElement.appendChild(
        document.createElement('strong'));
    this.dialogElement.appendChild(document.createTextNode(' '));
    this.messageTextElement = this.dialogElement.appendChild(
        document.createElement('span'));

    this.dialogElement.addEventListener('transitionend', () => {
      this.dialogElement.removeAttribute('open');
    });

    this.timeoutId = null;
  }

  /** @return {string} the toast's title text */
  get titleText() {
    return this.titleTextElement.textContent;
  }

  /** @param {string} text new title text */
  set titleText(text) {
    this.titleTextElement.textContent = text;
  }

  /** @return {string} the toast's message */
  get message() {
    return this.messageTextElement.textContent;
  }

  /** @param {string} text new message text */
  set message(text) {
    this.messageTextElement.textContent = text;
  }

  /** Displays the toast for TOAST_DISPLAY_MS milliseconds. */
  display() {
    this.dialogElement.setAttribute('open', '');
    this.dialogElement.classList.remove('animating', 'closing');

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.dialogElement.classList.add('animating', 'closing');
      this.timeoutId = null;
    }, TOAST_DISPLAY_MS);
  }
}

exports.Toast = Toast;
