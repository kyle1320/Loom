import { app, Menu } from 'electron';

export function makeMenu(): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          click: (_, win) => win.webContents.send('new')
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: (_, win) => win.webContents.send('open')
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: (_, win) => win.webContents.send('save')
        },
        {
          label: 'Export...',
          click: (_, win) => win.webContents.send('export')
        },
        {
          label: 'Close Project',
          click: (_, win) => win.webContents.send('close')
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (_, win) => win.reload()
        },
        {
          label: 'Toggle Full Screen',
          accelerator: process.platform === 'darwin'
            ? 'Ctrl+Command+F'
            : 'F11',
          click: (_, win) => win.setFullScreen(!win.isFullScreen())
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin'
            ? 'Alt+Command+I'
            : 'Ctrl+Shift+I',
          click: (_, win) => win.webContents.toggleDevTools()
        },
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Loom',
      submenu: [
        {
          label: 'About Loom',
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide Loom',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideOthers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit()
        },
      ]
    });
  }

  return Menu.buildFromTemplate(template);
}