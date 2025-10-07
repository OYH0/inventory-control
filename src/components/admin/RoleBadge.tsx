import { Crown, Zap, Shield, User, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
}

const roleConfig = {
  owner: {
    label: 'Owner',
    icon: Crown,
    variant: 'default' as const,
    className: 'bg-yellow-500 text-white hover:bg-yellow-600',
  },
  admin: {
    label: 'Admin',
    icon: Zap,
    variant: 'destructive' as const,
    className: 'bg-red-500 text-white hover:bg-red-600',
  },
  manager: {
    label: 'Manager',
    icon: Shield,
    variant: 'default' as const,
    className: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  member: {
    label: 'Member',
    icon: User,
    variant: 'secondary' as const,
    className: '',
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    variant: 'outline' as const,
    className: '',
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

