import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useUnitPermissions, Unidade, UnitPermission } from '@/hooks/useUnitPermissions';

interface UnitContextType {
  accessibleUnits: Unidade[];
  selectedUnit: Unidade | null; // null = "todas as acessíveis"
  setSelectedUnit: (unit: Unidade | null) => void;
  permissions: UnitPermission[];
  loading: boolean;
  isAdmin: boolean;
  isMaster: boolean;
  isApproved: boolean;
  canModifyUnit: (unit: Unidade) => boolean;
  refetch: () => Promise<void>;
  needsUnitSelection: boolean;
  clearUnitSelection: () => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: ReactNode }) {
  const unitPermissions = useUnitPermissions();
  const [needsUnitSelection, setNeedsUnitSelection] = useState(false);

  // Tela de seleção pós-login: aparece só quando o usuário tem mais de uma
  // unidade e ainda não escolheu nada (selectedUnit nulo após carregamento).
  useEffect(() => {
    if (unitPermissions.loading) return;
    if (unitPermissions.accessibleUnits.length <= 1) {
      setNeedsUnitSelection(false);
      return;
    }
    // Já há um valor (specific ou null = "todas") restaurado pelo hook? Não precisa selecionar.
    setNeedsUnitSelection(false);
  }, [unitPermissions.loading, unitPermissions.accessibleUnits, unitPermissions.selectedUnit]);

  const handleSetSelectedUnit = useCallback((unit: Unidade | null) => {
    unitPermissions.setSelectedUnit(unit);
    setNeedsUnitSelection(false);
  }, [unitPermissions]);

  const clearUnitSelection = useCallback(() => {
    unitPermissions.setSelectedUnit(null);
    setNeedsUnitSelection(true);
  }, [unitPermissions]);

  return (
    <UnitContext.Provider value={{
      ...unitPermissions,
      setSelectedUnit: handleSetSelectedUnit,
      needsUnitSelection,
      clearUnitSelection,
    }}>
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
