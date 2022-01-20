import fs from 'fs';
import os from 'os';
import path from 'path';
import pc from 'picocolors';
import process from 'process';
import superagent from 'superagent';
import winston, { createLogger, transport } from 'winston';
import { CliConfigSetLevels } from 'winston/lib/winston/config';
import LokiTransport from 'winston-loki';

import { BackendApi } from '../service/api';
import { LoggerServiceOptions, RemoveIndex } from '../types';
import { isProd } from '../utils';

export class LoggerService {
  public constructor(private readonly options: LoggerServiceOptions) {
    const { appName, lokiUrl, taskId } = this.options;
    const api = new BackendApi(this.options);
    const dirName = appName.toLowerCase();
    const baseDir = fs.mkdtempSync(`${path.join(os.tmpdir(), dirName)}-`);
    const level = this.mkLevel(process.env.LOG_LEVEL);
    const noColor = 'NO_COLOR' in process.env;

    const reportAppErrorStatus = (err: Error): boolean => {
      // Dirty code!
      try {
        superagent
          .patch(api.reportUrl)
          .send({ taskId, reason: 'ERRORED', timestamp: Date.now(), data: err })
          .set('Authorization', api.authorization)
          .then();
        return true;
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
      if (process.env.DEBUG && process.env.ENABLE_FORMAT_INFO)
        console.log(pc.magenta('errorConsoleFormat:info:'), info);
      const { metadata, label, timestamp, level, message } = info;
      const host = metadata?.host ? `:${metadata.host}` : '';
      const pid = metadata?.runtime?.pid || 'null';
      const ctx = metadata?.context;
      return `${pc.green(
        `[${label}${host}] ${pid} -`,
      )} ${timestamp}     ${level} ${pc.yellow(`[${ctx}]`)} ${message}`;
    });

    const transports: transport[] = [
      new LokiTransport({
        level: 'silly',
        json: true,
        labels: { job: appName },
        format: winston.format.combine(
          winston.format.timestamp({ format: 'isoDateTime' }),
          winston.format.json(),
        ),
        host: lokiUrl,
        handleExceptions: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        handleRejections: true,
        replaceTimestamp: true,
      }),
      new winston.transports.File({
        level,
        filename: `${baseDir}/${level}.log`,
        format: winston.format.combine(winston.format.json()),
      }),
      new winston.transports.File({
        level: 'error',
        filename: `${baseDir}/error.log`,
        format: winston.format.combine(winston.format.json()),
        handleExceptions: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        handleRejections: true,
      }),
      new winston.transports.Console({
        level: 'error',
        format: winston.format.combine(
          winston.format.colorize({ all: !noColor }),
          winston.format.metadata({
            fillExcept: ['label', 'timestamp', 'level', 'message'],
          }),
          errorConsoleFormat,
        ),
        handleExceptions: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        handleRejections: true,
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
          versions: process.versions,
        },
        context: 'main',
      },
      transports,
      exitOnError: reportAppErrorStatus,
    });

    const debugConsoleFormat = winston.format.printf((info) => {
      if (process.env.DEBUG && process.env.ENABLE_FORMAT_INFO)
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
      if (process.env.DEBUG && process.env.ENABLE_FORMAT_INFO)
        console.log(pc.magenta('LoggerService:final:info:'), error);
      if (error instanceof Error) {
        process.exitCode = 1;
        this.logger.error(`The process was exit cause: `, error);
      } else {
        process.exitCode = 0;
        this.logger.info(`The process was exit cause:`, ...error);
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
    if (levelArr.includes(l)) {
      return l as keyof RemoveIndex<CliConfigSetLevels>;
    }
    if (process.env.DEBUG) return 'debug';
    return 'info';
  }
}
