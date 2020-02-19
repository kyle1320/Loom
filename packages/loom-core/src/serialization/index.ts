import fs = require('fs');
import path = require('path');

export interface LoomConfig {
  sourcesRoot?: string;
  componentsRoot?: string;
}

export function mkdirp(file: string): void {
  const dirname = path.dirname(file);
  if (fs.existsSync(dirname)) return;
  mkdirp(dirname);
  fs.mkdirSync(dirname);
}

export function writeSync(file: string, contents: string): void {
  mkdirp(file);
  fs.writeFileSync(file, contents);
}

export function walkDir(root: string, callback: (path: string) => void): void {
  (function walk(dir: string): void {
    fs.readdirSync(path.join(root, dir)).forEach(f => {
      const dirPath = path.join(dir, f);
      fs.statSync(path.join(root, dirPath)).isDirectory()
        ? walk(dirPath) : callback(dirPath);
    });
  }(''));
}