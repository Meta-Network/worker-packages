import { MetaWorker } from '@metaio/worker-model';
import superagent, { SuperAgentStatic } from 'superagent';
import { URL } from 'url';
import winston from 'winston';

import { BackendTaskServiceOptions } from '../types';

export class BackendTaskService {
  constructor(
    private readonly logger: winston.Logger,
    options: BackendTaskServiceOptions,
  ) {
    const { backendUrl, secret, taskId, taskMethod } = options;
    this.client = superagent;

    this.authInfo = `Basic ${Buffer.from(secret).toString('base64')}`;
    const baseUrl = `${backendUrl}/`.replace(/([^:]\/)\/+/g, '$1');
    this.apiUrl = new URL(baseUrl).toString();
    this.taskId = taskId;
    this.taskMethod = taskMethod;
  }

  private readonly client: SuperAgentStatic;
  private readonly authInfo: string;
  private readonly apiUrl: string;
  private readonly taskId: string;
  private readonly taskMethod: MetaWorker.Enums.WorkerTaskMethod;

  async getWorkerTaskFromBackend<T = unknown>(): Promise<T> {
    this.logger.info('Getting new task config from backend', {
      context: BackendTaskService.name,
    });

    try {
      const _res = await this.client
        .get(this.apiUrl)
        .set('Authorization', this.authInfo);
      const _data: T = _res?.body?.data;
      if (!_data) throw Error('Can not get task config from backend');
      return _data;
    } catch (error) {
      throw Error(`Get task config from backend failed, ${error}`);
    }
  }

  async reportWorkerTaskStartedToBackend(): Promise<void> {
    this.logger.verbose('Reporting worker task started to backend', {
      context: BackendTaskService.name,
    });

    const data: MetaWorker.Info.TaskReport = {
      taskId: this.taskId,
      taskMethod: this.taskMethod,
      reason: MetaWorker.Enums.TaskReportReason.STARTED,
      timestamp: Date.now(),
    };

    try {
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
    } catch (error) {
      throw Error(`Report worker task started failed, ${error}`);
    }
  }

  async reportWorkerTaskFinishedToBackend(): Promise<void> {
    this.logger.verbose('Reporting worker task finished to backend', {
      context: BackendTaskService.name,
    });

    const data: MetaWorker.Info.TaskReport = {
      taskId: this.taskId,
      taskMethod: this.taskMethod,
      reason: MetaWorker.Enums.TaskReportReason.FINISHED,
      timestamp: Date.now(),
    };

    try {
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
    } catch (error) {
      throw Error(`Report worker task finished failed, ${error}`);
    }
  }

  async reportWorkerTaskErroredToBackend(error: Error): Promise<void> {
    this.logger.verbose('Reporting worker task errored to backend', {
      context: BackendTaskService.name,
    });

    const data: MetaWorker.Info.TaskReport = {
      taskId: this.taskId,
      taskMethod: this.taskMethod,
      reason: MetaWorker.Enums.TaskReportReason.ERRORED,
      timestamp: Date.now(),
      data: error,
    };

    try {
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
    } catch (error) {
      throw Error(`Report worker task errored failed, ${error}`);
    }
  }

  async reportWorkerTaskHealthStatusToBackend(): Promise<void> {
    this.logger.verbose('Reporting worker task health status to backend', {
      context: BackendTaskService.name,
    });

    const data: MetaWorker.Info.TaskReport = {
      taskId: this.taskId,
      taskMethod: this.taskMethod,
      reason: MetaWorker.Enums.TaskReportReason.HEALTH_CHECK,
      timestamp: Date.now(),
    };

    try {
      const _res = await this.client
        .patch(this.apiUrl)
        .send(data)
        .set('Authorization', this.authInfo);
      this.logger.info(
        `Report worker task health status to backend ${_res.statusCode}`,
        { context: BackendTaskService.name },
      );
    } catch (error) {
      throw Error(`Report worker task health status failed, ${error}`);
    }
  }
}
