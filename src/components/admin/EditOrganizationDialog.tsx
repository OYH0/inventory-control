import { useState, useEffect } from 'react';
import { Building2, Loader2, AlertTriangle, Users, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AdminOrganization } from '@/hooks/admin/useAdminOrganizations';

interface EditOrganizationDialogProps {
  organization: AdminOrganization;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditOrganizationDialog({ organization, onClose, onSuccess }: EditOrganizationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    slug: organization.slug,
    maxUsers: organization.max_users || 10,
    subscriptionTier: organization.subscription_tier || 'free',
    primaryColor: organization.primary_color || '#3B82F6',
    isActive: organization.is_active
  });

  useEffect(() => {
    setFormData({
      name: organization.name,
      slug: organization.slug,
      maxUsers: organization.max_users || 10,
      subscriptionTier: organization.subscription_tier || 'free',
      primaryColor: organization.primary_color || '#3B82F6',
      isActive: organization.is_active
    });
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar se slug foi alterado e se é único
      if (formData.slug !== organization.slug) {
        const { data: existingOrg } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', formData.slug)
          .neq('id', organization.id)
          .single();

        if (existingOrg) {
          toast.error('Slug já está em uso. Por favor, escolha outro.');
          setLoading(false);
          return;
        }
      }

      // Atualizar organização
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          slug: formData.slug,
          max_users: formData.maxUsers,
          subscription_tier: formData.subscriptionTier,
          primary_color: formData.primaryColor,
          is_active: formData.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast.success('Organização atualizada com sucesso!');
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar organização:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar organização');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Editar Organização
          </DialogTitle>
          <DialogDescription>
            Altere as informações da organização "{organization.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Não Editáveis */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Informações Não Editáveis</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Data de Criação</p>
                <p className="font-medium">{format(new Date(organization.created_at), 'dd/MM/yyyy HH:mm')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Owner Atual</p>
                <p className="font-medium">{organization.owner_name}</p>
                <p className="text-xs text-muted-foreground">{organization.owner_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Total de Membros
                </p>
                <p className="font-medium">{organization.member_count}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Total de Itens
                </p>
                <p className="font-medium">{organization.total_items}</p>
              </div>
            </div>
          </div>

          {/* Campos Editáveis */}
          <div className="grid grid-cols-2 gap-4">
            {/* Coluna 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome da Organização <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                  required
                  pattern="^[a-z0-9-]+$"
                  className="font-mono"
                />
                {formData.slug !== organization.slug && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Alterar o slug pode quebrar integrações existentes!
                    </AlertDescription>
                  </Alert>
                )}
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

            {/* Coluna 2 */}
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

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Organização Ativa</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

