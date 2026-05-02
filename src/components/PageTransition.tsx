import React from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Anima a entrada de cada rota usando o `key` (pathname) para forçar
 * remount do conteúdo. A animação é puramente CSS (`animate-enter`),
 * respeita `prefers-reduced-motion` e não manipula style/transform direto,
 * o que evita conflito com o swipe navigation no mobile.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={`w-full animate-enter ${className}`}
    >
      {children}
    </div>
  );
};

export const usePageTransition = () => {
  const location = useLocation();
  return {
    key: location.pathname,
    pathname: location.pathname,
  };
};
