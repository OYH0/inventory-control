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
  selectedUnit: Unidade | null; // null = "todas as acessíveis"
  setSelectedUnit: (unit: Unidade | null) => void;
  permissions: UnitPermission[];
  loading: boolean;
  isAdmin: boolean;
  isMaster: boolean;
  isApproved: boolean;
  canModifyUnit: (unit: Unidade) => boolean;
  refetch: () => Promise<void>;
}

const SELECTED_UNIT_KEY = 'selected_unit';
const TODAS_SENTINEL = '__todas__';

export function useUnitPermissions(): UseUnitPermissionsReturn {
  const [accessibleUnits, setAccessibleUnits] = useState<Unidade[]>([]);
  const [selectedUnit, setSelectedUnitState] = useState<Unidade | null>(null);
  const [permissions, setPermissions] = useState<UnitPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const { user } = useAuth();

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setAccessibleUnits([]);
      setPermissions([]);
      setSelectedUnitState(null);
      setIsAdmin(false);
      setIsMaster(false);
      setIsApproved(false);
      setLoading(false);
      return;
    }

    try {
      // Tenta selecionar com is_master+is_approved; se a coluna não existir
      // (migration pendente), refaz sem essas colunas.
      let profileData: any = null;
      const full = await supabase
        .from('profiles')
        .select('user_type, unidade_responsavel, is_master, is_approved')
        .eq('id', user.id);

      if (full.error && /is_master|is_approved/.test(full.error.message ?? '')) {
        const fallback = await supabase
          .from('profiles')
          .select('user_type, unidade_responsavel')
          .eq('id', user.id);
        if (fallback.error) throw fallback.error;
        profileData = fallback.data?.[0] ?? null;
      } else if (full.error) {
        throw full.error;
      } else {
        profileData = full.data?.[0] ?? null;
      }

      const userIsAdmin = profileData?.user_type === 'admin';
      const userIsMaster = profileData?.is_master === true;
      // Default true se a coluna não existir (compatibilidade pré-migration).
      const userApproved = profileData?.is_approved !== false;
      setIsAdmin(userIsAdmin);
      setIsMaster(userIsMaster);
      setIsApproved(userApproved);

      const ALL_UNITS: Unidade[] = ['juazeiro_norte', 'fortaleza'];

      // Helper para restaurar selectedUnit. Aceita sentinela "__todas__"
      // significando null (= ver todas as acessíveis).
      const restoreSelected = (units: Unidade[]) => {
        const saved = localStorage.getItem(SELECTED_UNIT_KEY);
        if (saved === TODAS_SENTINEL && units.length > 1) {
          setSelectedUnitState(null);
          return;
        }
        if (saved && (units as string[]).includes(saved)) {
          setSelectedUnitState(saved as Unidade);
          return;
        }
        // Default: se tem várias unidades, abre em "todas"; se tem uma, abre nela.
        setSelectedUnitState(units.length > 1 ? null : units[0] ?? null);
      };

      if (userIsMaster) {
        setAccessibleUnits(ALL_UNITS);
        setPermissions([]);
        restoreSelected(ALL_UNITS);
      } else if (userIsAdmin) {
        const responsavel = profileData?.unidade_responsavel as Unidade | null;
        const allUnits: Unidade[] = responsavel ? [responsavel] : ALL_UNITS;
        setAccessibleUnits(allUnits);
        setPermissions([]);
        restoreSelected(allUnits);
      } else {
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

          let units = perms.map(p => p.unidade);
          if (units.length === 0 && profileData?.unidade_responsavel) {
            units = [profileData.unidade_responsavel as Unidade];
          }

          setAccessibleUnits(units);
          restoreSelected(units);
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

  const setSelectedUnit = useCallback((unit: Unidade | null) => {
    setSelectedUnitState(unit);
    localStorage.setItem(SELECTED_UNIT_KEY, unit ?? TODAS_SENTINEL);
  }, []);

  const canModifyUnit = useCallback((unit: Unidade): boolean => {
    if (isMaster) return true;
    if (isAdmin && accessibleUnits.includes(unit)) return true;

    const perm = permissions.find(p => p.unidade === unit);
    return perm?.can_modify ?? false;
  }, [isMaster, isAdmin, accessibleUnits, permissions]);

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
    isMaster,
    isApproved,
    canModifyUnit,
    refetch: fetchPermissions,
  };
}
