import { User, Mail, Building2, Calendar, ShieldCheck } from 'lucide-react';
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
  created_at: string;
  updated_at?: string;
  org_count: number;
}

interface UserCardProps {
  user: UserProfile;
  onViewDetails: (user: UserProfile) => void;
  onManage: (user: UserProfile) => void;
}

export function UserCard({ user, onViewDetails, onManage }: UserCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{user.full_name}</CardTitle>
          </div>
          {user.user_type === 'admin' && (
            <Badge variant="destructive" className="bg-red-500">
              <ShieldCheck className="w-3 h-3 mr-1" />
              ADMIN
            </Badge>
          )}
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
          {user.unidade_responsavel && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Unidade:</p>
              <Badge variant="outline">{user.unidade_responsavel}</Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="w-3 h-3" />
          Cadastrado em {format(new Date(user.created_at), 'dd/MM/yyyy')}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(user)}
          >
            Detalhes
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onManage(user)}
          >
            Gerenciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

