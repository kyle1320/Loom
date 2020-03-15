import { remote, MenuItemConstructorOptions } from 'electron';

export function showMenu(template: MenuItemConstructorOptions[]): void {
  remote.Menu.buildFromTemplate(template).popup();
}