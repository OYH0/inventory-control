import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUnit } from '@/contexts/UnitContext';
import { Login } from '@/components/Login';
import { UnitSelectionScreen } from '@/components/UnitSelectionScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { accessibleUnits, selectedUnit, setSelectedUnit, loading: unitLoading, needsUnitSelection } = useUnit();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-churrasco-cream via-background to-churrasco-cream/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-churrasco-red mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Show unit selection screen if user needs to select a unit
  if (needsUnitSelection && accessibleUnits.length > 1) {
    return (
      <UnitSelectionScreen
        accessibleUnits={accessibleUnits}
        onSelectUnit={setSelectedUnit}
        loading={unitLoading}
      />
    );
  }

  // Show loading while fetching unit permissions
  if (unitLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-churrasco-cream via-background to-churrasco-cream/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-churrasco-red mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando permissões...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
