import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

export declare interface Options {
  displayToast: boolean;
}

export declare type SelectorsByHostnames = Record<
  string,
  { selector: string } | undefined
>;

export async function getOptions(): Promise<Options> {
  const { options } = await browser.storage.sync.get('options');
  return (
    options ?? {
      displayToast: true,
    }
  );
}

export async function getSelectorForHostname(hostname: string) {
  const storage: SelectorsByHostnames =
    await browser.storage.sync.get(hostname);
  return storage[hostname]?.selector;
}
