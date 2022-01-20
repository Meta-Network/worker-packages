import { URL } from 'url';

import { BackendApiOptions } from '../types';

export class BackendApi {
  constructor(options: BackendApiOptions) {
    const { workerName, secret, backendUrl, taskId } = options;
    this.authorization = `Basic ${Buffer.from(
      `${workerName}:${secret}`,
    ).toString('base64')}`;
    const baseUrl = `${backendUrl}/`.replace(/([^:]\/)\/+/g, '$1');
    // /v1/pipelines/worker-tasks/{worker-task-id}
    this.getUrl = new URL(
      `/v1/pipelines/worker-tasks/${taskId}`,
      baseUrl,
    ).toString();
    // /v1/pipelines/worker-tasks/{worker-task-id}/reports
    this.reportUrl = new URL(
      `/v1/pipelines/worker-tasks/${taskId}/reports`,
      baseUrl,
    ).toString();
  }

  public readonly authorization: string;
  public readonly getUrl: string;
  public readonly reportUrl: string;
}
