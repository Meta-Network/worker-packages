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
  if ((conf as MetaWorker.Configs.DeployTaskConfig).template) return true;
  return false;
};

export const isPublishTask = (
  conf: unknown,
): conf is MetaWorker.Configs.PublishTaskConfig => {
  if ((conf as MetaWorker.Configs.PublishTaskConfig).publish) return true;
  return false;
};

export const isPostTask = (
  conf: unknown,
): conf is MetaWorker.Configs.PostTaskConfig => {
  if ((conf as MetaWorker.Configs.PostTaskConfig).post) return true;
  return false;
};

export const checkAllowedTasks = (
  check: MetaWorker.Enums.TaskMethod,
  alloweds: MetaWorker.Enums.TaskMethod[],
) => {
  if (!alloweds.includes(check)) {
    throw new Error(`Task method ${check} is not allowed or supported.`);
  }
};
