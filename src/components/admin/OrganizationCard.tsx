import { Building2, Users, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Organization {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  subscription_tier: string;
  created_at: string;
  owner_name: string;
  owner_email: string;
  member_count: number;
  total_items: number;
}

interface OrganizationCardProps {
  org: Organization;
  onViewDetails: (org: Organization) => void;
  onEdit: (org: Organization) => void;
}

export function OrganizationCard({ org, onViewDetails, onEdit }: OrganizationCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{org.name}</CardTitle>
          </div>
          <StatusBadge isActive={org.is_active} />
        </div>
        <CardDescription className="flex items-center gap-1">
          <span className="font-mono text-xs">/{org.slug}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{org.member_count} membros</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span>{org.total_items} itens</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-1">Owner:</p>
          <p className="text-sm font-medium">{org.owner_name}</p>
          <p className="text-xs text-muted-foreground">{org.owner_email}</p>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          Criada em {format(new Date(org.created_at), 'dd/MM/yyyy')}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(org)}
          >
            Detalhes
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(org)}
          >
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

