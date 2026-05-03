import React from 'react';
import { cn } from '@/lib/utils';

interface NavigationIndicatorProps {
  currentIndex: number;
  totalRoutes: number;
  onNavigate: (index: number) => void;
  routeLabels?: string[];
  className?: string;
}

export const NavigationIndicator: React.FC<NavigationIndicatorProps> = ({
  currentIndex,
  totalRoutes,
  onNavigate,
  routeLabels = [],
  className,
}) => {
  const labels = routeLabels;

  return (
    <div className={cn('flex items-center justify-center gap-2 relative z-30', className)}>
      {Array.from({ length: totalRoutes }, (_, index) => {
        const active = currentIndex === index;
        return (
          <button
            key={index}
            onClick={() => onNavigate(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300 hover:opacity-80',
              active
                ? 'w-6 bg-primary shadow-sm shadow-primary/30'
                : 'w-2 bg-muted-foreground/25 hover:bg-muted-foreground/50'
            )}
            title={labels[index] || `Aba ${index + 1}`}
            aria-label={`Ir para ${labels[index] || `aba ${index + 1}`}`}
            aria-current={active ? 'page' : undefined}
          />
        );
      })}
    </div>
  );
};
