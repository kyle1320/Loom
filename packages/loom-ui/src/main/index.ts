import { app, BrowserWindow, Menu } from 'electron';
import { format as formatUrl } from 'url';
import * as path from 'path';
import { makeMenu } from './menu';

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
  }
  else {
    win.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }));
  }

  win.on('closed', () => win = null);

  Menu.setApplicationMenu(makeMenu());
}

if (isDevelopment) {
  app.commandLine.appendSwitch('remote-debugging-port', '9223');
  app.commandLine.appendSwitch('userDataDir', 'true');
}

app.on('ready', createWindow);
app.on('window-all-closed', () => app.quit());