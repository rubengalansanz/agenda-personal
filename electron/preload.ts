import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke("open-external", url),

  getDatabasePath: (): Promise<string> =>
    ipcRenderer.invoke("get-database-path"),

  showNotification: (title: string, body: string): Promise<void> =>
    ipcRenderer.invoke("show-notification", title, body),

  getPlatform: (): Promise<string> =>
    ipcRenderer.invoke("get-platform"),

  isElectron: true,
});
