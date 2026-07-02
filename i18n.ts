import { getRequestConfig } from 'next-intl/server';

// Static English config — NO cookies() read. The old version read the
// NEXT_LOCALE cookie here; NextIntlClientProvider resolves this config during
// server render, so that cookie call turned every statically-built (ISR) page
// into a fatal "Page changed from static to dynamic at runtime" 500 the moment
// it regenerated on demand. The language switcher is disabled (single locale)
// and non-en messages only ever covered the homepage shell. When real
// localization ships, use locale path prefixes (/ur/...) — never a
// request-time cookie — so pages stay statically cacheable.
export default getRequestConfig(async () => ({
  locale: 'en',
  messages: (await import('./messages/en.json')).default,
}));
