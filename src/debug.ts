import * as path from 'path';
import * as fs from 'fs';
import mkdirp from 'mkdirp';

export function writeDict(dict: string[]) {
  const dir = path.join(process.cwd(), 'debug');
  mkdirp.sync(dir);

  const filename = path.join(dir, 'dict.txt');
  const content = dict.join('\n');
  fs.writeFileSync(filename, content, 'utf-8');
}
