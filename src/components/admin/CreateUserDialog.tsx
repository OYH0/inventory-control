import { useState } from 'react';
import { Plus, UserPlus, Loader2, AlertCircle } from 'lucide-react';
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
import { RoleSelector, OrganizationRole, getPermissionsByRole } from './RoleSelector';

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
    unidadeResponsavel: 'juazeiro_norte' as 'juazeiro_norte' | 'fortaleza',
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
      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        toast.error('Email já cadastrado no sistema');
        setLoading(false);
        return;
      }

      // IMPORTANTE: Esta funcionalidade requer Service Role Key
      // Em produção, use Supabase Edge Functions
      toast.error(
        'Criar usuário requer Service Role Key no backend. ' +
        'Configure Supabase Edge Functions para esta funcionalidade.',
        { duration: 5000 }
      );
      
      // Código comentado - requer service role key ou edge function
      /*
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.fullName
        }
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: formData.email,
          full_name: formData.fullName,
          user_type: formData.userType,
          unidade_responsavel: formData.unidadeResponsavel
        });

      if (profileError) throw profileError;

      if (formData.organizationId) {
        const permissions = getPermissionsByRole(formData.organizationRole);
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase
          .from('organization_members')
          .insert({
            organization_id: formData.organizationId,
            user_id: newUser.user.id,
            role: formData.organizationRole,
            permissions,
            is_active: true,
            invited_by: user?.id,
            joined_at: new Date().toISOString()
          });
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
      */

      setLoading(false);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar usuário');
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

        {/* Alert sobre Service Role Key */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-800">
            <strong>Funcionalidade Requer Backend:</strong> Criar usuários requer Service Role Key que não deve ser exposta no frontend.
            Configure uma <strong>Supabase Edge Function</strong> para habilitar esta funcionalidade com segurança.
          </AlertDescription>
        </Alert>

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

