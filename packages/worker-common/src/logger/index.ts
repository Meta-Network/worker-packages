import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';
import fs from 'fs';
import os from 'os';
import path from 'path';
import pc from 'picocolors';
import process from 'process';
import winston, { createLogger, transport } from 'winston';
import { CliConfigSetLevels } from 'winston/lib/winston/config';
import LokiTransport from 'winston-loki';
import { TransportStreamOptions } from 'winston-transport';

import { BackendClient } from '../service/client';
import { LoggerServiceOptions, RemoveIndex } from '../types';
import { isProd } from '../utils';

export class LoggerService {
  public constructor(private readonly options: LoggerServiceOptions) {
    const { appName, lokiUrl, taskId, metadata } = this.options;
    const dirName = appName.toLowerCase();
    const baseDir = fs.mkdtempSync(`${path.join(os.tmpdir(), dirName)}-`);
    const isDebug = !!process.env.DEBUG;
    const enableConsoleRawOutput = !!process.env.ENABLE_FORMAT_INFO;
    const level = this.mkLevel(process.env.LOG_LEVEL);
    const noColor = 'NO_COLOR' in process.env;

    const reportAppErrorStatus = (err: Error): boolean => {
      try {
        const client = new BackendClient(this.logger, this.options);
        const data = {
          taskId,
          reason: 'ERRORED',
          timestamp: Date.now(),
          data: new MetaInternalResult<Error>({
            statusCode: 500,
            serviceCode: ServiceCode.CMS,
            retryable: false,
            data: err,
            message: err.message,
          }),
        };
        client.sendReport(data, 'errored').catch(this.logger.error).finally();
      } finally {
        return true;
      }
    };

    const defaultWinstonFormat = winston.format.combine(
      winston.format.label({ label: appName }),
      winston.format.timestamp({ format: 'MM/DD/YYYY, hh:mm:ss A' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.ms(),
    );

    const errorConsoleFormat = winston.format.printf((info) => {
      if (isDebug && enableConsoleRawOutput)
        console.log(pc.magenta('errorConsoleFormat:info:'), info);
      const { metadata, label, timestamp, level, message } = info;
      const host = metadata?.host ? `:${metadata.host}` : '';
      const pid = metadata?.runtime?.pid || 'null';
      const ctx = metadata?.context;
      return `${pc.green(
        `[${label}${host}] ${pid} -`,
      )} ${timestamp}     ${level} ${pc.yellow(`[${ctx}]`)} ${message}`;
    });

    const commonOptions: TransportStreamOptions = {
      handleExceptions: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      handleRejections: true,
    };

    const transports: transport[] = [
      new LokiTransport({
        ...commonOptions,
        level: 'silly',
        json: true,
        labels: { job: appName },
        format: winston.format.combine(
          winston.format.timestamp({ format: 'isoDateTime' }),
          winston.format.json(),
        ),
        host: lokiUrl,
        replaceTimestamp: true,
      }),
      new winston.transports.File({
        level,
        filename: `${baseDir}/${level}.log`,
        format: winston.format.combine(winston.format.json()),
      }),
      new winston.transports.File({
        ...commonOptions,
        level: 'error',
        filename: `${baseDir}/error.log`,
        format: winston.format.combine(winston.format.json()),
      }),
      new winston.transports.Console({
        ...commonOptions,
        level: 'error',
        format: winston.format.combine(
          winston.format.colorize({ all: !noColor }),
          winston.format.metadata({
            fillExcept: ['label', 'timestamp', 'level', 'message'],
          }),
          errorConsoleFormat,
        ),
      }),
    ];

    const _logger = createLogger({
      levels: winston.config.npm.levels,
      level,
      format: defaultWinstonFormat,
      defaultMeta: {
        runtime: {
          pid: process.pid,
          platform: process.platform,
          node: process.versions.node,
          v8: process.versions.v8,
        },
        context: 'main',
        taskId,
        ...metadata,
      },
      transports,
      exitOnError: reportAppErrorStatus,
    });

    const debugConsoleFormat = winston.format.printf((info) => {
      if (isDebug && enableConsoleRawOutput)
        console.log(pc.magenta('debugConsoleFormat:info:'), info);
      const { metadata, label, timestamp, level, message } = info;
      const host = metadata?.host ? `:${metadata.host}` : '';
      const pid = metadata?.runtime?.pid || 'null';
      const ctx = metadata?.context;
      const ms = metadata?.ms || '';
      const stack = metadata?.stack;
      return `${pc.green(
        `[${label}${host}] ${pid} -`,
      )} ${timestamp}     ${level} ${pc.yellow(
        `[${ctx}]`,
      )} ${message} ${pc.yellow(`${ms}`)}${stack ? pc.red(`\n${stack}`) : ''}`;
    });

    const debugConsoleTransport: transport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: !noColor }),
        winston.format.metadata({
          fillExcept: ['label', 'timestamp', 'level', 'message'],
        }),
        debugConsoleFormat,
      ),
    });

    if (!isProd()) _logger.add(debugConsoleTransport);

    this.logDir = baseDir;

    this.logger = _logger;

    this.final = (error?: Error | string) => {
      if (isDebug && enableConsoleRawOutput)
        console.log(pc.magenta('LoggerService:final:info:'), error);
      if (error instanceof Error) {
        process.exitCode = 1;
        this.logger.error(`The process was exit cause: ${error}`, error);
      } else {
        process.exitCode = 0;
        this.logger.info(`The process was exit cause: ${error}`);
      }
      this.logger.info(`Log files saved to ${this.logDir}`);
      this.logger.end(() => process.exit());
    };

    this.logger.info(`Log files saved to ${baseDir}`);
  }

  private readonly logDir: string;
  readonly logger: winston.Logger;
  readonly final: (error?: Error | string | null, ...args: any[]) => void;

  private mkLevel(l: string): keyof RemoveIndex<CliConfigSetLevels> {
    // https://github.com/winstonjs/winston#logging-levels
    const levelArr = [
      'error',
      'warn',
      'info',
      'http',
      'verbose',
      'debug',
      'silly',
    ];
    if (process.env.DEBUG) {
      return 'debug';
    } else if (levelArr.includes(l)) {
      return l as keyof RemoveIndex<CliConfigSetLevels>;
    } else {
      return 'info';
    }
  }
}
