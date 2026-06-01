/**
 * VisitPlane — Icon Generation Script
 * Run ONCE after installing dependencies:
 *   npm install --save-dev sharp
 *   node scripts/generate-icons.mjs
 *
 * Input:  public/logo-v2.png  (your existing logo — 512×512+ recommended)
 * Output: public/icons/*.png  (all required PWA sizes)
 *         public/splash/*.png (iOS splash screens — solid brand color + centered logo)
 */

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const SRC       = join(ROOT, 'public', 'logo-v2.png');
const ICONS_DIR = join(ROOT, 'public', 'icons');
const SPLASH_DIR= join(ROOT, 'public', 'splash');

[ICONS_DIR, SPLASH_DIR].forEach(d => !existsSync(d) && mkdirSync(d, { recursive: true }));

const BRAND_BG  = { r: 6,  g: 12,  b: 24,  alpha: 1 }; // #060C18
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Regular icons
for (const size of ICON_SIZES) {
  await sharp(SRC).resize(size, size).toFile(join(ICONS_DIR, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

// Maskable icons — 80% logo with 10% padding each side on brand bg
for (const size of [192, 512]) {
  const logoSize = Math.round(size * 0.8);
  const pad      = Math.round(size * 0.1);
  const logo     = await sharp(SRC).resize(logoSize, logoSize).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BRAND_BG } })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(join(ICONS_DIR, `icon-maskable-${size}.png`));
  console.log(`✓ icon-maskable-${size}.png`);
}

// apple-touch-icon sizes
for (const size of [120, 152, 167, 180]) {
  await sharp(SRC).resize(size, size).toFile(join(ICONS_DIR, `apple-touch-icon-${size}.png`));
  console.log(`✓ apple-touch-icon-${size}.png`);
}

// Badge icon (72×72, monochrome-ish)
await sharp(SRC).resize(72, 72).toFile(join(ICONS_DIR, 'badge-72.png'));
console.log('✓ badge-72.png');

// iOS splash screens — brand bg + centered logo
const SPLASHES = [
  { w: 640,  h: 1136, name: 'apple-splash-640-1136.png'   },
  { w: 750,  h: 1334, name: 'apple-splash-750-1334.png'   },
  { w: 1125, h: 2436, name: 'apple-splash-1125-2436.png'  },
  { w: 1170, h: 2532, name: 'apple-splash-1170-2532.png'  },
  { w: 1179, h: 2556, name: 'apple-splash-1179-2556.png'  },
  { w: 1242, h: 2208, name: 'apple-splash-1242-2208.png'  },
  { w: 1242, h: 2688, name: 'apple-splash-1242-2688.png'  },
  { w: 1284, h: 2778, name: 'apple-splash-1284-2778.png'  },
  { w: 1290, h: 2796, name: 'apple-splash-1290-2796.png'  },
  { w: 2048, h: 2732, name: 'apple-splash-2048-2732.png'  },
];

const LOGO_SPLASH_SIZE = 180;
const logoBuffer = await sharp(SRC).resize(LOGO_SPLASH_SIZE, LOGO_SPLASH_SIZE).toBuffer();

for (const { w, h, name } of SPLASHES) {
  const top  = Math.round((h - LOGO_SPLASH_SIZE) / 2);
  const left = Math.round((w - LOGO_SPLASH_SIZE) / 2);
  await sharp({ create: { width: w, height: h, channels: 4, background: BRAND_BG } })
    .composite([{ input: logoBuffer, top, left }])
    .png()
    .toFile(join(SPLASH_DIR, name));
  console.log(`✓ ${name}`);
}

console.log('\n✅ All icons and splash screens generated successfully.');
console.log('Next step: Run `npm install @serwist/next web-push` then `npm run build`');
