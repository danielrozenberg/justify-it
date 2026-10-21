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

// Settings are stored per registrable domain (eTLD+1), so that all subdomains of
// a site share the same selector. IP addresses, hosts with an unknown suffix and
// bare public suffixes are stored as-is.
export function getStorageKey(hostname: string): string {
  return browser.publicSuffix.getDomain(hostname, {
    allowIPAddress: true,
    allowUnknownSuffix: true,
    allowPlainSuffix: true,
  });
}

export async function getSelectorForHostname(hostname: string) {
  const key = getStorageKey(hostname);
  const storage = (await browser.storage.sync.get(
    key,
  )) as SelectorsByHostnamesRecord;
  return storage[key]?.selector;
}

export async function setSelectorForHostname(
  hostname: string,
  selector: string,
): Promise<void> {
  const record: SelectorsByHostnamesRecord = {
    [getStorageKey(hostname)]: { selector },
  };
  return browser.storage.sync.set(record);
}

export async function removeSelectorForHostname(
  hostname: string,
): Promise<void> {
  return browser.storage.sync.remove(getStorageKey(hostname));
}
