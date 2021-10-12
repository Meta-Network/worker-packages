import { MetaWorker } from '@metaio/worker-model';
import superagent, { SuperAgentStatic } from 'superagent';
import winston from 'winston';

import { BackendTaskServiceOptions } from '../types';

export class BackendTaskService {
  constructor(
    private readonly logger: winston.Logger,
    options: BackendTaskServiceOptions,
  ) {
    const { hostName, backendUrl, secret } = options;
    this.client = superagent;

    this.authInfo = `Basic ${Buffer.from(secret).toString('base64')}`;
    this.apiUrl = `${backendUrl}/${hostName}`;
  }

  private readonly client: SuperAgentStatic;
  private readonly authInfo: string;
  private readonly apiUrl: string;

  async getWorkerTaskFromBackend<T = unknown>(): Promise<T> {
    this.logger.info('Getting new Git task from backend', {
      context: BackendTaskService.name,
    });

    const _res = await this.client
      .get(this.apiUrl)
      .set('Authorization', this.authInfo);

    const _data: T = _res?.body?.data;
    if (!_data) throw Error('Can not get task config from backend');
    return _data;
  }

  async reportWorkerTaskStartedToBackend(): Promise<void> {
    this.logger.verbose('Reporting worker task started to backend', {
      context: BackendTaskService.name,
    });

    const data: MetaWorker.Info.TaskReport = {
      reason: MetaWorker.Enums.TaskReportReason.STARTED,
      timestamp: Date.now(),
    };

    const _res = await this.client
      .patch(this.apiUrl)
      .send(data)
      .set('Authorization', this.authInfo);

    this.logger.info(
      `Report worker task started to backend ${_res.statusCode}`,
      {
        context: BackendTaskService.name,
      },
    );
  }

  async reportWorkerTaskFinishedToBackend(): Promise<void> {
    this.logger.verbose('Reporting worker task finished to backend', {
      context: BackendTaskService.name,
    });

    const data: MetaWorker.Info.TaskReport = {
      reason: MetaWorker.Enums.TaskReportReason.FINISHED,
      timestamp: Date.now(),
    };

    const _res = await this.client
      .patch(this.apiUrl)
      .send(data)
      .set('Authorization', this.authInfo);

    this.logger.info(
      `Report worker task finished to backend ${_res.statusCode}`,
      {
        context: BackendTaskService.name,
      },
    );
  }

  async reportWorkerTaskErroredToBackend(error: Error): Promise<void> {
    this.logger.verbose('Reporting worker task errored to backend', {
      context: BackendTaskService.name,
    });

    const data: MetaWorker.Info.TaskReport = {
      reason: MetaWorker.Enums.TaskReportReason.ERRORED,
      timestamp: Date.now(),
      data: error,
    };

    const _res = await this.client
      .patch(this.apiUrl)
      .send(data)
      .set('Authorization', this.authInfo);

    this.logger.info(
      `Report worker task errored to backend ${_res.statusCode}`,
      {
        context: BackendTaskService.name,
      },
    );
  }

  async reportWorkerTaskHealthStatusToBackend(): Promise<void> {
    this.logger.verbose('Reporting worker task health status to backend', {
      context: BackendTaskService.name,
    });

    const data: MetaWorker.Info.TaskReport = {
      reason: MetaWorker.Enums.TaskReportReason.HEALTH_CHECK,
      timestamp: Date.now(),
    };

    const _res = await this.client
      .patch(this.apiUrl)
      .send(data)
      .set('Authorization', this.authInfo);

    this.logger.info(
      `Report worker task health status to backend ${_res.statusCode}`,
      { context: BackendTaskService.name },
    );
  }
}
