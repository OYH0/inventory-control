import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeProvider';

export function PendingApprovalScreen() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-[100svh] relative bg-background overflow-hidden">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-success/10 blur-3xl" />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-[100svh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-elevated animate-enter">
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-warning/15 flex items-center justify-center mb-5 ring-4 ring-warning/10">
                <Clock className="w-7 h-7 text-warning" strokeWidth={2.5} />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Aguardando aprovação
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Seu cadastro foi recebido. Um administrador precisa autorizar
                seu acesso antes que você entre no sistema.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-medium truncate">{user?.email}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <span>
                  O administrador definirá qual unidade você representa e quais
                  unidades poderá visualizar e modificar.
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 gap-2"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
