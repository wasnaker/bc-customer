import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const requiredExports = ['./api', './api/manifest', './api/migrations', './web', './manifest'];
for (const key of requiredExports) {
  if (!pkg.exports[key]) throw new Error(`Missing package export: ${key}`);
}
for (const path of [
  'api/dist/index.js',
  'api/dist/index.d.ts',
  'api/dist/customer/customer.manifest.js',
  'api/dist/customer/database/migrations/index.js',
]) {
  await access(new URL(`../${path}`, import.meta.url), constants.R_OK);
}
const apiGuide = await readFile(new URL('../api/INTEGRATION.md', import.meta.url), 'utf8');
if (/copy source files|MySQL|Mongoose|document database/i.test(apiGuide)) {
  throw new Error('API integration guide contains legacy copy/database instructions');
}
console.log('API package exports and build artifacts verified.');
