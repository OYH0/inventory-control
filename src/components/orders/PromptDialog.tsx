// =====================================================
// COMPONENT: PromptDialog - Dialog de Input Estilizado
// =====================================================

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: string) => void;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function PromptDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  label = 'Mensagem',
  placeholder = 'Digite aqui...',
  required = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}: PromptDialogProps) {
  const [value, setValue] = useState('');
  
  // Reset value when dialog opens
  useEffect(() => {
    if (open) {
      setValue('');
    }
  }, [open]);
  
  const handleConfirm = () => {
    if (required && !value.trim()) {
      return;
    }
    onConfirm(value);
    onOpenChange(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleConfirm();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="pt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-2 py-4">
          <Label htmlFor="prompt-input">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            id="prompt-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={4}
            className="resize-none"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Pressione Ctrl+Enter para confirmar
          </p>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={required && !value.trim()}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PromptDialog;

