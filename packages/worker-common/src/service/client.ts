import superagent, {
  Plugin,
  Response,
  SuperAgentRequest,
  SuperAgentStatic,
} from 'superagent';
import winston from 'winston';

import { BackendApiOptions } from '../types';
import { BackendApi } from './api';

export class BackendClient {
  constructor(
    private readonly logger: winston.Logger,
    options: BackendApiOptions,
  ) {
    this.client = superagent;
    this.api = new BackendApi(options);
  }

  private readonly client: SuperAgentStatic;
  private readonly api: BackendApi;
  private readonly ctx = { context: BackendClient.name };

  private debugRequestLogPlugin(data: unknown): Plugin {
    return (req: SuperAgentRequest): void => {
      if (!!process.env.DEBUG) {
        this.logger.debug(
          `Request ${req.method.toUpperCase()} to ${
            req.url
          } send ${JSON.stringify(data)}`,
          this.ctx,
        );
      }
    };
  }

  public async getTask(): Promise<Response> {
    const res = await this.client
      .get(this.api.getUrl)
      .set('Authorization', this.api.authorization);
    return res;
  }

  public async sendReport(data: object, reason: string): Promise<Response> {
    try {
      const res = await this.client
        .post(this.api.reportUrl)
        .use(this.debugRequestLogPlugin(data))
        .send(data)
        .set('Authorization', this.api.authorization);
      this.logger.info(
        `Report worker task ${reason} to backend ${res.statusCode}`,
        this.ctx,
      );
      return res;
    } catch (error) {
      throw Error(`Report worker task ${reason} failed, ${error.message}`);
    }
  }
}
