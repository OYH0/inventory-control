import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAlertConfiguration } from '@/hooks/useExpiryAlerts';
import { Bell, Clock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ExpiryAlertSettings() {
  const { config, isLoading, updateConfig, isUpdating } = useAlertConfiguration();
  
  const [warningDays, setWarningDays] = useState<number | ''>(30);
  const [criticalDays, setCriticalDays] = useState<number | ''>(7);
  const [isActive, setIsActive] = useState(true);
  const [frequency, setFrequency] = useState<'realtime' | 'daily' | 'weekly'>('daily');
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [channels, setChannels] = useState<string[]>(['in_app']);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (config) {
      console.log('[ExpiryAlertSettings] Config loaded:', config);
      setWarningDays(config.warning_days || 30);
      setCriticalDays(config.critical_days || 7);
      setIsActive(config.is_active ?? true);
      setFrequency(config.notification_frequency || 'daily');
      setNotificationTime(config.notification_time || '09:00');
      setChannels(config.notification_channels || ['in_app']);
      setHasChanges(false);
    }
  }, [config]);

  // Track changes
  useEffect(() => {
    if (config) {
      const changed = 
        warningDays !== (config.warning_days || 30) ||
        criticalDays !== (config.critical_days || 7) ||
        isActive !== (config.is_active ?? true) ||
        frequency !== (config.notification_frequency || 'daily') ||
        notificationTime !== (config.notification_time || '09:00') ||
        JSON.stringify(channels) !== JSON.stringify(config.notification_channels || ['in_app']);
      
      setHasChanges(changed);
    }
  }, [config, warningDays, criticalDays, isActive, frequency, notificationTime, channels]);

  const handleSave = async () => {
    // Converter valores vazios para números
    const finalWarningDays = warningDays === '' ? 30 : warningDays;
    const finalCriticalDays = criticalDays === '' ? 7 : criticalDays;

    // Validations
    if (finalWarningDays < 1 || finalWarningDays > 365) {
      toast({
        title: 'Valor inválido',
        description: 'Dias de aviso deve estar entre 1 e 365',
        variant: 'destructive'
      });
      return;
    }

    if (finalCriticalDays < 1 || finalCriticalDays > 30) {
      toast({
        title: 'Valor inválido',
        description: 'Dias críticos deve estar entre 1 e 30',
        variant: 'destructive'
      });
      return;
    }

    if (finalCriticalDays >= finalWarningDays) {
      toast({
        title: 'Valor inválido',
        description: 'Dias críticos deve ser menor que dias de aviso',
        variant: 'destructive'
      });
      return;
    }

    if (channels.length === 0) {
      toast({
        title: 'Nenhum canal selecionado',
        description: 'Selecione pelo menos um canal de notificação',
        variant: 'destructive'
      });
      return;
    }

    console.log('[ExpiryAlertSettings] Saving config:', {
      warning_days: finalWarningDays,
      critical_days: finalCriticalDays,
      is_active: isActive,
      notification_frequency: frequency,
      notification_time: notificationTime,
      notification_channels: channels
    });

    try {
      await updateConfig({
        warning_days: finalWarningDays,
        critical_days: finalCriticalDays,
        is_active: isActive,
        notification_frequency: frequency,
        notification_time: notificationTime,
        notification_channels: channels
      });
      
      // Atualizar os estados com os valores finais
      setWarningDays(finalWarningDays);
      setCriticalDays(finalCriticalDays);
      setHasChanges(false);
    } catch (error) {
      console.error('[ExpiryAlertSettings] Save error:', error);
    }
  };

  const handleWarningDaysChange = (value: string) => {
    // Permitir campo vazio para que o usuário possa digitar livremente
    if (value === '') {
      setWarningDays('' as any); // Temporariamente vazio
      return;
    }
    
    const num = parseInt(value);
    if (!isNaN(num)) {
      // Aplicar limites apenas quando há um número válido
      const clamped = Math.max(1, Math.min(365, num));
      setWarningDays(clamped);
    }
  };

  const handleCriticalDaysChange = (value: string) => {
    // Permitir campo vazio para que o usuário possa digitar livremente
    if (value === '') {
      setCriticalDays('' as any); // Temporariamente vazio
      return;
    }
    
    const num = parseInt(value);
    if (!isNaN(num)) {
      // Aplicar limites apenas quando há um número válido
      const clamped = Math.max(1, Math.min(30, num));
      setCriticalDays(clamped);
    }
  };

  const handleChannelToggle = (channel: string) => {
    setChannels(prev => {
      const updated = prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel];
      console.log('[ExpiryAlertSettings] Channels updated:', updated);
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {config && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              Status da Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              <p>✓ Configuração carregada do banco</p>
              <p>ID: {config.id}</p>
              <p>Última atualização: {new Date(config.updated_at || '').toLocaleString('pt-BR')}</p>
              <p className="text-green-600 font-semibold mt-2">
                ✏️ Campos estão editáveis - Clique nos números para alterar
              </p>
              {hasChanges && <Badge variant="outline" className="mt-2">Alterações não salvas</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {!config && !isLoading && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-sm text-yellow-800">
              <strong>⚠️ Nenhuma configuração encontrada.</strong>
              <p className="mt-2">Execute o script SQL para criar sua configuração inicial.</p>
              <p className="text-xs mt-1">Veja: CRIAR_CONFIG_COM_SEU_ID.sql</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Status dos Alertas
              </CardTitle>
              <CardDescription>
                Ative ou desative o sistema de alertas de vencimento
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? 'Ativo' : 'Inativo'}
              </Badge>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Limites de Alerta
          </CardTitle>
          <CardDescription>
            Defina quantos dias antes do vencimento os alertas devem ser gerados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warning-days" className="text-base">
              Alerta de Aviso (dias antes)
              <span className="text-xs text-muted-foreground ml-2">(1-365 dias)</span>
            </Label>
            <div className="relative">
              <Input
                id="warning-days"
                type="number"
                min="1"
                max="365"
                step="1"
                value={warningDays}
                onChange={(e) => handleWarningDaysChange(e.target.value)}
                onFocus={(e) => e.target.select()}
                disabled={isLoading}
                placeholder="30"
                className="text-2xl font-bold h-14 text-center border-2 hover:border-blue-400 focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Produtos vencendo em até <strong>{warningDays} dias</strong> receberão alerta amarelo (prioridade média)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="critical-days" className="text-base">
              Alerta Crítico (dias antes)
              <span className="text-xs text-muted-foreground ml-2">(1-30 dias)</span>
            </Label>
            <div className="relative">
              <Input
                id="critical-days"
                type="number"
                min="1"
                max="30"
                step="1"
                value={criticalDays}
                onChange={(e) => handleCriticalDaysChange(e.target.value)}
                onFocus={(e) => e.target.select()}
                disabled={isLoading}
                placeholder="7"
                className="text-2xl font-bold h-14 text-center border-2 hover:border-red-400 focus:border-red-500 transition-colors"
                autoComplete="off"
              />
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Produtos vencendo em até <strong>{criticalDays} dias</strong> receberão alerta vermelho (prioridade crítica)
              </p>
            </div>
          </div>

          {((typeof criticalDays === 'number' && typeof warningDays === 'number') && criticalDays >= warningDays) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <strong>Atenção:</strong> Os dias críticos devem ser menores que os dias de aviso.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Notificação</CardTitle>
          <CardDescription>
            Escolha como e quando você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequência</Label>
            <Select
              value={frequency}
              onValueChange={(value: 'realtime' | 'daily' | 'weekly') => setFrequency(value)}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Tempo Real</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {frequency === 'realtime' && 'Notificações imediatas quando novos alertas forem gerados'}
              {frequency === 'daily' && 'Resumo diário de todos os alertas ativos'}
              {frequency === 'weekly' && 'Resumo semanal de todos os alertas ativos'}
            </p>
          </div>

          {(frequency === 'daily' || frequency === 'weekly') && (
            <div className="space-y-2">
              <Label htmlFor="notification-time">Horário da Notificação</Label>
              <Input
                id="notification-time"
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-3">
            <Label>Canais de Notificação</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="channel-in-app"
                  checked={channels.includes('in_app')}
                  onCheckedChange={() => handleChannelToggle('in_app')}
                />
                <label
                  htmlFor="channel-in-app"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Notificações no App
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="channel-email"
                  checked={channels.includes('email')}
                  onCheckedChange={() => handleChannelToggle('email')}
                  disabled
                />
                <label
                  htmlFor="channel-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email <span className="text-xs text-muted-foreground">(em breve)</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="channel-push"
                  checked={channels.includes('push')}
                  onCheckedChange={() => handleChannelToggle('push')}
                  disabled
                />
                <label
                  htmlFor="channel-push"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Push Notifications <span className="text-xs text-muted-foreground">(em breve)</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {hasChanges && (
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              Alterações não salvas
            </Badge>
          )}
          {!hasChanges && config && (
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Tudo salvo
            </span>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isUpdating || !hasChanges || (typeof criticalDays === 'number' && typeof warningDays === 'number' && criticalDays >= warningDays)}
          size="lg"
          className="min-w-[200px]"
        >
          <Save className="w-4 h-4 mr-2" />
          {isUpdating ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}

