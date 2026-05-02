import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function PendingApprovalScreen() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Aguardando aprovação</CardTitle>
          <CardDescription className="text-sm">
            Seu cadastro foi recebido e está aguardando autorização do administrador.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{user?.email}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O administrador definirá qual unidade você representa e quais unidades
              poderá visualizar e modificar. Você receberá acesso assim que for aprovado.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
