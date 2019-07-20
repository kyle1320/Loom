import { app, BrowserWindow } from 'electron';
import path from 'path';
import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production';

let win: BrowserWindow | null;

function createWindow(): void {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (isDevelopment) {
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
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