export function $(selector: string): HTMLElement {
  const element = document.querySelector(selector);
  if (element instanceof HTMLElement) {
    return element;
  }
  throw new Error(`Element not found for selector: ${selector}`);
}
