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

export declare type MessageToContent =
  | {
      action: 'toastNewSelector';
      selector: string;
    }
  | {
      action: 'returnHostname';
    };
