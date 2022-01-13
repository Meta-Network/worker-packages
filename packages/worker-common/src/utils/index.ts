import { MetaWorker } from '@metaio/worker-model';
import process from 'process';

export const removeControlCharacters = (str: string): string => {
  return str
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
};

export const isUndefined = (obj: unknown): obj is undefined =>
  typeof obj === 'undefined';

export const isProd = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDeployTask = (
  conf: unknown,
): conf is MetaWorker.Configs.DeployTaskConfig => {
  if (
    (conf as MetaWorker.Configs.DeployTaskConfig).user &&
    (conf as MetaWorker.Configs.DeployTaskConfig).site &&
    (conf as MetaWorker.Configs.DeployTaskConfig).git &&
    (conf as MetaWorker.Configs.DeployTaskConfig).git.storage
  )
    return true;
  return false;
};

export const isPublishTask = (
  conf: unknown,
): conf is MetaWorker.Configs.PublishTaskConfig => {
  if (
    (conf as MetaWorker.Configs.PublishTaskConfig).site &&
    (conf as MetaWorker.Configs.PublishTaskConfig).git &&
    (conf as MetaWorker.Configs.PublishTaskConfig).git.publisher &&
    !(conf as MetaWorker.Configs.DeployTaskConfig)?.user &&
    !(conf as MetaWorker.Configs.PostTaskConfig)?.post
  )
    return true;
  return false;
};

export const isPostTask = (
  conf: unknown,
): conf is MetaWorker.Configs.PostTaskConfig => {
  if ((conf as MetaWorker.Configs.PostTaskConfig).post) return true;
  return false;
};

export const checkAllowedTasks = (
  check: MetaWorker.Enums.WorkerTaskMethod,
  alloweds: MetaWorker.Enums.WorkerTaskMethod[],
) => {
  if (!alloweds.includes(check)) {
    throw new Error(`Task method ${check} is not allowed or supported.`);
  }
};
