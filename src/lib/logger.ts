/**
 * Centralized Logging System
 * Implements structured logging with levels, context, and error tracking
 * Following SOLID principles and best practices for production systems
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  stackTrace?: string;
  errorMessage?: string;
  errorName?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: string;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(context).length > 0 ? JSON.stringify(context, null, 2) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr ? '\nContext: ' + contextStr : ''}`;
  }

  private createLogEntry(level: LogLevel, message: string, context: LogContext): LogEntry {
    return {
      level,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    return level !== LogLevel.DEBUG;
  }

  public debug(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.addToBuffer(entry);
    
    if (this.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  public info(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.addToBuffer(entry);
    
    console.info(this.formatMessage(LogLevel.INFO, message, context));
  }

  public warn(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.addToBuffer(entry);
    
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  public error(message: string, error?: Error, context: LogContext = {}): void {
    const enhancedContext: LogContext = {
      ...context,
      stackTrace: error?.stack,
      errorMessage: error?.message,
      errorName: error?.name,
    };
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, enhancedContext);
    this.addToBuffer(entry);
    
    console.error(this.formatMessage(LogLevel.ERROR, message, enhancedContext));
    
    // In production, send to error tracking service
    if (!this.isDevelopment) {
      this.sendToErrorTracking(entry);
    }
  }

  private sendToErrorTracking(entry: LogEntry): void {
    // TODO: Integrate with error tracking service (Sentry, Rollbar, etc.)
    // For now, just store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errors.push(entry);
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift();
      }
      localStorage.setItem('error_logs', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  }

  public getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  public clearLogs(): void {
    this.logBuffer = [];
  }

  public exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);
export const logError = (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context);
