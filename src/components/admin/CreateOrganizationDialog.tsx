import { useState } from 'react';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateOrganizationDialogProps {
  onSuccess: () => void;
}

export function CreateOrganizationDialog({ onSuccess }: CreateOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    ownerEmail: '',
    maxUsers: 10,
    subscriptionTier: 'free',
    primaryColor: '#3B82F6',
    unidadePrincipal: 'juazeiro_norte',
    isActive: true,
    observacoes: ''
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verificar se slug é único
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', formData.slug)
        .single();

      if (existingOrg) {
        toast.error('Slug já está em uso. Por favor, escolha outro.');
        setLoading(false);
        return;
      }

      // 2. Buscar ID do owner pelo email
      const { data: ownerProfile, error: ownerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.ownerEmail)
        .single();

      if (ownerError || !ownerProfile) {
        toast.error('Email do owner não encontrado no sistema');
        setLoading(false);
        return;
      }

      // 3. Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 4. Criar organização
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          slug: formData.slug,
          owner_id: ownerProfile.id,
          max_users: formData.maxUsers,
          subscription_tier: formData.subscriptionTier,
          primary_color: formData.primaryColor,
          is_active: formData.isActive,
          settings: {
            created_by: 'master_admin',
            created_by_user_id: user.id,
            unidade_principal: formData.unidadePrincipal,
            observacoes: formData.observacoes
          }
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 5. Adicionar owner como membro
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: newOrg.id,
          user_id: ownerProfile.id,
          role: 'owner',
          permissions: {
            inventory: { read: true, write: true, delete: true },
            alerts: { read: true, write: true, delete: true },
            reports: { read: true, write: true, delete: true },
            settings: { read: true, write: true, delete: true }
          },
          is_active: true,
          invited_by: user.id,
          joined_at: new Date().toISOString()
        });

      if (memberError) throw memberError;

      toast.success(`Organização "${formData.name}" criada com sucesso!`);
      setOpen(false);
      setFormData({
        name: '',
        slug: '',
        ownerEmail: '',
        maxUsers: 10,
        subscriptionTier: 'free',
        primaryColor: '#3B82F6',
        unidadePrincipal: 'juazeiro_norte',
        isActive: true,
        observacoes: ''
      });
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar organização');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Organização
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Criar Nova Organização
          </DialogTitle>
          <DialogDescription>
            Crie uma nova organização no sistema. O owner receberá acesso total.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Coluna 1: Informações Básicas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome da Organização <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Churrascaria do João"
                  required
                  minLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="churrascaria-do-joao"
                  required
                  pattern="^[a-z0-9-]+$"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Apenas letras minúsculas, números e hífens
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerEmail">
                  Email do Owner <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  placeholder="owner@example.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Deve ser um email de usuário existente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Coluna 2: Configurações */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Máximo de Usuários</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                  min={1}
                  max={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionTier">Tier de Assinatura</Label>
                <Select 
                  value={formData.subscriptionTier} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, subscriptionTier: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">🆓 Free</SelectItem>
                    <SelectItem value="basic">📦 Basic</SelectItem>
                    <SelectItem value="pro">⭐ Pro</SelectItem>
                    <SelectItem value="enterprise">🏢 Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidadePrincipal">Unidade Principal</Label>
                <Select 
                  value={formData.unidadePrincipal} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, unidadePrincipal: v }))}
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

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Organização Ativa</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Notas internas sobre a organização..."
                  rows={4}
                />
              </div>
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
                  <Building2 className="w-4 h-4 mr-2" />
                  Criar Organização
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

