import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['en', 'ar', 'ur', 'hi', 'zh', 'es', 'fr', 'de', 'pt', 'bn'];

export default getRequestConfig(async () => {
  // cookies() throws "Dynamic server usage" during ISR static prerendering.
  // Wrap in try/catch so ISR pages (revalidate=X) render successfully.
  let locale = 'en';
  try {
    const cookieStore = await cookies();
    const rawLocale = cookieStore.get('NEXT_LOCALE')?.value;
    if (rawLocale && SUPPORTED_LOCALES.includes(rawLocale)) {
      locale = rawLocale;
    }
  } catch {
    // Static rendering context — no cookie access, default to 'en'
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
