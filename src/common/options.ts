import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

export declare interface Options {
  displayToast: boolean;
}

export declare type SelectorsByHostnamesRecord = Record<
  string,
  { selector: string } | undefined
>;

export async function getOptions(): Promise<Options> {
  const { options } = (await browser.storage.sync.get('options')) as Record<
    string,
    Options | undefined
  >;
  return (
    options ?? {
      displayToast: true,
    }
  );
}

export async function getSelectorForHostname(hostname: string) {
  const storage = (await browser.storage.sync.get(
    hostname,
  )) as SelectorsByHostnamesRecord;
  return storage[hostname]?.selector;
}
