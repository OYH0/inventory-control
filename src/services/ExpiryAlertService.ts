/**
 * ExpiryAlertService
 * Handles all business logic for expiry alerts including generation,
 * notification dispatch, and alert management
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AlertType = 'near_expiry' | 'expired' | 'critical';
type AlertStatus = 'pending' | 'sent' | 'read' | 'dismissed';
type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
type NotificationMethod = 'email' | 'sms' | 'push' | 'in_app';

export interface ExpiryAlert {
  id: string;
  item_table: string;
  item_id: string;
  item_name: string;
  item_category?: string;
  batch_number?: string;
  expiry_date: string;
  alert_type: AlertType;
  days_until_expiry: number;
  quantity: number;
  estimated_value?: number;
  notification_method: NotificationMethod;
  recipient_user_id?: string;
  status: AlertStatus;
  priority: AlertPriority;
  location?: 'juazeiro_norte' | 'fortaleza';
  metadata?: Record<string, any>;
  alert_sent_at?: string;
  read_at?: string;
  dismissed_at?: string;
  dismissed_by?: string;
  dismissal_reason?: string;
  action_taken?: string;
  created_at: string;
  updated_at: string;
}

export interface AlertConfiguration {
  id?: string;
  user_id: string;
  warning_days: number;
  critical_days: number;
  notification_channels: NotificationMethod[];
  notification_frequency: 'realtime' | 'daily' | 'weekly';
  notification_time: string;
  is_active: boolean;
  alert_for_all_locations?: boolean;
  specific_locations?: Array<'juazeiro_norte' | 'fortaleza'>;
  alert_categories?: string[];
  min_value_threshold?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AlertStats {
  total_active_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  expired_items: number;
  total_value_at_risk: number;
  critical_value_at_risk: number;
  pending_notifications: number;
  alerts_today: number;
}

export interface GenerateAlertsResult {
  alerts_generated: number;
  critical_count: number;
  expired_count: number;
}

class ExpiryAlertService {
  private static instance: ExpiryAlertService;
  private batchSize = 1000;

  private constructor() {}

  public static getInstance(): ExpiryAlertService {
    if (!ExpiryAlertService.instance) {
      ExpiryAlertService.instance = new ExpiryAlertService();
    }
    return ExpiryAlertService.instance;
  }

  /**
   * Main method to check and generate expiry alerts
   * Calls the Postgres function that handles the bulk logic
   */
  async checkExpiringProducts(): Promise<GenerateAlertsResult> {
    try {
      console.log('[ExpiryAlertService] Starting expiry check...');
      
      const { data, error } = await supabase
        .rpc('generate_expiry_alerts');

      if (error) {
        console.error('[ExpiryAlertService] Error generating alerts:', error);
        throw error;
      }

      const result = data?.[0] || { 
        alerts_generated: 0, 
        critical_count: 0, 
        expired_count: 0 
      };

      console.log('[ExpiryAlertService] Alert generation complete:', result);

      // Trigger notifications for newly created alerts
      if (result.alerts_generated > 0) {
        await this.sendPendingNotifications();
      }

      return result;
    } catch (error) {
      console.error('[ExpiryAlertService] Fatal error in checkExpiringProducts:', error);
      throw error;
    }
  }

  /**
   * Fetch alerts with filtering and pagination
   */
  async getAlerts(params: {
    status?: AlertStatus | AlertStatus[];
    priority?: AlertPriority | AlertPriority[];
    date_from?: string;
    date_to?: string;
    location?: 'juazeiro_norte' | 'fortaleza';
    page?: number;
    per_page?: number;
    user_id?: string;
  }): Promise<{ data: ExpiryAlert[]; total: number }> {
    try {
      const page = params.page || 1;
      const per_page = Math.min(params.per_page || 50, 100); // Max 100 per page
      const offset = (page - 1) * per_page;

      let query = supabase
        .from('expiry_alerts')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.status) {
        if (Array.isArray(params.status)) {
          query = query.in('status', params.status);
        } else {
          query = query.eq('status', params.status);
        }
      }

      if (params.priority) {
        if (Array.isArray(params.priority)) {
          query = query.in('priority', params.priority);
        } else {
          query = query.eq('priority', params.priority);
        }
      }

      if (params.date_from) {
        query = query.gte('expiry_date', params.date_from);
      }

      if (params.date_to) {
        query = query.lte('expiry_date', params.date_to);
      }

      if (params.location) {
        query = query.eq('location', params.location);
      }

      if (params.user_id) {
        query = query.eq('recipient_user_id', params.user_id);
      }

      // Apply pagination
      query = query
        .order('priority', { ascending: false })
        .order('expiry_date', { ascending: true })
        .range(offset, offset + per_page - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: (data || []) as ExpiryAlert[],
        total: count || 0
      };
    } catch (error) {
      console.error('[ExpiryAlertService] Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Get single alert by ID with full details
   */
  async getAlertById(id: string): Promise<ExpiryAlert | null> {
    try {
      const { data, error } = await supabase
        .from('expiry_alerts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as ExpiryAlert;
    } catch (error) {
      console.error('[ExpiryAlertService] Error fetching alert:', error);
      throw error;
    }
  }

  /**
   * Mark alert as read
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('expiry_alerts')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('recipient_user_id', userId);

      if (error) throw error;

      console.log(`[ExpiryAlertService] Alert ${id} marked as read`);
    } catch (error) {
      console.error('[ExpiryAlertService] Error marking alert as read:', error);
      throw error;
    }
  }

  /**
   * Dismiss an alert with reason
   */
  async dismissAlert(
    id: string, 
    userId: string, 
    reason?: string, 
    action_taken?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('expiry_alerts')
        .update({
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
          dismissed_by: userId,
          dismissal_reason: reason,
          action_taken
        })
        .eq('id', id)
        .eq('recipient_user_id', userId);

      if (error) throw error;

      console.log(`[ExpiryAlertService] Alert ${id} dismissed by user ${userId}`);
    } catch (error) {
      console.error('[ExpiryAlertService] Error dismissing alert:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<AlertStats> {
    try {
      const { data, error } = await supabase
        .from('expiry_alerts_dashboard')
        .select('*')
        .single();

      if (error) throw error;

      return {
        total_active_alerts: data?.total_active_alerts || 0,
        critical_alerts: data?.critical_alerts || 0,
        high_alerts: data?.high_alerts || 0,
        expired_items: data?.expired_items || 0,
        total_value_at_risk: parseFloat(String(data?.total_value_at_risk || '0')),
        critical_value_at_risk: parseFloat(String(data?.critical_value_at_risk || '0')),
        pending_notifications: data?.pending_notifications || 0,
        alerts_today: data?.alerts_today || 0
      };
    } catch (error) {
      console.error('[ExpiryAlertService] Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get or create alert configuration for user
   */
  async getAlertConfiguration(userId: string): Promise<AlertConfiguration | null> {
    try {
      const { data, error } = await supabase
        .from('alert_configurations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        throw error;
      }

      if (!data) {
        // Create default configuration
        return await this.createDefaultConfiguration(userId);
      }

      return {
        ...data,
        notification_channels: data.notification_channels as NotificationMethod[]
      } as AlertConfiguration;
    } catch (error) {
      console.error('[ExpiryAlertService] Error fetching configuration:', error);
      throw error;
    }
  }

  /**
   * Update alert configuration
   */
  async updateAlertConfiguration(
    userId: string, 
    config: Partial<AlertConfiguration>
  ): Promise<AlertConfiguration> {
    try {
      console.log(`[ExpiryAlertService] Updating configuration for user ${userId}`, config);
      
      // First, check if config exists
      const { data: existing } = await supabase
        .from('alert_configurations')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let result;
      
      if (existing) {
        // Update existing config
        console.log(`[ExpiryAlertService] Updating existing config ID: ${existing.id}`);
        result = await supabase
          .from('alert_configurations')
          .update({
            ...config,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Insert new config
        console.log(`[ExpiryAlertService] Creating new config for user ${userId}`);
        result = await supabase
          .from('alert_configurations')
          .insert({
            user_id: userId,
            ...config,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error('[ExpiryAlertService] Database error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      console.log(`[ExpiryAlertService] Configuration saved successfully:`, data);

      return {
        ...data,
        notification_channels: data.notification_channels as NotificationMethod[]
      } as AlertConfiguration;
    } catch (error: any) {
      console.error('[ExpiryAlertService] Error updating configuration:', error);
      console.error('[ExpiryAlertService] Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      throw error;
    }
  }

  /**
   * Send pending notifications (called after alert generation)
   */
  private async sendPendingNotifications(): Promise<void> {
    try {
      const { data: pendingAlerts, error } = await supabase
        .from('expiry_alerts')
        .select('*')
        .eq('status', 'pending')
        .limit(100);

      if (error) throw error;

      if (!pendingAlerts || pendingAlerts.length === 0) {
        console.log('[ExpiryAlertService] No pending notifications to send');
        return;
      }

      console.log(`[ExpiryAlertService] Sending ${pendingAlerts.length} notifications`);

      // Group by user for batched notifications
      const alertsByUser = this.groupAlertsByUser(pendingAlerts);

      for (const [userId, alerts] of Object.entries(alertsByUser)) {
        await this.sendUserNotifications(userId, alerts as ExpiryAlert[]);
      }
    } catch (error) {
      console.error('[ExpiryAlertService] Error sending notifications:', error);
      throw error;
    }
  }

  /**
   * Send notifications to specific user
   */
  private async sendUserNotifications(
    userId: string, 
    alerts: ExpiryAlert[]
  ): Promise<void> {
    try {
      // Get user's notification preferences
      const config = await this.getAlertConfiguration(userId);
      
      if (!config || !config.is_active) {
        console.log(`[ExpiryAlertService] Notifications disabled for user ${userId}`);
        return;
      }

      // For now, mark as sent (in-app notifications will be displayed via UI)
      // In production, integrate with email/push notification services
      const alertIds = alerts.map(a => a.id);
      
      const { error } = await supabase
        .from('expiry_alerts')
        .update({
          status: 'sent',
          alert_sent_at: new Date().toISOString()
        })
        .in('id', alertIds);

      if (error) throw error;

      console.log(`[ExpiryAlertService] ${alerts.length} notifications marked as sent for user ${userId}`);

      // TODO: Integrate with actual notification services
      // - Email via SendGrid/AWS SES
      // - Push via FCM/OneSignal
      // - SMS via Twilio
    } catch (error) {
      console.error('[ExpiryAlertService] Error sending user notifications:', error);
    }
  }

  /**
   * Cleanup old dismissed alerts
   */
  async cleanupOldAlerts(daysToKeep: number = 90): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_old_alerts', { days_to_keep: daysToKeep });

      if (error) throw error;

      console.log(`[ExpiryAlertService] Cleaned up ${data} old alerts`);

      return data as number;
    } catch (error) {
      console.error('[ExpiryAlertService] Error cleaning up alerts:', error);
      throw error;
    }
  }

  /**
   * Generate daily report
   */
  async generateDailyReport(): Promise<{
    summary: AlertStats;
    critical_items: ExpiryAlert[];
    expiring_this_week: ExpiryAlert[];
    value_at_risk_by_category: Record<string, number>;
  }> {
    try {
      const summary = await this.getDashboardStats();

      const { data: criticalItems } = await this.getAlerts({
        priority: 'critical',
        status: ['pending', 'sent'],
        per_page: 100
      });

      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

      const { data: expiringThisWeek } = await this.getAlerts({
        date_to: oneWeekFromNow.toISOString().split('T')[0],
        status: ['pending', 'sent'],
        per_page: 100
      });

      // Calculate value at risk by category
      const valueByCategory: Record<string, number> = {};
      
      expiringThisWeek.forEach(alert => {
        const category = alert.item_category || 'Uncategorized';
        valueByCategory[category] = (valueByCategory[category] || 0) + (alert.estimated_value || 0);
      });

      return {
        summary,
        critical_items: criticalItems,
        expiring_this_week: expiringThisWeek,
        value_at_risk_by_category: valueByCategory
      };
    } catch (error) {
      console.error('[ExpiryAlertService] Error generating daily report:', error);
      throw error;
    }
  }

  /**
   * Helper: Create default configuration for new user
   */
  private async createDefaultConfiguration(userId: string): Promise<AlertConfiguration> {
    const defaultConfig: AlertConfiguration = {
      user_id: userId,
      warning_days: 30,
      critical_days: 7,
      notification_channels: ['in_app'],
      notification_frequency: 'daily',
      notification_time: '09:00:00',
      is_active: true
    };

    const { data, error } = await supabase
      .from('alert_configurations')
      .insert(defaultConfig)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      notification_channels: data.notification_channels as NotificationMethod[]
    } as AlertConfiguration;
  }

  /**
   * Helper: Group alerts by user
   */
  private groupAlertsByUser(alerts: any[]): Record<string, ExpiryAlert[]> {
    return alerts.reduce((acc, alert) => {
      const userId = alert.recipient_user_id;
      if (!userId) return acc;
      
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(alert);
      return acc;
    }, {} as Record<string, ExpiryAlert[]>);
  }
}

export const expiryAlertService = ExpiryAlertService.getInstance();

