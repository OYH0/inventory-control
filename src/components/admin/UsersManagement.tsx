import { useState } from 'react';
import { Search, RefreshCw, Filter, ShieldCheck, ShieldOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCard } from './UserCard';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { useAdminUsers, AdminUser } from '@/hooks/admin/useAdminUsers';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function UsersManagement() {
  const { users, loading, refetch, promoteToAdmin, demoteFromAdmin } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'promote' | 'demote';
    user: any;
  }>({
    open: false,
    type: 'promote',
    user: null,
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = 
      typeFilter === 'all' ||
      user.user_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

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
      if (confirmDialog.type === 'promote') {
        await promoteToAdmin(confirmDialog.user.id);
      } else {
        await demoteFromAdmin(confirmDialog.user.id);
      }
    } finally {
      setConfirmDialog({ open: false, type: 'promote', user: null });
    }
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
          </p>
        </div>
        <CreateUserDialog onSuccess={refetch} />
      </div>

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

      {/* Dialog de Confirmação (Promover/Remover Admin) - Mantido para quick actions */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.type === 'promote' ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  Promover a Administrador
                </>
              ) : (
                <>
                  <ShieldOff className="w-5 h-5 text-orange-500" />
                  Remover Privilégios de Admin
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'promote' ? (
                <>
                  Você está prestes a promover <strong>{confirmDialog.user?.full_name}</strong> a administrador master.
                  <br /><br />
                  Esta pessoa terá acesso total ao painel de administração e poderá visualizar e gerenciar todas as organizações e usuários do sistema.
                </>
              ) : (
                <>
                  Você está prestes a remover os privilégios de administrador de <strong>{confirmDialog.user?.full_name}</strong>.
                  <br /><br />
                  Esta pessoa perderá acesso ao painel de administração master.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

