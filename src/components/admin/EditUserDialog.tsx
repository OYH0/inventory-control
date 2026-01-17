import { useState, useEffect } from 'react';
import { User, Loader2, Mail, LogOut, Ban, Trash2, Plus, Building2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminUser } from '@/hooks/admin/useAdminUsers';
import { RoleSelector, OrganizationRole, getPermissionsByRole } from './RoleSelector';

interface EditUserDialogProps {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserOrganization {
  id: string;
  organization_id: string;
  org_name: string;
  org_slug: string;
  role: OrganizationRole;
  is_active: boolean;
}

export function EditUserDialog({ user, onClose, onSuccess }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [userOrgs, setUserOrgs] = useState<UserOrganization[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: user.full_name,
    unidadeResponsavel: user.unidade_responsavel as 'juazeiro_norte' | 'fortaleza' | null,
    userType: user.user_type as 'admin' | 'gerente' | 'viewer'
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'reset' | 'logout' | 'deactivate' | 'delete' | null;
  }>({
    open: false,
    type: null
  });

  useEffect(() => {
    loadUserOrganizations();
    loadAvailableOrganizations();
  }, [user.id]);

  const loadUserOrganizations = async () => {
    const { data } = await supabase
      .from('admin_all_members')
      .select('*')
      .eq('user_id', user.id);
    
    setUserOrgs(data || []);
  };

  const loadAvailableOrganizations = async () => {
    const { data } = await supabase
      .from('admin_all_organizations')
      .select('id, name, slug')
      .order('name');
    
    setAvailableOrgs(data || []);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          unidade_responsavel: formData.unidadeResponsavel,
          user_type: formData.userType,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (membershipId: string, orgId: string, newRole: OrganizationRole, currentRole: OrganizationRole) => {
    // Verificar se está tentando rebaixar um owner
    if (currentRole === 'owner' && newRole !== 'owner') {
      toast.error(
        'Não é possível rebaixar o owner da organização. Transfira a ownership primeiro.',
        { duration: 5000 }
      );
      return;
    }

    try {
      const permissions = getPermissionsByRole(newRole);
      
      const { error } = await supabase
        .from('organization_members')
        .update({
          role: newRole,
          permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', membershipId);

      if (error) {
        // Tratamento específico para erro de owner
        if (error.code === 'P0001' && error.message?.includes('owner')) {
          toast.error('Não é possível rebaixar o owner. Transfira a ownership primeiro.');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Role atualizada com sucesso!');
      loadUserOrganizations();
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      toast.error('Erro ao atualizar role');
    }
  };

  const handleRemoveFromOrg = async (membershipId: string, orgName: string, role: OrganizationRole) => {
    // Verificar se está tentando remover um owner
    if (role === 'owner') {
      toast.error(
        'Não é possível remover o owner da organização. Transfira a ownership primeiro.',
        { duration: 5000 }
      );
      return;
    }

    if (!confirm(`Remover usuário da organização "${orgName}"?`)) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', membershipId);

      if (error) {
        // Tratamento específico para erro de owner
        if (error.code === 'P0001' && error.message?.includes('owner')) {
          toast.error('Não é possível remover o owner. Transfira a ownership primeiro.');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Usuário removido da organização');
      loadUserOrganizations();
    } catch (error) {
      console.error('Erro ao remover da organização:', error);
      toast.error('Erro ao remover da organização');
    }
  };

  const handleAddToOrg = async (orgId: string, role: OrganizationRole) => {
    try {
      const permissions = getPermissionsByRole(role);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: user.id,
          role,
          permissions,
          is_active: true,
          invited_by: currentUser?.id,
          joined_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Usuário adicionado à organização!');
      loadUserOrganizations();
    } catch (error) {
      console.error('Erro ao adicionar à organização:', error);
      toast.error('Erro ao adicionar à organização');
    }
  };

  const handleAdvancedAction = async () => {
    if (!confirmDialog.type) return;

    setLoading(true);
    try {
      switch (confirmDialog.type) {
        case 'reset':
          toast.info('Funcionalidade de reset de senha requer Service Role Key');
          break;
        
        case 'logout':
          toast.info('Funcionalidade de logout forçado requer Service Role Key');
          break;
        
        case 'deactivate':
          const { error: deactivateError } = await supabase
            .from('organization_members')
            .update({ is_active: false })
            .eq('user_id', user.id);

          if (deactivateError) throw deactivateError;
          toast.success('Usuário desativado globalmente');
          break;
        
        case 'delete':
          toast.error('Deletar usuário requer Service Role Key. Use o painel do Supabase.');
          break;
      }
      
      setConfirmDialog({ open: false, type: null });
      onSuccess();
    } catch (error) {
      console.error('Erro na ação avançada:', error);
      toast.error('Erro ao executar ação');
    } finally {
      setLoading(false);
    }
  };

  const userOrgIds = userOrgs.map(o => o.organization_id);
  const orgsNotJoined = availableOrgs.filter(org => !userOrgIds.includes(org.id));

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Editar Usuário
            </DialogTitle>
            <DialogDescription>
              Gerenciar informações e organizações de "{user.full_name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* SEÇÃO A: Informações Básicas */}
            <div className="space-y-4">
              <h4 className="font-medium">Informações Básicas</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email (não editável)</Label>
                  <Input value={user.email} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidadeResponsavel">Unidade Responsável</Label>
                  <Select 
                    value={formData.unidadeResponsavel || ''} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, unidadeResponsavel: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="juazeiro_norte">Juazeiro do Norte</SelectItem>
                      <SelectItem value="fortaleza">Fortaleza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userType">Tipo de Usuário</Label>
                  <Select 
                    value={formData.userType} 
                    onValueChange={(v: 'admin' | 'gerente' | 'viewer') => setFormData(prev => ({ ...prev, userType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">👀 Visualizador</SelectItem>
                      <SelectItem value="gerente">👔 Gerente</SelectItem>
                      <SelectItem value="admin">🛡️ Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar Informações Básicas
              </Button>
            </div>

            <Separator />

            {/* SEÇÃO B: Organizações e Roles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Organizações do Usuário</h4>
                <span className="text-sm text-muted-foreground">{userOrgs.length} organização(ões)</span>
              </div>

              {userOrgs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Usuário não pertence a nenhuma organização
                </p>
              ) : (
                <div className="space-y-2">
                  {userOrgs.map(org => (
                    <Card key={org.id} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <p className="font-medium">{org.org_name}</p>
                            {org.role === 'owner' && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                Owner
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">/{org.org_slug}</p>
                          {org.role === 'owner' && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ Para alterar role ou remover, transfira a ownership primeiro
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <RoleSelector
                            value={org.role}
                            onChange={(newRole) => handleRoleChange(org.id, org.organization_id, newRole, org.role)}
                            disabled={org.role === 'owner'}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromOrg(org.id, org.org_name, org.role)}
                            disabled={org.role === 'owner'}
                            title={org.role === 'owner' ? 'Não é possível remover o owner' : 'Remover da organização'}
                          >
                            <X className={`w-4 h-4 ${org.role === 'owner' ? 'text-gray-400' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {orgsNotJoined.length > 0 && (
                <details className="border rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar a Nova Organização ({orgsNotJoined.length} disponível)
                  </summary>
                  <div className="mt-4 space-y-2">
                    {orgsNotJoined.map(org => (
                      <div key={org.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                        <span className="text-sm">{org.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToOrg(org.id, 'member')}
                        >
                          Adicionar como Member
                        </Button>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            <Separator />

            {/* SEÇÃO C: Ações Avançadas */}
            <div className="space-y-4">
              <h4 className="font-medium text-red-600">Ações Avançadas</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialog({ open: true, type: 'reset' })}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Resetar Senha
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialog({ open: true, type: 'logout' })}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Forçar Logout
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialog({ open: true, type: 'deactivate' })}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Desativar Globalmente
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmDialog({ open: true, type: 'delete' })}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar Usuário
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'reset' && 'Resetar Senha do Usuário'}
              {confirmDialog.type === 'logout' && 'Forçar Logout do Usuário'}
              {confirmDialog.type === 'deactivate' && 'Desativar Usuário Globalmente'}
              {confirmDialog.type === 'delete' && 'Deletar Usuário Permanentemente'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'reset' && `Enviar email de reset de senha para ${user.email}?`}
              {confirmDialog.type === 'logout' && `Revogar todas as sessões ativas de ${user.full_name}?`}
              {confirmDialog.type === 'deactivate' && `Desativar ${user.full_name} em todas as organizações?`}
              {confirmDialog.type === 'delete' && (
                <span className="text-red-600 font-semibold">
                  ATENÇÃO: Esta ação é PERMANENTE e não pode ser desfeita! Deletar {user.full_name}?
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAdvancedAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

