import { MetaWorker } from '@metaio/worker-model';
import superagent, { SuperAgentStatic } from 'superagent';
import winston from 'winston';

import { BackendApiOptions } from '../types';
import { BackendApi } from './api';

export class BackendTaskService {
  constructor(
    private readonly logger: winston.Logger,
    options: BackendApiOptions,
  ) {
    const { taskId } = options;
    this.client = superagent;
    this.api = new BackendApi(options);
    this.taskId = taskId;
  }

  private readonly client: SuperAgentStatic;
  private readonly api: BackendApi;
  private readonly taskId: string;

  async getWorkerTaskFromBackend<T = unknown>(): Promise<T> {
    this.logger.info('Getting new task config from backend', {
      context: BackendTaskService.name,
    });

    try {
      const _res = await this.client
        .get(this.api.getUrl)
        .set('Authorization', this.api.authorization);
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
      reason: MetaWorker.Enums.TaskReportReason.STARTED,
      timestamp: Date.now(),
    };

    try {
      const _res = await this.client
        .patch(this.api.reportUrl)
        .send(data)
        .set('Authorization', this.api.authorization);
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
      reason: MetaWorker.Enums.TaskReportReason.FINISHED,
      timestamp: Date.now(),
    };

    try {
      const _res = await this.client
        .patch(this.api.reportUrl)
        .send(data)
        .set('Authorization', this.api.authorization);
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

  async reportWorkerTaskErroredToBackend(data: unknown): Promise<void> {
    this.logger.verbose('Reporting worker task errored to backend', {
      context: BackendTaskService.name,
    });

    const reportData: MetaWorker.Info.TaskReport = {
      taskId: this.taskId,
      reason: MetaWorker.Enums.TaskReportReason.ERRORED,
      timestamp: Date.now(),
      data,
    };

    try {
      const _res = await this.client
        .patch(this.api.reportUrl)
        .send(reportData)
        .set('Authorization', this.api.authorization);
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
      reason: MetaWorker.Enums.TaskReportReason.HEALTH_CHECK,
      timestamp: Date.now(),
    };

    try {
      const _res = await this.client
        .patch(this.api.reportUrl)
        .send(data)
        .set('Authorization', this.api.authorization);
      this.logger.info(
        `Report worker task health status to backend ${_res.statusCode}`,
        { context: BackendTaskService.name },
      );
    } catch (error) {
      throw Error(`Report worker task health status failed, ${error}`);
    }
  }
}
