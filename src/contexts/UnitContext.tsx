import React, { createContext, useContext, ReactNode } from 'react';
import { useUnitPermissions, Unidade, UnitPermission } from '@/hooks/useUnitPermissions';

interface UnitContextType {
  accessibleUnits: Unidade[];
  selectedUnit: Unidade | null;
  setSelectedUnit: (unit: Unidade) => void;
  permissions: UnitPermission[];
  loading: boolean;
  isAdmin: boolean;
  canModifyUnit: (unit: Unidade) => boolean;
  refetch: () => Promise<void>;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: ReactNode }) {
  const unitPermissions = useUnitPermissions();

  return (
    <UnitContext.Provider value={unitPermissions}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
}
