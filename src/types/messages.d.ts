export interface ChangeSelectorMessage {
  action: 'changeSelector';
  oldSelector: string;
  newSelector: string;
  tabId?: number; // when sent from popup.ts
}

export interface ActivateOnHostnameMessage {
  action: 'activateOnHostname';
  hostname: string;
}

type MessageToBackground = ChangeSelectorMessage | ActivateOnHostnameMessage;

export interface ToastNewSelectorMessage {
  action: 'toastNewSelector';
  selector: string;
}

export type MessageToContent = ToastNewSelectorMessage;
