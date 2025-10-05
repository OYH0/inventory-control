// =====================================================
// COMPONENT: ConfirmDialog - Dialog de Confirmação Estilizado
// =====================================================

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  icon?: 'check' | 'cancel' | 'delete' | 'warning';
}

const ICON_MAP = {
  check: CheckCircle,
  cancel: XCircle,
  delete: Trash2,
  warning: AlertTriangle
};

const VARIANT_COLORS = {
  default: 'text-primary',
  destructive: 'text-destructive',
  warning: 'text-orange-600'
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  icon = 'check'
}: ConfirmDialogProps) {
  const Icon = ICON_MAP[icon];
  const iconColor = VARIANT_COLORS[variant];
  
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${
              variant === 'destructive' ? 'bg-destructive/10' :
              variant === 'warning' ? 'bg-orange-100' :
              'bg-primary/10'
            }`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' :
              variant === 'warning' ? 'bg-orange-600 hover:bg-orange-700' :
              ''
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;

