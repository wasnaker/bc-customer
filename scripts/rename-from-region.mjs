#!/usr/bin/env node
/**
 * rename-from-region.mjs
 *
 * Rename modul berbasis salinan `bc-region` menjadi modul baru.
 * Hanya mengubah IDENTITAS modul (nama package, folder, class, permission,
 * i18n, route, widget id) — entity domain (province/regency, dll) TIDAK
 * diubah di tahap ini; entity diganti menyusul sesuai kebutuhan modul.
 *
 * Pemakaian:
 *   node scripts/rename-from-region.mjs --name customer --version 0.1.0
 *
 * Idempoten: menolak jalan jika `api/src/region` sudah tidak ada atau
 * `api/src/<name>` sudah ada.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const get = (key, fallback) => {
  const i = args.indexOf(key);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const name = get('--name', 'customer');
const version = get('--version', '0.1.0');
const display = get('--display', name[0].toUpperCase() + name.slice(1));
const root = process.cwd();
const SELF = 'rename-from-region.mjs';

const srcRegion = path.join(root, 'api', 'src', 'region');
const srcTarget = path.join(root, 'api', 'src', name);
if (!fs.existsSync(srcRegion)) {
  console.error('GAGAL: api/src/region tidak ditemukan (sudah direname?).');
  process.exit(1);
}
if (fs.existsSync(srcTarget)) {
  console.error(`GAGAL: api/src/${name} sudah ada — rename tidak diulang.`);
  process.exit(1);
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', 'coverage']);
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.yml', '.yaml']);

// ── 1) Rename folder & file yang mengandung region/Region ────────────────────
function walkRename(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name === SELF) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkRename(full);
    if (/[Rr]egion/.test(entry.name)) {
      const next = path.join(
        dir,
        entry.name.replaceAll('Region', display).replaceAll('region', name),
      );
      fs.renameSync(full, next);
      console.log(`rename: ${path.relative(root, full)} -> ${path.relative(root, next)}`);
    }
  }
}
walkRename(root);

// ── 2) Ganti isi file (urutan aturan penting) ────────────────────────────────
let changedFiles = 0;
function walkContent(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name === SELF) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkContent(full);
      continue;
    }
    if (!TEXT_EXT.has(path.extname(entry.name))) continue;
    const original = fs.readFileSync(full, 'utf8');
    const next = original
      .replaceAll(`@wasnaker/module-region`, `@wasnaker/module-${name}`)
      .replaceAll(`module-region`, `module-${name}`)
      .replaceAll(`Region`, display)
      .replaceAll(`region`, name)
      .replaceAll(`REGION`, name.toUpperCase());
    if (next !== original) {
      fs.writeFileSync(full, next);
      changedFiles++;
    }
  }
}
walkContent(root);
console.log(`konten diganti: ${changedFiles} file`);

// ── 3) Set versi ─────────────────────────────────────────────────────────────
for (const pkgPath of ['package.json', path.join('api', 'package.json')]) {
  const full = path.join(root, pkgPath);
  if (!fs.existsSync(full)) continue;
  const pkg = JSON.parse(fs.readFileSync(full, 'utf8'));
  pkg.version = version;
  fs.writeFileSync(full, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`version ${pkgPath}: ${version}`);
}
// Manifest backend: version: '<semver>'
function setManifestVersion(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name === SELF) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      setManifestVersion(full);
    } else if (entry.name.endsWith('.manifest.ts')) {
      const s = fs.readFileSync(full, 'utf8');
      const next = s.replace(/version: '\d+\.\d+\.\d+'/, `version: '${version}'`);
      if (next !== s) {
        fs.writeFileSync(full, next);
        console.log(`manifest version: ${path.relative(root, full)} -> ${version}`);
      }
    }
  }
}
setManifestVersion(root);

// ── 4) Verifikasi: tidak boleh ada sisa "region" (case-insensitive) ──────────
const leftovers = [];
function walkCheck(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name === SELF) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkCheck(full);
      continue;
    }
    if (!TEXT_EXT.has(path.extname(entry.name))) continue;
    const s = fs.readFileSync(full, 'utf8');
    const hits = s.match(/region/gi);
    if (hits) leftovers.push(`${path.relative(root, full)}: ${hits.length}`);
  }
}
walkCheck(root);

console.log('\n── HASIL VERIFIKASI ──');
if (leftovers.length === 0) {
  console.log('OK: tidak ada sisa "region" di source.');
} else {
  console.log('MASIH ADA sisa "region":');
  for (const l of leftovers) console.log('  ' + l);
  process.exit(2);
}
console.log(`\nSelesai. Modul "${name}" v${version} siap. Lanjutkan dengan:`);
console.log('  npm install --package-lock-only && npm run build:api && npm run verify:api-package');
