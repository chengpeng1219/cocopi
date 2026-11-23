import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const packageInfo = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);
const now = new Date();
const stamp = now
  .toISOString()
  .replaceAll(':', '')
  .replaceAll('-', '')
  .replace(/\.\d{3}Z$/, 'Z');
const snapshotDir = path.join(
  root,
  '.versions',
  `v${packageInfo.version}-${stamp}`
);

let gitHead = '';
try {
  gitHead = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8'
  }).trim();
} catch {
  gitHead = 'unavailable';
}

fs.mkdirSync(snapshotDir, { recursive: true });
for (const target of [
  'src',
  'tests',
  'server',
  'scripts',
  'public',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'README.md',
  'CHANGELOG.md',
  'VERSIONS.md'
]) {
  const source = path.join(root, target);
  if (!fs.existsSync(source)) continue;
  fs.cpSync(source, path.join(snapshotDir, target), {
    recursive: true,
    force: true
  });
}

fs.writeFileSync(
  path.join(snapshotDir, 'manifest.json'),
  JSON.stringify(
    {
      version: packageInfo.version,
      createdAt: now.toISOString(),
      gitHead,
      description: process.env.VERSION_DESCRIPTION || ''
    },
    null,
    2
  )
);

console.log(snapshotDir);
