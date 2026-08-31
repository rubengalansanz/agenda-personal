interface ElectronAPI {
  isElectron: boolean;
  openExternal: (url: string) => Promise<void>;
  getDatabasePath: () => Promise<string>;
  showNotification: (title: string, body: string) => Promise<void>;
  getPlatform: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
