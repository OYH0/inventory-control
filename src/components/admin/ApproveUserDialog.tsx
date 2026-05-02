import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { AdminUser, ApprovePayload } from '@/hooks/admin/useAdminUsers';

interface ApproveUserDialogProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (payload: ApprovePayload) => Promise<void>;
}

export function ApproveUserDialog({ user, onClose, onConfirm }: ApproveUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'gerente' | 'viewer'>('viewer');
  const [unidadeResponsavel, setUnidadeResponsavel] = useState<'juazeiro_norte' | 'fortaleza' | 'todas'>('juazeiro_norte');
  const [canViewJuazeiro, setCanViewJuazeiro] = useState(true);
  const [canViewFortaleza, setCanViewFortaleza] = useState(false);
  const [canModifyJuazeiro, setCanModifyJuazeiro] = useState(false);
  const [canModifyFortaleza, setCanModifyFortaleza] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm({
        userType,
        unidadeResponsavel: unidadeResponsavel === 'todas' ? null : unidadeResponsavel,
        canViewJuazeiro,
        canViewFortaleza,
        canModifyJuazeiro,
        canModifyFortaleza,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Aprovar usuário
          </DialogTitle>
          <DialogDescription>
            Defina o tipo, unidade responsável e quais unidades este usuário pode acessar.
            <br />
            <span className="font-medium">{user.full_name || user.email}</span> ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Tipo de usuário</Label>
            <Select value={userType} onValueChange={(v: any) => setUserType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Visualizador (só leitura)</SelectItem>
                <SelectItem value="gerente">Gerente (modifica unidade própria)</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unidade responsável</Label>
            <Select value={unidadeResponsavel} onValueChange={(v: any) => setUnidadeResponsavel(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="juazeiro_norte">Juazeiro do Norte</SelectItem>
                <SelectItem value="fortaleza">Fortaleza</SelectItem>
                <SelectItem value="todas">Todas (acesso global, só faz sentido para admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Permissões granulares por unidade</p>
            <p className="text-xs text-muted-foreground">
              Marque o que este usuário pode visualizar e/ou modificar.
              "Modificar" inclui visualizar.
            </p>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="font-medium">Unidade</div>
              <div className="font-medium text-center">Visualizar</div>
              <div className="font-medium text-center">Modificar</div>

              <div>Juazeiro do Norte</div>
              <div className="text-center">
                <Checkbox checked={canViewJuazeiro} onCheckedChange={(v) => setCanViewJuazeiro(!!v)} />
              </div>
              <div className="text-center">
                <Checkbox checked={canModifyJuazeiro} onCheckedChange={(v) => setCanModifyJuazeiro(!!v)} />
              </div>

              <div>Fortaleza</div>
              <div className="text-center">
                <Checkbox checked={canViewFortaleza} onCheckedChange={(v) => setCanViewFortaleza(!!v)} />
              </div>
              <div className="text-center">
                <Checkbox checked={canModifyFortaleza} onCheckedChange={(v) => setCanModifyFortaleza(!!v)} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Aprovando...</>
            ) : (
              <>Aprovar</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
