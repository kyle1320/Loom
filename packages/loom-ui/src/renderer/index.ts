import * as electron from 'electron';

import LoomUI from './LoomUI';

window.addEventListener('load', function () {
  const ui = new LoomUI();

  electron.ipcRenderer.on('open', () => ui.open());
  electron.ipcRenderer.on('save', () => ui.save());
  electron.ipcRenderer.on('export', () => ui.export());
});