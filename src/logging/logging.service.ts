import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

@Injectable()
export class LoggingService {
  private readonly logDir = 'logs';
  private currentLogFile: string;
  private currentFileSize = 0;
  private writeStream: fs.WriteStream;
  private readonly maxFileSize: number;
  private readonly logLevel: LogLevel;

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }

    this.maxFileSize = parseInt(process.env.LOG_MAX_SIZE || '1024') * 1024;
    this.logLevel = this.getLogLevelFromEnv();
    this.initializeLogFile();
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = (process.env.LOG_LEVEL || 'info').toUpperCase();
    return LogLevel[level as keyof typeof LogLevel] || LogLevel.INFO;
  }

  private initializeLogFile() {
    this.currentLogFile = path.join(this.logDir, `app-${Date.now()}.log`);
    this.writeStream = fs.createWriteStream(this.currentLogFile, {
      flags: 'a',
    });
    this.currentFileSize = 0;
  }

  private checkRotation() {
    if (this.currentFileSize >= this.maxFileSize) {
      this.writeStream.end();
      this.initializeLogFile();
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };
    return JSON.stringify(logEntry) + '\n';
  }

  private writeLog(level: string, message: string, meta?: any) {
    const formattedMessage = this.formatMessage(level, message, meta);

    console.log(formattedMessage);

    this.writeStream.write(formattedMessage);
    this.currentFileSize += Buffer.byteLength(formattedMessage);
    this.checkRotation();
  }

  debug(message: string, meta?: any) {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.writeLog('DEBUG', message, meta);
    }
  }

  info(message: string, meta?: any) {
    if (this.logLevel <= LogLevel.INFO) {
      this.writeLog('INFO', message, meta);
    }
  }

  warn(message: string, meta?: any) {
    if (this.logLevel <= LogLevel.WARN) {
      this.writeLog('WARN', message, meta);
    }
  }

  error(message: string, meta?: any) {
    if (this.logLevel <= LogLevel.ERROR) {
      this.writeLog('ERROR', message, meta);
    }
  }

  logRequest(request: any, response: any) {
    const logData = {
      url: request.url,
      method: request.method,
      query: request.query,
      body: request.body,
      statusCode: response.statusCode,
    };
    this.info('Incoming request', logData);
  }

  logError(error: Error, request?: any) {
    const logData = {
      error: {
        message: error.message,
        stack: error.stack,
      },
      request: request
        ? {
            url: request.url,
            method: request.method,
            query: request.query,
            body: request.body,
          }
        : undefined,
    };
    this.error('Application error', logData);
  }
}
