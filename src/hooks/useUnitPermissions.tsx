import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type Unidade = 'juazeiro_norte' | 'fortaleza';

export interface UnitPermission {
  id: string;
  user_id: string;
  unidade: Unidade;
  can_view: boolean;
  can_modify: boolean;
  created_at: string;
  updated_at: string;
}

interface UseUnitPermissionsReturn {
  accessibleUnits: Unidade[];
  selectedUnit: Unidade | null;
  setSelectedUnit: (unit: Unidade) => void;
  permissions: UnitPermission[];
  loading: boolean;
  isAdmin: boolean;
  canModifyUnit: (unit: Unidade) => boolean;
  refetch: () => Promise<void>;
}

const SELECTED_UNIT_KEY = 'selected_unit';

export function useUnitPermissions(): UseUnitPermissionsReturn {
  const [accessibleUnits, setAccessibleUnits] = useState<Unidade[]>([]);
  const [selectedUnit, setSelectedUnitState] = useState<Unidade | null>(null);
  const [permissions, setPermissions] = useState<UnitPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setAccessibleUnits([]);
      setPermissions([]);
      setSelectedUnitState(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // First check if user is admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      const userIsAdmin = profileData?.user_type === 'admin';
      setIsAdmin(userIsAdmin);

      if (userIsAdmin) {
        // Admins have access to all units
        const allUnits: Unidade[] = ['juazeiro_norte', 'fortaleza'];
        setAccessibleUnits(allUnits);
        setPermissions([]);
        
        // Restore selected unit from localStorage or default to first
        const savedUnit = localStorage.getItem(SELECTED_UNIT_KEY) as Unidade | null;
        if (savedUnit && allUnits.includes(savedUnit)) {
          setSelectedUnitState(savedUnit);
        } else {
          setSelectedUnitState(allUnits[0]);
        }
      } else {
        // Fetch user's unit permissions
        const { data: permData, error } = await supabase
          .from('user_unit_permissions')
          .select('*')
          .eq('user_id', user.id)
          .eq('can_view', true);

        if (error) {
          console.error('Error fetching unit permissions:', error);
          setAccessibleUnits([]);
          setPermissions([]);
        } else {
          const perms = (permData || []) as UnitPermission[];
          setPermissions(perms);
          
          const units = perms.map(p => p.unidade);
          setAccessibleUnits(units);
          
          // Restore selected unit from localStorage or default to first accessible
          const savedUnit = localStorage.getItem(SELECTED_UNIT_KEY) as Unidade | null;
          if (savedUnit && units.includes(savedUnit)) {
            setSelectedUnitState(savedUnit);
          } else if (units.length > 0) {
            setSelectedUnitState(units[0]);
          } else {
            setSelectedUnitState(null);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchPermissions:', error);
      setAccessibleUnits([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const setSelectedUnit = useCallback((unit: Unidade) => {
    setSelectedUnitState(unit);
    localStorage.setItem(SELECTED_UNIT_KEY, unit);
  }, []);

  const canModifyUnit = useCallback((unit: Unidade): boolean => {
    if (isAdmin) return true;
    
    const perm = permissions.find(p => p.unidade === unit);
    return perm?.can_modify ?? false;
  }, [isAdmin, permissions]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    accessibleUnits,
    selectedUnit,
    setSelectedUnit,
    permissions,
    loading,
    isAdmin,
    canModifyUnit,
    refetch: fetchPermissions,
  };
}
