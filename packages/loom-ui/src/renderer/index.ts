import * as electron from 'electron';

import LoomUI from './LoomUI';

window.addEventListener('load', function () {
  const ui = new LoomUI();

  electron.ipcRenderer.on('new', () => ui.create());
  electron.ipcRenderer.on('open', () => ui.open());
  electron.ipcRenderer.on('save', () => ui.save());
  electron.ipcRenderer.on('export', () => ui.export());
  electron.ipcRenderer.on('close', () => ui.close());
});