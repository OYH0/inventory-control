import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUnit } from '@/contexts/UnitContext';
import { Login } from '@/components/Login';
import { PendingApprovalScreen } from '@/components/PendingApprovalScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function FullScreenLoader({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-churrasco-cream via-background to-churrasco-cream/50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-churrasco-red mx-auto" />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { loading: unitLoading, isApproved } = useUnit();

  if (authLoading) return <FullScreenLoader message="Carregando..." />;
  if (!user) return <Login />;
  if (unitLoading) return <FullScreenLoader message="Carregando permissões..." />;

  // Cadastro pendente de aprovação do master/admin.
  if (!isApproved) return <PendingApprovalScreen />;

  return <>{children}</>;
}
