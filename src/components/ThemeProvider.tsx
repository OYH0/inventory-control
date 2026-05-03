import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={className}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      {isDark ? <Sun className="h-[1.15rem] w-[1.15rem]" /> : <Moon className="h-[1.15rem] w-[1.15rem]" />}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
