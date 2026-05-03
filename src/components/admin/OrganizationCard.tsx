import { Building2, Users, Package, Calendar, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="card-elevated overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold text-foreground truncate">
                {org.name}
              </h3>
              <p className="font-mono text-[11px] text-muted-foreground truncate">
                /{org.slug}
              </p>
            </div>
          </div>
          <StatusBadge isActive={org.is_active} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/40 px-3 py-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-info shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">
                Membros
              </p>
              <p className="text-base font-display font-bold tabular-nums leading-tight mt-0.5">
                {org.member_count}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-muted/40 px-3 py-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">
                Itens
              </p>
              <p className="text-base font-display font-bold tabular-nums leading-tight mt-0.5">
                {org.total_items}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/60 space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Owner
          </p>
          <p className="text-sm font-medium text-foreground truncate">{org.owner_name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
            <Mail className="w-3 h-3 shrink-0" />
            {org.owner_email}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          Criada em {format(new Date(org.created_at), 'dd/MM/yyyy')}
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetails(org)}>
            Detalhes
          </Button>
          <Button size="sm" className="flex-1" onClick={() => onEdit(org)}>
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
