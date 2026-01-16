import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Shield, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  user_type: 'admin' | 'viewer' | 'gerente';
}

interface UnitPermission {
  id: string;
  user_id: string;
  unidade: 'juazeiro_norte' | 'fortaleza';
  can_view: boolean;
  can_modify: boolean;
}

interface UserWithPermissions extends UserProfile {
  permissions: UnitPermission[];
}

const unitLabels: Record<string, string> = {
  juazeiro_norte: 'Juazeiro do Norte',
  fortaleza: 'Fortaleza',
};

export function UnitPermissionsManager() {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUnitDialogOpen, setNewUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState<'juazeiro_norte' | 'fortaleza'>('juazeiro_norte');
  const [saving, setSaving] = useState(false);

  const fetchUsersWithPermissions = async () => {
    try {
      setLoading(true);

      // Fetch all profiles (non-admin)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_type', 'admin')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Fetch all unit permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('user_unit_permissions')
        .select('*') as { data: any[] | null, error: any };

      if (permissionsError) throw permissionsError;

      // Combine data
      const usersWithPerms: UserWithPermissions[] = (profiles || []).map(profile => ({
        ...profile,
        permissions: (permissions || [])
          .filter((p: any) => p.user_id === profile.id)
          .map((p: any) => ({
            id: p.id,
            user_id: p.user_id,
            unidade: p.unidade,
            can_view: p.can_view ?? true,
            can_modify: p.can_modify ?? false,
          })) as UnitPermission[],
      }));

      setUsers(usersWithPerms);
    } catch (error) {
      console.error('Error fetching users with permissions:', error);
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar a lista de usuários e permissões.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithPermissions();
  }, []);

  const addUnitPermission = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_unit_permissions')
        .insert({
          user_id: selectedUser.id,
          unidade: newUnit,
          can_view: true,
          can_modify: selectedUser.user_type === 'gerente',
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Permissão já existe',
            description: 'Este usuário já tem permissão para esta unidade.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      toast({
        title: 'Permissão adicionada',
        description: `Acesso à ${unitLabels[newUnit]} concedido com sucesso.`,
      });

      setNewUnitDialogOpen(false);
      await fetchUsersWithPermissions();
      
      // Update selected user
      const updated = users.find(u => u.id === selectedUser.id);
      if (updated) setSelectedUser(updated);
    } catch (error) {
      console.error('Error adding permission:', error);
      toast({
        title: 'Erro ao adicionar permissão',
        description: 'Não foi possível adicionar a permissão.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeUnitPermission = async (permissionId: string) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_unit_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      toast({
        title: 'Permissão removida',
        description: 'Acesso à unidade removido com sucesso.',
      });

      await fetchUsersWithPermissions();
      
      // Update selected user
      if (selectedUser) {
        const updated = users.find(u => u.id === selectedUser.id);
        if (updated) setSelectedUser(updated);
      }
    } catch (error) {
      console.error('Error removing permission:', error);
      toast({
        title: 'Erro ao remover permissão',
        description: 'Não foi possível remover a permissão.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePermission = async (permissionId: string, canModify: boolean) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_unit_permissions')
        .update({ can_modify: canModify })
        .eq('id', permissionId);

      if (error) throw error;

      toast({
        title: 'Permissão atualizada',
        description: canModify ? 'Permissão de edição concedida.' : 'Permissão de edição removida.',
      });

      await fetchUsersWithPermissions();
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Erro ao atualizar permissão',
        description: 'Não foi possível atualizar a permissão.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Permissões de Unidade
        </CardTitle>
        <CardDescription>
          Gerencie quais unidades cada usuário pode acessar. Administradores têm acesso a todas as unidades automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum usuário não-administrador encontrado.
            </p>
          ) : (
            users.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {user.full_name || user.email || 'Usuário sem nome'}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {user.user_type === 'gerente' ? 'Gerente' : 'Visualizador'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.permissions.length === 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        Sem acesso a unidades
                      </Badge>
                    ) : (
                      user.permissions.map(perm => (
                        <Badge
                          key={perm.id}
                          variant={perm.can_modify ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {unitLabels[perm.unidade]}
                          {perm.can_modify && ' (edita)'}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <Dialog open={dialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (open) setSelectedUser(user);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Gerenciar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Permissões de {user.full_name || user.email}</DialogTitle>
                      <DialogDescription>
                        Configure quais unidades este usuário pode acessar e modificar.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {user.permissions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma permissão de unidade configurada.
                        </p>
                      ) : (
                        user.permissions.map(perm => (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{unitLabels[perm.unidade]}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`modify-${perm.id}`}
                                  checked={perm.can_modify}
                                  onCheckedChange={(checked) =>
                                    updatePermission(perm.id, checked as boolean)
                                  }
                                  disabled={saving}
                                />
                                <Label htmlFor={`modify-${perm.id}`} className="text-sm">
                                  Pode editar
                                </Label>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeUnitPermission(perm.id)}
                                disabled={saving}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}

                      <Dialog open={newUnitDialogOpen} onOpenChange={setNewUnitDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Unidade
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar acesso a unidade</DialogTitle>
                            <DialogDescription>
                              Selecione a unidade que deseja dar acesso a este usuário.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Select
                              value={newUnit}
                              onValueChange={(value: 'juazeiro_norte' | 'fortaleza') =>
                                setNewUnit(value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="juazeiro_norte">
                                  🏜️ Juazeiro do Norte
                                </SelectItem>
                                <SelectItem value="fortaleza">🌊 Fortaleza</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setNewUnitDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={addUnitPermission} disabled={saving}>
                              {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Adicionar'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Fechar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
