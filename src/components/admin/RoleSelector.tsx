import { Crown, Zap, Shield, User, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type OrganizationRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

interface RoleSelectorProps {
  value: OrganizationRole;
  onChange: (role: OrganizationRole) => void;
  disabled?: boolean;
}

const ROLES = [
  { 
    value: 'owner' as const, 
    label: 'Owner', 
    icon: Crown,
    description: 'Controle total da organização',
    color: 'text-yellow-600'
  },
  { 
    value: 'admin' as const, 
    label: 'Administrador', 
    icon: Zap,
    description: 'Gerenciar tudo exceto ownership',
    color: 'text-red-600'
  },
  { 
    value: 'manager' as const, 
    label: 'Gerente', 
    icon: Shield,
    description: 'CRUD completo de inventário',
    color: 'text-blue-600'
  },
  { 
    value: 'member' as const, 
    label: 'Funcionário', 
    icon: User,
    description: 'Ler e escrever dados',
    color: 'text-green-600'
  },
  { 
    value: 'viewer' as const, 
    label: 'Visualizador', 
    icon: Eye,
    description: 'Apenas visualização',
    color: 'text-gray-600'
  }
];

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  const selectedRole = ROLES.find(r => r.value === value);
  const Icon = selectedRole?.icon || User;

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={disabled ? 'opacity-50 cursor-not-allowed' : ''}>
        <SelectValue>
          {selectedRole && (
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${selectedRole.color}`} />
              <span>{selectedRole.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ROLES.map(role => {
          const RoleIcon = role.icon;
          return (
            <SelectItem key={role.value} value={role.value}>
              <div className="flex items-start gap-3 py-1">
                <RoleIcon className={`w-5 h-5 mt-0.5 ${role.color}`} />
                <div>
                  <div className="font-medium">{role.label}</div>
                  <div className="text-xs text-muted-foreground">{role.description}</div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function getPermissionsByRole(role: OrganizationRole) {
  const permissionsMap = {
    owner: {
      inventory: { read: true, write: true, delete: true },
      alerts: { read: true, write: true, delete: true },
      reports: { read: true, write: true, delete: true },
      settings: { read: true, write: true, delete: true }
    },
    admin: {
      inventory: { read: true, write: true, delete: true },
      alerts: { read: true, write: true, delete: true },
      reports: { read: true, write: true, delete: true },
      settings: { read: true, write: true, delete: false }
    },
    manager: {
      inventory: { read: true, write: true, delete: true },
      alerts: { read: true, write: true, delete: false },
      reports: { read: true, write: true, delete: false },
      settings: { read: true, write: false, delete: false }
    },
    member: {
      inventory: { read: true, write: true, delete: false },
      alerts: { read: true, write: false, delete: false },
      reports: { read: true, write: false, delete: false },
      settings: { read: false, write: false, delete: false }
    },
    viewer: {
      inventory: { read: true, write: false, delete: false },
      alerts: { read: true, write: false, delete: false },
      reports: { read: true, write: false, delete: false },
      settings: { read: false, write: false, delete: false }
    }
  };
  
  return permissionsMap[role] || permissionsMap.member;
}

