import { useState } from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrganizationCard } from './OrganizationCard';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { EditOrganizationDialog } from './EditOrganizationDialog';
import { useAdminOrganizations, AdminOrganization } from '@/hooks/admin/useAdminOrganizations';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrganizationsManagement() {
  const { organizations, loading, refetch } = useAdminOrganizations();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingOrg, setEditingOrg] = useState<AdminOrganization | null>(null);

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = 
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.slug.toLowerCase().includes(search.toLowerCase()) ||
      org.owner_email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && org.is_active) ||
      (statusFilter === 'inactive' && !org.is_active);
    
    return matchesSearch && matchesStatus && !org.deleted_at;
  });

  const handleViewDetails = (org: AdminOrganization) => {
    // Abrir modal de edição (usa o mesmo dialog)
    setEditingOrg(org);
  };

  const handleEdit = (org: AdminOrganization) => {
    setEditingOrg(org);
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
            <Skeleton key={i} className="h-64" />
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
          <h3 className="text-lg font-semibold">Gerenciamento de Organizações</h3>
          <p className="text-sm text-muted-foreground">
            {organizations.filter(o => !o.deleted_at).length} organização(ões) cadastrada(s)
          </p>
        </div>
        <CreateOrganizationDialog onSuccess={refetch} />
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, slug ou email do owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="inactive">Inativas</SelectItem>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{organizations.filter(o => !o.deleted_at).length}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Ativas</p>
          <p className="text-2xl font-bold text-green-600">
            {organizations.filter(o => o.is_active && !o.deleted_at).length}
          </p>
        </div>
        <div className="bg-gray-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Inativas</p>
          <p className="text-2xl font-bold text-gray-600">
            {organizations.filter(o => !o.is_active && !o.deleted_at).length}
          </p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Membros</p>
          <p className="text-2xl font-bold text-blue-600">
            {organizations.reduce((sum, o) => sum + o.member_count, 0)}
          </p>
        </div>
      </div>

      {/* Lista de Organizações */}
      {filteredOrgs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma organização encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map(org => (
            <OrganizationCard
              key={org.id}
              org={org}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Dialog de Edição */}
      {editingOrg && (
        <EditOrganizationDialog
          organization={editingOrg}
          onClose={() => setEditingOrg(null)}
          onSuccess={() => {
            refetch();
            setEditingOrg(null);
          }}
        />
      )}
    </div>
  );
}

