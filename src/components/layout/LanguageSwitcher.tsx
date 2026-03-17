'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const getFlag = (loc: string) => {
    switch (loc) {
      case 'en':
        return '🇺🇸';
      case 'zh':
        return '🇨🇳';
      default:
        return '🌐';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <span className="text-xl">{getFlag(locale)}</span>
          <span className="sr-only">Switch Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleChange('en')}>
          <span className="mr-2 text-xl">🇺🇸</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange('zh')}>
          <span className="mr-2 text-xl">🇨🇳</span>
          中文
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
