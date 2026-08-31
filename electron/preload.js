"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    openExternal: (url) => electron_1.ipcRenderer.invoke("open-external", url),
    getDatabasePath: () => electron_1.ipcRenderer.invoke("get-database-path"),
    showNotification: (title, body) => electron_1.ipcRenderer.invoke("show-notification", title, body),
    getPlatform: () => electron_1.ipcRenderer.invoke("get-platform"),
    isElectron: true,
});
//# sourceMappingURL=preload.js.map