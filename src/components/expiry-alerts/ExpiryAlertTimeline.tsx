import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import type { ExpiryAlert } from '@/services/ExpiryAlertService';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExpiryAlertTimelineProps {
  alerts: ExpiryAlert[];
}

export function ExpiryAlertTimeline({ alerts }: ExpiryAlertTimelineProps) {
  const timelineData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: ptBR });
    const weekEnd = endOfWeek(now, { locale: ptBR });
    
    // Get next 4 weeks
    const fourWeeksOut = new Date(now);
    fourWeeksOut.setDate(fourWeeksOut.getDate() + 28);

    const days = eachDayOfInterval({ start: now, end: fourWeeksOut });

    return days.map(day => {
      const dayAlerts = alerts.filter(alert => 
        isSameDay(new Date(alert.expiry_date), day) && 
        alert.status !== 'dismissed'
      );

      const critical = dayAlerts.filter(a => a.priority === 'critical').length;
      const high = dayAlerts.filter(a => a.priority === 'high').length;
      const medium = dayAlerts.filter(a => a.priority === 'medium').length;

      return {
        date: day,
        alerts: dayAlerts,
        critical,
        high,
        medium,
        total: dayAlerts.length
      };
    }).filter(d => d.total > 0);
  }, [alerts]);

  if (timelineData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum vencimento próximo</p>
          <p className="text-muted-foreground">
            Não há produtos com vencimento nas próximas 4 semanas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {timelineData.map((day, index) => {
        const isToday = isSameDay(day.date, new Date());
        const isPast = day.date < new Date();

        return (
          <Card 
            key={index}
            className={`${
              isToday ? 'border-blue-500 border-2' : ''
            } ${
              isPast ? 'bg-red-50/50' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className={`w-5 h-5 ${isToday ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  <div>
                    <CardTitle className={`text-lg ${isToday ? 'text-blue-600' : ''}`}>
                      {format(day.date, 'EEEE, dd \'de\' MMMM', { locale: ptBR })}
                    </CardTitle>
                    {isToday && (
                      <CardDescription className="text-blue-600 font-medium">
                        Hoje
                      </CardDescription>
                    )}
                    {isPast && !isToday && (
                      <CardDescription className="text-red-600 font-medium">
                        Vencido
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {day.critical > 0 && (
                    <Badge variant="destructive">
                      {day.critical} crítico{day.critical > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {day.high > 0 && (
                    <Badge variant="secondary">
                      {day.high} alto{day.high > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {day.medium > 0 && (
                    <Badge variant="outline">
                      {day.medium} médio{day.medium > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {day.alerts.map((alert, alertIndex) => (
                  <div
                    key={alertIndex}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{alert.item_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.item_category} • {alert.quantity} unidades
                        {alert.location && ` • ${alert.location === 'juazeiro_norte' ? 'Juazeiro' : 'Fortaleza'}`}
                      </p>
                    </div>
                    {alert.estimated_value && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          R$ {alert.estimated_value.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">em risco</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

