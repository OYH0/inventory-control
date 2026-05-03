import { Card, CardContent } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';

export function CamaraRefrigeradaEmptyState() {
  return (
    <Card className="card-elevated border-dashed border-2 border-border bg-muted/20">
      <CardContent className="p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-info/10 text-info flex items-center justify-center mb-4">
          <Thermometer className="w-7 h-7" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-1">
          Nenhum item na câmara refrigerada
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Os itens aparecerão aqui quando forem movidos da câmara fria
          para descongelamento.
        </p>
      </CardContent>
    </Card>
  );
}
