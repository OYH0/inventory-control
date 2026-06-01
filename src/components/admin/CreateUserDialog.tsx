import { useState } from 'react';
import { Plus, UserPlus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PasswordGenerator } from './PasswordGenerator';
import { RoleSelector, OrganizationRole } from './RoleSelector';


interface CreateUserDialogProps {
  onSuccess: () => void;
}

export function CreateUserDialog({ onSuccess }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    userType: 'user' as 'user' | 'admin',
    unidadeResponsavel: 'juazeiro_norte' as 'juazeiro_norte' | 'fortaleza' | 'todas',
    organizationId: '',
    organizationRole: 'member' as OrganizationRole,
    sendWelcomeEmail: true
  });
  const [organizations, setOrganizations] = useState<any[]>([]);

  const loadOrganizations = async () => {
    const { data } = await supabase
      .from('admin_all_organizations')
      .select('id, name, slug')
      .order('name');
    
    setOrganizations(data || []);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      loadOrganizations();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obter token JWT do usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Sessão expirada. Faça login novamente.');
        setLoading(false);
        return;
      }

      // Chamar Edge Function create-user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          userType: formData.userType,
          unidadeResponsavel: formData.unidadeResponsavel,
          organizationId: formData.organizationId || undefined,
          organizationRole: formData.organizationRole || undefined,
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar usuário');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success(`Usuário "${formData.fullName}" criado com sucesso!`);
      setOpen(false);
      setFormData({
        email: '',
        fullName: '',
        password: '',
        userType: 'user',
        unidadeResponsavel: 'juazeiro_norte',
        organizationId: '',
        organizationRole: 'member',
        sendWelcomeEmail: true
      });
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Crie um novo usuário no sistema com credenciais temporárias.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Coluna 1: Informações do Usuário */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="João da Silva"
                  required
                />
              </div>

              <PasswordGenerator
                value={formData.password}
                onChange={(pwd) => setFormData(prev => ({ ...prev, password: pwd }))}
                required
              />

              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de Usuário</Label>
                <Select 
                  value={formData.userType} 
                  onValueChange={(v: 'user' | 'admin') => setFormData(prev => ({ ...prev, userType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">👤 Usuário Comum</SelectItem>
                    <SelectItem value="admin">🛡️ Master Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidadeResponsavel">Unidade Responsável</Label>
                <Select 
                  value={formData.unidadeResponsavel} 
                  onValueChange={(v: any) => setFormData(prev => ({ ...prev, unidadeResponsavel: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="juazeiro_norte">Juazeiro do Norte</SelectItem>
                    <SelectItem value="fortaleza">Fortaleza</SelectItem>
                    <SelectItem value="todas">Todas as Unidades (super-admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Coluna 2: Adicionar a Organização */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Adicionar a Organização (Opcional)</Label>
                <Select 
                  value={formData.organizationId || undefined} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, organizationId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma organização..." />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                        <span className="text-xs text-muted-foreground ml-2">/{org.slug}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.organizationId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, organizationId: '' }))}
                    className="text-xs"
                  >
                    Limpar seleção
                  </Button>
                )}
              </div>

              {formData.organizationId && (
                <div className="space-y-2">
                  <Label>Role na Organização</Label>
                  <RoleSelector
                    value={formData.organizationRole}
                    onChange={(role) => setFormData(prev => ({ ...prev, organizationRole: role }))}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="sendWelcomeEmail"
                  checked={formData.sendWelcomeEmail}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, sendWelcomeEmail: checked as boolean }))
                  }
                />
                <Label
                  htmlFor="sendWelcomeEmail"
                  className="text-sm font-normal cursor-pointer"
                >
                  Enviar email de boas-vindas com as credenciais
                </Label>
              </div>

              <Alert className="mt-4">
                <AlertDescription className="text-xs">
                  O usuário receberá a senha temporária e deverá alterá-la no primeiro login.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Usuário
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

