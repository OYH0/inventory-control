import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  LogOut,
  User,
  Home,
  Snowflake,
  Thermometer,
  Package2,
  FileText,
  Settings,
  Wine,
  Bell,
  BarChart3,
  ShoppingCart,
  Shield,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUnit } from '@/contexts/UnitContext';
import { UnitSelector } from '@/components/UnitSelector';
import { ThemeToggle } from '@/components/ThemeProvider';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const routeConfig: Record<string, { title: string; description?: string; icon: React.ComponentType<{ className?: string }> }> = {
  '/': { title: 'Dashboard', description: 'Visão geral do estoque', icon: Home },
  '/camara-fria': { title: 'Câmara Fria', description: 'Carnes e congelados', icon: Snowflake },
  '/camara-refrigerada': { title: 'Câmara Refrigerada', description: 'Em descongelamento', icon: Thermometer },
  '/estoque-seco': { title: 'Estoque Seco', description: 'Não perecíveis', icon: Package2 },
  '/descartaveis': { title: 'Descartáveis', description: 'Pratos, copos e utensílios', icon: FileText },
  '/bebidas': { title: 'Bebidas', description: 'Refrigerantes, sucos e mais', icon: Wine },
  '/alertas-vencimento': { title: 'Alertas de Vencimento', icon: Bell },
  '/analise-abc': { title: 'Análise ABC', icon: BarChart3 },
  '/pedidos': { title: 'Pedidos', icon: ShoppingCart },
  '/configuracoes': { title: 'Configurações', icon: Settings },
  '/master-panel': { title: 'Painel Master', icon: Shield },
};

export function Header() {
  const { user, signOut } = useAuth();
  const { selectedUnit, accessibleUnits, setSelectedUnit, loading: unitLoading, isMaster } = useUnit();
  const location = useLocation();
  const isMobile = useIsMobile();

  const currentRoute = routeConfig[location.pathname];
  const Icon = currentRoute?.icon ?? Home;

  return (
    <header className="flex h-16 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 px-3 md:px-6">
      <SidebarTrigger className="md:-ml-1" />

      {/* Título da rota */}
      <div className="flex items-center gap-3 ml-2 md:ml-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-base md:text-lg font-semibold text-foreground leading-tight truncate">
            {currentRoute?.title ?? ''}
          </h1>
          {currentRoute?.description && !isMobile && (
            <p className="text-xs text-muted-foreground leading-tight truncate">
              {currentRoute.description}
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        {isMaster && !isMobile && (
          <Badge
            className="gap-1 bg-amber-500 hover:bg-amber-500 text-white border-amber-600"
            title="Você é o MASTER do sistema."
          >
            <Crown className="h-3.5 w-3.5" />
            <span className="font-semibold tracking-wide text-[11px]">MASTER</span>
          </Badge>
        )}

        <UnitSelector
          selectedUnit={selectedUnit}
          accessibleUnits={accessibleUnits}
          onUnitChange={setSelectedUnit}
          loading={unitLoading}
          showLabel={false}
        />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-[18px] w-[18px]" />
              <span className="sr-only">Menu do usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              {isMaster && <Crown className="w-3.5 h-3.5 text-amber-500" />}
              <span className="truncate">{user?.email || 'Usuário'}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
