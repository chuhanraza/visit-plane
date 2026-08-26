#!/usr/bin/env node
/**
 * Interactive local env setup — run this yourself, in your own terminal.
 * Prompts for the API keys the destination-photo ingestion scripts need and
 * writes them straight into .env.local. Keys never pass through chat, a repo
 * commit, or any relay — you type them here and they go directly to disk.
 *
 * Usage:
 *   node scripts/setup-local-env.mjs
 *
 * Also referenced from scripts/destination-photos/ingest-hero-photos.mjs
 * --help, so it's discoverable from there too.
 */

import { createInterface } from 'node:readline';
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const ENV_PATH = new URL('../.env.local', import.meta.url);
const GITIGNORE_PATH = new URL('../.gitignore', import.meta.url);

const FIELDS = [
  {
    key: 'UNSPLASH_ACCESS_KEY',
    optional: false,
    hint: 'unsplash.com/oauth/applications -> your app -> "Access Key"',
    validate: (v) => {
      if (v.length < 20) return 'too short to be a real Unsplash Access Key (looks like a placeholder)';
      return null;
    },
  },
  {
    key: 'PEXELS_API_KEY',
    optional: true,
    hint: 'pexels.com/api/new -> API Key (optional — press Enter to skip)',
    validate: (v) => {
      if (v.length < 20) return 'too short to be a real Pexels API key (looks like a placeholder)';
      return null;
    },
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    optional: false,
    hint: 'Supabase dashboard -> Project Settings -> API -> service_role, under "Legacy anon, service_role API keys"',
    validate: (v) => {
      const parts = v.split('.');
      if (!v.startsWith('eyJ') || parts.length !== 3 || parts.some((p) => p.length === 0)) {
        return 'not a valid JWT (expected "eyJ..." with three dot-separated segments)';
      }
      return null;
    },
  },
  {
    key: 'SUPABASE_URL',
    optional: false,
    hint: 'Supabase dashboard -> Project Settings -> API -> Project URL',
    validate: (v) => {
      if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(v)) {
        return 'must look like https://<project-ref>.supabase.co';
      }
      return null;
    },
  },
];

function mask(value) {
  if (value.length <= 6) return '***';
  return `${value.slice(0, 4)}***`;
}

function promptHidden(rl, question) {
  return new Promise((resolve) => {
    const output = rl.output;
    let masked = false;
    const originalWrite = output.write.bind(output);
    output.write = (chunk, ...args) => {
      if (masked) {
        // Only pass through the prompt text itself, swallow echoed keystrokes.
        if (chunk === '\n' || chunk === '\r\n') return originalWrite(chunk, ...args);
        return true;
      }
      return originalWrite(chunk, ...args);
    };
    rl.question(question, (answer) => {
      output.write = originalWrite;
      resolve(answer.trim());
    });
    masked = true;
  });
}

async function ensureGitignored() {
  let contents = '';
  try {
    contents = await readFile(GITIGNORE_PATH, 'utf-8');
  } catch {
    contents = '';
  }
  const alreadyIgnored = contents
    .split('\n')
    .some((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return false;
      return trimmed === '.env.local' || trimmed === '.env*' || trimmed === '.env';
    });
  if (alreadyIgnored) return true;

  await appendFile(GITIGNORE_PATH, `${contents.endsWith('\n') || contents === '' ? '' : '\n'}.env.local\n`);
  console.error(
    '\n⚠️  .env.local was NOT in .gitignore. Added it just now.\n' +
      '   Re-run this script to continue — refusing to write secrets until the ignore rule is confirmed in place.\n'
  );
  return false;
}

async function loadExistingEnv() {
  if (!existsSync(ENV_PATH)) return { lines: [], raw: '' };
  const raw = await readFile(ENV_PATH, 'utf-8');
  return { lines: raw.split('\n'), raw };
}

function upsertEnvLines(lines, key, value) {
  const pattern = new RegExp(`^${key}=`);
  const idx = lines.findIndex((l) => pattern.test(l));
  const newLine = `${key}=${value}`;
  if (idx !== -1) {
    lines[idx] = newLine;
    return lines;
  }
  // Insert before trailing blank lines, or append.
  let insertAt = lines.length;
  while (insertAt > 0 && lines[insertAt - 1] === '') insertAt--;
  lines.splice(insertAt, 0, newLine);
  return lines;
}

async function main() {
  console.log('VisitPlane local env setup');
  console.log('Values are written straight to .env.local and never echoed back.\n');

  const gitignoreOk = await ensureGitignored();
  if (!gitignoreOk) {
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });

  const collected = {};
  for (const field of FIELDS) {
    console.log(`\n${field.key}${field.optional ? ' (optional)' : ''}`);
    console.log(`  ${field.hint}`);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const answer = await promptHidden(rl, `  Enter ${field.key}: `);
      if (answer === '' && field.optional) {
        console.log(`  ⏭️  skipped ${field.key}`);
        break;
      }
      if (answer === '' && !field.optional) {
        console.log('  ❌ required — cannot skip. Try again.');
        continue;
      }
      const problem = field.validate(answer);
      if (problem) {
        console.log(`  ❌ rejected: ${problem}. Try again.`);
        continue;
      }
      collected[field.key] = answer;
      console.log(`  ✅ ${field.key} set (${mask(answer)})`);
      break;
    }
  }

  rl.close();

  const { lines } = await loadExistingEnv();
  let updatedLines = lines;
  for (const [key, value] of Object.entries(collected)) {
    updatedLines = upsertEnvLines(updatedLines, key, value);
  }
  await writeFile(ENV_PATH, updatedLines.join('\n'));

  console.log(`\n✅ .env.local updated (${Object.keys(collected).length} value(s) written).`);
  console.log('   Existing variables not listed above were left untouched.');
}

main().catch((err) => {
  console.error('\n❌ setup failed:', err.message);
  process.exit(1);
});
