import { MetaWorker } from '@metaio/worker-model';
import winston from 'winston';

import { BackendApiOptions } from '../types';
import { BackendClient } from './client';

export class BackendTaskService {
  constructor(
    private readonly logger: winston.Logger,
    options: BackendApiOptions,
  ) {
    this.client = new BackendClient(this.logger, options);
    this.taskId = options.taskId;
  }

  private readonly client: BackendClient;
  private readonly taskId: string;
  private readonly ctx = { context: BackendTaskService.name };

  async getWorkerTaskFromBackend<T = unknown>(): Promise<T> {
    this.logger.info('Getting new task config from backend', this.ctx);
    try {
      const _res = await this.client.getTask();
      const _data: T = _res?.body?.data;
      if (!_data) throw Error('Can not get task config from backend');
      return _data;
    } catch (error) {
      throw Error(`Get task config from backend failed, ${error}`);
    }
  }

  async reportWorkerTaskStartedToBackend(): Promise<void> {
    this.logger.verbose('Reporting worker task started to backend', this.ctx);
    const data: MetaWorker.Info.TaskReport = {
      taskId: this.taskId,
      reason: MetaWorker.Enums.TaskReportReason.STARTED,
      timestamp: Date.now(),
    };
    await this.client.sendReport(data, 'started');
  }

  async reportWorkerTaskFinishedToBackend(): Promise<void> {
    this.logger.verbose('Reporting worker task finished to backend', this.ctx);
    const data: MetaWorker.Info.TaskReport = {
      taskId: this.taskId,
      reason: MetaWorker.Enums.TaskReportReason.FINISHED,
      timestamp: Date.now(),
    };
    await this.client.sendReport(data, 'finished');
  }

  async reportWorkerTaskErroredToBackend(data: unknown): Promise<void> {
    this.logger.verbose('Reporting worker task errored to backend', this.ctx);
    const reportData: MetaWorker.Info.TaskReport = {
      taskId: this.taskId,
      reason: MetaWorker.Enums.TaskReportReason.ERRORED,
      timestamp: Date.now(),
      data,
    };
    await this.client.sendReport(reportData, 'errored');
  }

  async reportWorkerTaskHealthStatusToBackend(): Promise<void> {
    this.logger.verbose(
      'Reporting worker task health status to backend',
      this.ctx,
    );
    const data: MetaWorker.Info.TaskReport = {
      taskId: this.taskId,
      reason: MetaWorker.Enums.TaskReportReason.HEALTH_CHECK,
      timestamp: Date.now(),
    };
    await this.client.sendReport(data, 'health status');
  }
}
