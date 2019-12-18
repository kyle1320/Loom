import { app, BrowserWindow } from 'electron';
import { format as formatUrl } from 'url';
import path from 'path';
import os from 'os';

const isDevelopment = process.env.NODE_ENV !== 'production';

let win: BrowserWindow | null;

function createWindow(): void {
  win = new BrowserWindow({
    title: 'Loom',
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (isDevelopment) {
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    BrowserWindow.addDevToolsExtension(
      path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.2.1_0')
    );
  }
  else {
    win.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }));
  }

  win.on('closed', () => win = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => app.quit());