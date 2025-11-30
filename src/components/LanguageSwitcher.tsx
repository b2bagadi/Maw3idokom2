import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { FlagGB, FlagFR, FlagMA } from '@/components/icons/Flags';

const languages = [
  { code: 'en', name: 'English', flag: <FlagGB className="w-8 h-6 rounded-sm" /> },
  { code: 'fr', name: 'Français', flag: <FlagFR className="w-8 h-6 rounded-sm" /> },
  { code: 'ar', name: 'العربية', flag: <FlagMA className="w-8 h-6 rounded-sm" /> },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-2xl hover:bg-muted rounded-md"
        >
          {currentLanguage?.flag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[60px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`justify-center cursor-pointer text-2xl py-2 ${locale === language.code ? 'bg-accent' : ''}`}
          >
            {language.flag}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}