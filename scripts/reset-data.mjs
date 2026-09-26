// Wipes the local database and every uploaded file. There is no undo.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const uploadsDir = path.join(root, 'storage', 'uploads');

for (const dir of [dataDir, uploadsDir]) {
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
    console.log(`removed ${path.relative(root, path.join(dir, entry))}`);
  }
}

console.log('Local data reset. Register a fresh studio account at /register.');
