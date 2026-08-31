"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const notifications_1 = require("./notifications");
const isDev = !electron_1.app.isPackaged;
const PORT = 3456;
let mainWindow = null;
let nextServer = null;
function getProjectRoot() {
    return path.join(__dirname, "..");
}
function getDbPath() {
    return path.join(electron_1.app.getPath("userData"), "agenda.db");
}
function waitForServer(url, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearInterval(check);
            reject(new Error(`Server at ${url} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        const check = setInterval(async () => {
            try {
                const res = await fetch(url, { redirect: "manual" });
                if (res.status > 0) {
                    clearTimeout(timeout);
                    clearInterval(check);
                    resolve();
                }
            }
            catch {
                // Server not ready yet
            }
        }, 500);
    });
}
function startNextServer() {
    if (isDev) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const env = {
            ...process.env,
            PORT: String(PORT),
            DB_FILE: getDbPath(),
            NODE_ENV: "production",
        };
        const child = (0, child_process_1.spawn)("node", [".next/standalone/server.js"], {
            cwd: getProjectRoot(),
            env,
            stdio: "inherit",
        });
        nextServer = child;
        child.on("error", reject);
        waitForServer(`http://localhost:${PORT}`)
            .then(resolve)
            .catch(reject);
    });
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: "Agenda Personal",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    mainWindow.loadURL(`http://localhost:${PORT}`);
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: "deny" };
    });
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
function stopNextServer() {
    if (nextServer) {
        nextServer.kill("SIGTERM");
        nextServer = null;
    }
}
electron_1.ipcMain.handle("open-external", (_, url) => {
    electron_1.shell.openExternal(url);
});
electron_1.ipcMain.handle("get-database-path", () => {
    return getDbPath();
});
electron_1.ipcMain.handle("show-notification", (_, title, body) => {
    if (electron_1.Notification.isSupported()) {
        const notification = new electron_1.Notification({ title, body });
        notification.show();
        notification.on("click", () => {
            mainWindow?.focus();
        });
    }
});
electron_1.ipcMain.handle("get-platform", () => {
    return process.platform;
});
electron_1.app.whenReady().then(async () => {
    try {
        await startNextServer();
        createWindow();
        (0, notifications_1.setupNotifications)(mainWindow);
        electron_1.app.on("activate", () => {
            if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    }
    catch (err) {
        console.error("Failed to start application:", err);
        electron_1.app.quit();
    }
});
electron_1.app.on("window-all-closed", () => {
    stopNextServer();
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("before-quit", () => {
    stopNextServer();
});
//# sourceMappingURL=main.js.map