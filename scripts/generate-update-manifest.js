#!/usr/bin/env node
// Generates latest.json for the Tauri updater from downloaded CI build artifacts.
// Usage: TAG=v2.0.1 node scripts/generate-update-manifest.js
// Expects artifacts in ./artifacts/{linux,windows,macos-arm,macos-intel}/ subdirs.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const tag = process.env.TAG;
if (!tag) { console.error('TAG env var required'); process.exit(1); }

const version = tag.replace(/^v/, '');
const repo = 'AetherAssembly/Attyre';
const baseUrl = `https://github.com/${repo}/releases/download/${tag}`;

function walkDir(dir, results = []) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walkDir(p, results);
      else results.push(p);
    }
  } catch { /* dir may not exist if a build was skipped */ }
  return results;
}

const platforms = {};

const platformDirs = {
  'linux':       { key: 'linux-x86_64',   sigSuffix: '.AppImage.tar.gz.sig' },
  'windows':     { key: 'windows-x86_64', sigSuffix: '.nsis.zip.sig' },
  'macos-arm':   { key: 'darwin-aarch64', sigSuffix: '.app.tar.gz.sig' },
  'macos-intel': { key: 'darwin-x86_64',  sigSuffix: '.app.tar.gz.sig' },
};

for (const [dir, { key, sigSuffix }] of Object.entries(platformDirs)) {
  const files = walkDir(join('artifacts', dir));
  const sigFile = files.find(f => f.endsWith(sigSuffix));
  if (!sigFile) { console.warn(`[warn] No .sig found for ${dir} — skipping`); continue; }
  const artifactFile = sigFile.slice(0, -4); // remove .sig
  platforms[key] = {
    url: `${baseUrl}/${basename(artifactFile)}`,
    signature: readFileSync(sigFile, 'utf8').trim(),
  };
}

const manifest = {
  version,
  notes: `See https://github.com/${repo}/releases/tag/${tag} for release notes.`,
  pub_date: new Date().toISOString(),
  platforms,
};

writeFileSync('latest.json', JSON.stringify(manifest, null, 2));
console.log('Generated latest.json:');
console.log(JSON.stringify(manifest, null, 2));
