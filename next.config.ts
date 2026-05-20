import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: 'images.pexels.com' },
      { protocol: 'https' as const, hostname: 'images.unsplash.com' },
      { protocol: 'https' as const, hostname: 'plus.unsplash.com' },
      { protocol: 'https' as const, hostname: 'source.unsplash.com' },
    ],
  },
};

export default withNextIntl(nextConfig);
