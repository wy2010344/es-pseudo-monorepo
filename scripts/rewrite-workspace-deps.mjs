#!/usr/bin/env node
/**
 * Rewrite workspace:* deps to concrete npm versions for standalone deployment.
 * Usage: node scripts/rewrite-workspace-deps.mjs <target-dir>
 * Example: node scripts/rewrite-workspace-deps.mjs apps/mve-vite-demo
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const targetDir = resolve(process.argv[2] || 'apps/mve-vite-demo');
const root = resolve(import.meta.dirname, '..');

console.log(`Scanning workspace packages...`);

// Build name→version map from workspace packages
const versions = {};

function scan(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const entry of entries) {
    const full = join(dir, entry);
    try { if (!statSync(full).isDirectory()) continue; } catch { continue; }
    // Check for package.json at this level
    try {
      const pkg = JSON.parse(readFileSync(join(full, 'package.json'), 'utf-8'));
      if (pkg.name && pkg.version) {
        versions[pkg.name] = pkg.version;
        console.log(`  ${pkg.name}@${pkg.version}`);
      }
    } catch {}
    // Recurse one level (for packages/*/* pattern)
    try {
      const subs = readdirSync(full);
      for (const sub of subs) {
        const subFull = join(full, sub);
        try {
          if (!statSync(subFull).isDirectory()) continue;
          const subPkg = JSON.parse(readFileSync(join(subFull, 'package.json'), 'utf-8'));
          if (subPkg.name && subPkg.version) {
            versions[subPkg.name] = subPkg.version;
            console.log(`  ${subPkg.name}@${subPkg.version}`);
          }
        } catch {}
      }
    } catch {}
  }
}

scan(resolve(root, 'packages'));
scan(resolve(root, 'config'));

// Read target package.json and rewrite
const pkgPath = join(targetDir, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

let changed = 0;
for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
  if (!pkg[field]) continue;
  for (const [name, spec] of Object.entries(pkg[field])) {
    if (spec === 'workspace:*' || spec === 'workspace:^' || spec.startsWith('workspace:')) {
      const v = versions[name];
      if (v) {
        const newSpec = `^${v}`;
        console.log(`  ✓ ${name}: ${spec} → ${newSpec}`);
        pkg[field][name] = newSpec;
        changed++;
      } else {
        console.warn(`  ⚠ ${name}: version not found, keeping "${spec}"`);
      }
    }
  }
}

if (changed > 0) {
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`\n✅ Updated ${changed} deps in ${pkgPath}`);
  console.log(`   Now run: cd ${targetDir} && pnpm install --no-frozen-lockfile && pnpm build`);
} else {
  console.log(`\nℹ️  No workspace:* deps found in ${pkgPath}`);
}
