import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
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
  needsUnitSelection: boolean;
  clearUnitSelection: () => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

const SELECTED_UNIT_KEY = 'selected_unit';

export function UnitProvider({ children }: { children: ReactNode }) {
  const unitPermissions = useUnitPermissions();
  const [needsUnitSelection, setNeedsUnitSelection] = useState(false);

  // Check if user needs to select a unit (after login)
  useEffect(() => {
    if (!unitPermissions.loading && unitPermissions.accessibleUnits.length > 0) {
      const savedUnit = localStorage.getItem(SELECTED_UNIT_KEY) as Unidade | null;
      
      // If no saved unit or saved unit is not accessible, user needs to select
      if (!savedUnit || !unitPermissions.accessibleUnits.includes(savedUnit)) {
        // If only one unit, auto-select it
        if (unitPermissions.accessibleUnits.length === 1) {
          unitPermissions.setSelectedUnit(unitPermissions.accessibleUnits[0]);
          setNeedsUnitSelection(false);
        } else {
          setNeedsUnitSelection(true);
        }
      } else {
        setNeedsUnitSelection(false);
      }
    }
  }, [unitPermissions.loading, unitPermissions.accessibleUnits]);

  const handleSetSelectedUnit = useCallback((unit: Unidade) => {
    unitPermissions.setSelectedUnit(unit);
    localStorage.setItem(SELECTED_UNIT_KEY, unit);
    setNeedsUnitSelection(false);
  }, [unitPermissions]);

  const clearUnitSelection = useCallback(() => {
    localStorage.removeItem(SELECTED_UNIT_KEY);
    setNeedsUnitSelection(true);
  }, []);

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
