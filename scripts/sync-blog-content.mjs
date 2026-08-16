#!/usr/bin/env node
// Regenerates public/blog-content/ as a byte-for-byte mirror of content/blog/,
// so the Cloudflare Workers ASSETS binding can serve post markdown at runtime
// (Workers has no filesystem — see readPostMarkdown() in app/blog/[slug]/page.tsx).
// content/blog/ is the single source of truth; this mirror is build-generated
// and gitignored, never hand-edited or committed.
import { existsSync, mkdirSync, readdirSync, rmSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(process.cwd(), 'content', 'blog')
const DEST = join(process.cwd(), 'public', 'blog-content')

if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true })
mkdirSync(DEST, { recursive: true })

const files = readdirSync(SRC).filter((f) => f.endsWith('.md'))
for (const file of files) {
  copyFileSync(join(SRC, file), join(DEST, file))
}

console.log(`sync-blog-content: mirrored ${files.length} files to public/blog-content/`)
