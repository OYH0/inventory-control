import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function CamaraRefrigeradaInstructions() {
  return (
    <Card className="card-elevated border-info/30 bg-info/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-info/15 text-info flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-display text-sm font-semibold text-foreground mb-2">
              Instruções de Descongelamento
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Carnes pequenas (até 2 kg): 30–45 min</li>
              <li>• Carnes médias (2–5 kg): 1–2 h</li>
              <li>• Carnes grandes (acima de 5 kg): 3–4 h</li>
              <li>• Manter sempre a 2–4 °C</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
