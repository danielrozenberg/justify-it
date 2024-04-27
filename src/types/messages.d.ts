export declare type MessageToBackground =
  | {
      action: 'changeSelector';
      oldSelector: string;
      newSelector: string;
      tabId?: number; // when sent from popup.ts
    }
  | {
      action: 'activateOnHostname';
      hostname: string;
    };

export declare interface MessageToContent {
  action: 'toastNewSelector';
  selector: string;
}
