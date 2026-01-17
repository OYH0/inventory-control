import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Building2 } from 'lucide-react';
import type { Unidade } from '@/hooks/useUnitPermissions';

interface UnitSelectionScreenProps {
  accessibleUnits: Unidade[];
  onSelectUnit: (unit: Unidade) => void;
  loading?: boolean;
}

const unitLabels: Record<Unidade, string> = {
  juazeiro_norte: 'Juazeiro do Norte',
  fortaleza: 'Fortaleza',
};

const unitIcons: Record<Unidade, string> = {
  juazeiro_norte: '🏜️',
  fortaleza: '🌊',
};

const unitDescriptions: Record<Unidade, string> = {
  juazeiro_norte: 'Unidade localizada em Juazeiro do Norte - CE',
  fortaleza: 'Unidade localizada em Fortaleza - CE',
};

export function UnitSelectionScreen({ accessibleUnits, onSelectUnit, loading }: UnitSelectionScreenProps) {
  if (loading) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-churrasco-red mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando unidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-32 h-32 mb-6 flex items-center justify-center">
            <img 
              src="/lovable-uploads/802f7946-9f7b-4f8d-a604-5110eaf96fd9.png" 
              alt="Companhia do Churrasco Logo"
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <MapPin className="w-6 h-6 text-churrasco-orange" />
            Selecione a Unidade
          </h1>
          <p className="text-muted-foreground text-sm">
            Escolha a unidade que deseja acessar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessibleUnits.map((unit) => (
            <Card 
              key={unit}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-churrasco-orange/50 hover:scale-[1.02] border-2"
              onClick={() => onSelectUnit(unit)}
            >
              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-2">{unitIcons[unit]}</div>
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  <Building2 className="w-5 h-5 text-churrasco-orange" />
                  {unitLabels[unit]}
                </CardTitle>
                <CardDescription className="text-xs">
                  {unitDescriptions[unit]}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full bg-gradient-to-r from-churrasco-red to-churrasco-orange hover:from-churrasco-red/90 hover:to-churrasco-orange/90 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUnit(unit);
                  }}
                >
                  Acessar Unidade
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {accessibleUnits.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Você não tem acesso a nenhuma unidade.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Entre em contato com o administrador do sistema.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
