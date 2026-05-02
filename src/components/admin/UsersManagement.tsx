import { useEffect, useState } from 'react';
import { Search, RefreshCw, Filter, ShieldCheck, ShieldOff, Crown, Trash2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCard } from './UserCard';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { ApproveUserDialog } from './ApproveUserDialog';
import { useAdminUsers, AdminUser, ApprovePayload } from '@/hooks/admin/useAdminUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
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

type ConfirmType = 'promote' | 'demote' | 'delete' | 'master-on' | 'master-off';

export default function UsersManagement() {
  const { users, loading, refetch, promoteToAdmin, demoteFromAdmin, deleteUser, setMaster, approveUser } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [approvingUser, setApprovingUser] = useState<AdminUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserIsMaster, setCurrentUserIsMaster] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: ConfirmType;
    user: AdminUser | null;
  }>({
    open: false,
    type: 'promote',
    user: null,
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      const { data } = await supabase
        .from('profiles')
        .select('is_master')
        .eq('id', user.id)
        .single();
      setCurrentUserIsMaster(data?.is_master === true);
    })();
  }, []);

  const pendingUsers = users.filter(u => u.is_approved === false);

  const filteredUsers = users.filter(user => {
    if (user.is_approved === false) return false; // pendentes ficam na seção de cima

    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      typeFilter === 'all' ||
      user.user_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleApproveSubmit = async (payload: ApprovePayload) => {
    if (!approvingUser) return;
    await approveUser(approvingUser.id, payload);
  };

  const handleViewDetails = (user: AdminUser) => {
    setEditingUser(user);
  };

  const handleManage = (user: AdminUser) => {
    // Abrir dialog de edição completo
    setEditingUser(user);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.user) return;

    try {
      switch (confirmDialog.type) {
        case 'promote':
          await promoteToAdmin(confirmDialog.user.id);
          break;
        case 'demote':
          await demoteFromAdmin(confirmDialog.user.id);
          break;
        case 'delete':
          await deleteUser(confirmDialog.user.id);
          break;
        case 'master-on':
          await setMaster(confirmDialog.user.id, true);
          break;
        case 'master-off':
          await setMaster(confirmDialog.user.id, false);
          break;
      }
    } finally {
      setConfirmDialog({ open: false, type: 'promote', user: null });
    }
  };

  const handleDelete = (user: AdminUser) => {
    setConfirmDialog({ open: true, type: 'delete', user });
  };

  const handleToggleMaster = (user: AdminUser) => {
    setConfirmDialog({
      open: true,
      type: user.is_master ? 'master-off' : 'master-on',
      user,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Botão de Criar */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gerenciamento de Usuários</h3>
          <p className="text-sm text-muted-foreground">
            {users.length} usuário(s) cadastrado(s)
            {pendingUsers.length > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · {pendingUsers.length} aguardando aprovação
              </span>
            )}
          </p>
        </div>
        <CreateUserDialog onSuccess={refetch} />
      </div>

      {/* Pendentes de aprovação */}
      {pendingUsers.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Aguardando aprovação
              <Badge variant="outline" className="ml-1 border-amber-400 text-amber-700">
                {pendingUsers.length}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Cadastros novos. Defina tipo, unidade responsável e permissões antes de aprovar.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingUsers.map(u => (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border bg-background p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.full_name || 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setApprovingUser(u)}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => setConfirmDialog({ open: true, type: 'delete', user: u })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="user">Usuários</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="icon"
          onClick={refetch}
          title="Atualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Usuários</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Administradores</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter(u => u.user_type === 'admin').length}
          </p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Em Organizações</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.org_count > 0).length}
          </p>
        </div>
      </div>

      {/* Lista de Usuários */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onViewDetails={handleViewDetails}
              onManage={handleManage}
              onDelete={handleDelete}
              onToggleMaster={currentUserIsMaster ? handleToggleMaster : undefined}
              currentUserId={currentUserId ?? undefined}
              currentUserIsMaster={currentUserIsMaster}
            />
          ))}
        </div>
      )}

      {/* Dialog de Edição */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            refetch();
            setEditingUser(null);
          }}
        />
      )}

      {/* Dialog de Aprovação */}
      {approvingUser && (
        <ApproveUserDialog
          user={approvingUser}
          onClose={() => setApprovingUser(null)}
          onConfirm={handleApproveSubmit}
        />
      )}

      {/* Dialog de Confirmação */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.type === 'promote' && (
                <>
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  Promover a Administrador
                </>
              )}
              {confirmDialog.type === 'demote' && (
                <>
                  <ShieldOff className="w-5 h-5 text-orange-500" />
                  Remover Privilégios de Admin
                </>
              )}
              {confirmDialog.type === 'delete' && (
                <>
                  <Trash2 className="w-5 h-5 text-red-500" />
                  Deletar Usuário
                </>
              )}
              {confirmDialog.type === 'master-on' && (
                <>
                  <Crown className="w-5 h-5 text-amber-500" />
                  Promover a MASTER
                </>
              )}
              {confirmDialog.type === 'master-off' && (
                <>
                  <Crown className="w-5 h-5 text-amber-500" />
                  Remover Bandeira MASTER
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'promote' && (
                <>
                  Você está prestes a promover <strong>{confirmDialog.user?.full_name}</strong> a administrador.
                  <br /><br />
                  Esta pessoa terá acesso ao painel de administração da unidade responsável.
                </>
              )}
              {confirmDialog.type === 'demote' && (
                <>
                  Você está prestes a remover os privilégios de administrador de <strong>{confirmDialog.user?.full_name}</strong>.
                  <br /><br />
                  Esta pessoa perderá acesso ao painel de administração.
                </>
              )}
              {confirmDialog.type === 'delete' && (
                <>
                  Você está prestes a <strong className="text-red-600">deletar permanentemente</strong> o usuário <strong>{confirmDialog.user?.full_name}</strong> ({confirmDialog.user?.email}).
                  <br /><br />
                  Serão removidos: profile, permissões de unidade e vínculos com organizações. A entrada em <code>auth.users</code> permanece (precisa Service Role Key para apagar — pode fazer pelo painel Supabase).
                  <br /><br />
                  <span className="text-red-600 font-medium">Esta ação não pode ser desfeita.</span>
                </>
              )}
              {confirmDialog.type === 'master-on' && (
                <>
                  Você está prestes a tornar <strong>{confirmDialog.user?.full_name}</strong> um <strong className="text-amber-600">MASTER</strong> do sistema.
                  <br /><br />
                  MASTERs têm acesso global a TODAS as unidades, ignorando qualquer restrição. Eles também não podem ser deletados pelo painel.
                </>
              )}
              {confirmDialog.type === 'master-off' && (
                <>
                  Você está prestes a remover a bandeira <strong className="text-amber-600">MASTER</strong> de <strong>{confirmDialog.user?.full_name}</strong>.
                  <br /><br />
                  O usuário continuará admin (se já era) mas voltará a respeitar a Unidade Responsável.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={confirmDialog.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {confirmDialog.type === 'delete' ? 'Deletar' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

