import { User, Mail, Building2, Calendar, ShieldCheck, Crown, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'gerente' | 'viewer';
  unidade_responsavel: 'juazeiro_norte' | 'fortaleza' | null;
  is_master?: boolean;
  created_at: string;
  updated_at?: string;
  org_count: number;
}

interface UserCardProps {
  user: UserProfile;
  onViewDetails: (user: UserProfile) => void;
  onManage: (user: UserProfile) => void;
  onDelete?: (user: UserProfile) => void;
  onToggleMaster?: (user: UserProfile) => void;
  currentUserId?: string;
  currentUserIsMaster?: boolean;
}

export function UserCard({
  user,
  onViewDetails,
  onManage,
  onDelete,
  onToggleMaster,
  currentUserId,
  currentUserIsMaster,
}: UserCardProps) {
  const isSelf = currentUserId === user.id;
  const canDelete = !isSelf && !user.is_master && !!onDelete;
  const canToggleMaster = currentUserIsMaster && !isSelf && !!onToggleMaster;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <User className="w-5 h-5 text-primary shrink-0" />
            <CardTitle className="text-lg truncate">{user.full_name}</CardTitle>
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {user.is_master && (
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-amber-600 gap-1">
                <Crown className="w-3 h-3" />
                MASTER
              </Badge>
            )}
            {user.user_type === 'admin' && !user.is_master && (
              <Badge variant="destructive" className="bg-red-500">
                <ShieldCheck className="w-3 h-3 mr-1" />
                ADMIN
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Mail className="w-3 h-3" />
          {user.email}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span>{user.org_count} org(s)</span>
          </div>
          {user.unidade_responsavel ? (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Unidade Responsável:</p>
              <Badge variant="outline">
                {user.unidade_responsavel === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza'}
              </Badge>
            </div>
          ) : (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Unidade Responsável:</p>
              <Badge variant="outline">Todas (acesso global)</Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="w-3 h-3" />
          Cadastrado em {format(new Date(user.created_at), 'dd/MM/yyyy')}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[80px]"
            onClick={() => onViewDetails(user)}
          >
            Detalhes
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 min-w-[80px]"
            onClick={() => onManage(user)}
          >
            Gerenciar
          </Button>
          {canToggleMaster && (
            <Button
              variant="outline"
              size="sm"
              className={
                user.is_master
                  ? 'border-amber-600 text-amber-700 hover:bg-amber-50'
                  : 'border-amber-300 text-amber-600 hover:bg-amber-50'
              }
              onClick={() => onToggleMaster?.(user)}
              title={user.is_master ? 'Remover bandeira MASTER' : 'Tornar MASTER'}
            >
              <Crown className="w-4 h-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete?.(user)}
              title="Deletar usuário"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
