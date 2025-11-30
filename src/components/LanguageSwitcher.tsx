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
  { code: 'en', name: 'English', flag: <FlagGB className="w-16 h-12 rounded-md shadow-md transition-transform duration-300 group-hover:scale-110" /> },
  { code: 'fr', name: 'Français', flag: <FlagFR className="w-16 h-12 rounded-md shadow-md transition-transform duration-300 group-hover:scale-110" /> },
  { code: 'ar', name: 'العربية', flag: <FlagMA className="w-16 h-12 rounded-md shadow-md transition-transform duration-300 group-hover:scale-110" /> },
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
          size="lg"
          className="h-16 px-2 hover:bg-transparent group transition-all duration-300 hover:scale-105"
        >
          <div className="p-1 rounded-lg border-2 border-transparent hover:border-primary/20 transition-all duration-300">
            {currentLanguage?.flag}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[100px] p-2 bg-background/95 backdrop-blur-sm border-primary/10">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`justify-center cursor-pointer py-3 px-4 focus:bg-accent group transition-all duration-200 ${locale === language.code ? 'bg-accent/50' : ''}`}
          >
            <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2">
              {language.flag}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}