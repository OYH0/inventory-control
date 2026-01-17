import { useState, useEffect } from 'react';
import { Search, RefreshCw, Filter, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action_type: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  org_name?: string;
  user_email?: string;
}

const actionTypeLabels: Record<string, string> = {
  'INSERT': 'Criação',
  'UPDATE': 'Atualização',
  'DELETE': 'Exclusão',
  'LOGIN': 'Login',
  'LOGOUT': 'Logout',
};

const actionTypeColors: Record<string, string> = {
  'INSERT': 'bg-green-500',
  'UPDATE': 'bg-blue-500',
  'DELETE': 'bg-red-500',
  'LOGIN': 'bg-purple-500',
  'LOGOUT': 'bg-gray-500',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Verificar se usuário é admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profile?.user_type !== 'admin') {
        throw new Error('Acesso negado: apenas administradores');
      }

      // Note: organization_audit_log table doesn't exist yet
      // For now, we'll show an empty state until the audit log table is created
      setLogs([]);
      toast.info('Tabela de auditoria ainda não foi implementada');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar logs';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.org_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.table_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    const matchesTable = tableFilter === 'all' || log.table_name === tableFilter;
    
    return matchesSearch && matchesAction && matchesTable;
  });

  const uniqueTables = Array.from(new Set(logs.map(l => l.table_name))).sort();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por organização, usuário ou tabela..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ações</SelectItem>
            <SelectItem value="INSERT">Criação</SelectItem>
            <SelectItem value="UPDATE">Atualização</SelectItem>
            <SelectItem value="DELETE">Exclusão</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tabela" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas tabelas</SelectItem>
            {uniqueTables.map(table => (
              <SelectItem key={table} value={table}>{table}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="icon"
          onClick={fetchLogs}
          title="Atualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Info */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-blue-700">
              Exibindo os últimos 500 registros de auditoria. Total filtrado: <strong>{filteredLogs.length}</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum log encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map(log => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={actionTypeColors[log.action_type] || 'bg-gray-500'}>
                        {actionTypeLabels[log.action_type] || log.action_type}
                      </Badge>
                      <Badge variant="outline">{log.table_name}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>

                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Organização:</span>{' '}
                        <span className="font-medium">{log.org_name}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Usuário:</span>{' '}
                        <span className="font-medium">{log.user_email}</span>
                      </p>
                      {log.ip_address && (
                        <p>
                          <span className="text-muted-foreground">IP:</span>{' '}
                          <span className="font-mono text-xs">{log.ip_address}</span>
                        </p>
                      )}
                    </div>

                    {/* Dados modificados (apenas para UPDATE) */}
                    {log.action_type === 'UPDATE' && log.old_data && log.new_data && (
                      <details className="text-xs mt-2">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Ver alterações
                        </summary>
                        <div className="mt-2 p-2 bg-muted rounded space-y-1">
                          <pre className="overflow-x-auto">
                            {JSON.stringify({ old: log.old_data, new: log.new_data }, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

