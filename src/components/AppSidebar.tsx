import React from "react";
import {
  Home,
  Snowflake,
  Thermometer,
  Package2,
  FileText,
  LogOut,
  Settings,
  Wine,
  Bell,
  BarChart3,
  ShoppingCart,
  Shield,
  Flame,
  Crown,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUnit } from "@/contexts/UnitContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const estoqueItems: NavItem[] = [
  { title: "Câmara Fria", url: "/camara-fria", icon: Snowflake },
  { title: "Câmara Refrigerada", url: "/camara-refrigerada", icon: Thermometer },
  { title: "Estoque Seco", url: "/estoque-seco", icon: Package2 },
  { title: "Bebidas", url: "/bebidas", icon: Wine },
  { title: "Descartáveis", url: "/descartaveis", icon: FileText },
];

const operacoesItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart },
  { title: "Análise ABC", url: "/analise-abc", icon: BarChart3 },
  { title: "Alertas de Vencimento", url: "/alertas-vencimento", icon: Bell },
];

const adminItems: NavItem[] = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

const masterItems: NavItem[] = [
  { title: "Painel Master", url: "/master-panel", icon: Shield },
];

function NavItemRow({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className="p-0 h-auto data-[active=true]:bg-transparent">
        <NavLink
          to={item.url}
          end={item.url === "/"}
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              isActive &&
                "bg-sidebar-accent text-sidebar-foreground before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-sidebar-primary"
            )
          }
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const { isAdmin } = useUserPermissions();
  const { isMaster } = useUnit();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  const handleItemClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const initial = (user?.email || 'U').charAt(0).toUpperCase();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 pt-5 pb-4 border-b border-sidebar-border/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-warm-gradient flex items-center justify-center shadow-md shrink-0">
            <Flame className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-sidebar-foreground leading-tight truncate">
              Companhia do Churrasco
            </p>
            <p className="text-[11px] text-sidebar-foreground/60 leading-tight">
              Gestão de estoque
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Operações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {operacoesItems.map((item) => (
                <NavItemRow key={item.url} item={item} onClick={handleItemClick} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Estoque
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {estoqueItems.map((item) => (
                <NavItemRow key={item.url} item={item} onClick={handleItemClick} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isAdmin || isMaster) && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Sistema
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {isAdmin && adminItems.map((item) => (
                  <NavItemRow key={item.url} item={item} onClick={handleItemClick} />
                ))}
                {isMaster && masterItems.map((item) => (
                  <NavItemRow key={item.url} item={item} onClick={handleItemClick} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/50 mb-2">
          <Avatar className="h-9 w-9 ring-2 ring-sidebar-border">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user?.email || 'usuário'}
            </p>
            {isMaster && (
              <Badge className="mt-1 h-4 px-1.5 text-[10px] gap-0.5 bg-amber-500 hover:bg-amber-500 text-white border-amber-600">
                <Crown className="w-2.5 h-2.5" />
                MASTER
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
