import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'zh'],

  // Used when no locale matches
  defaultLocale: 'en',

  // If the locale is the default locale, it will not be included in the URL
  localePrefix: 'as-needed'
});
