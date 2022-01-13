import { MetaWorker } from '@metaio/worker-model';
// eslint-disable-next-line import/no-unresolved
import test from 'ava';

import { isDeployTask, isPostTask, isPublishTask } from '../../src';

const deployTaskConfig: MetaWorker.Configs.DeployTaskConfig = {
  task: {
    taskId: 'test-task-1',
    taskMethod: MetaWorker.Enums.WorkerTaskMethod.CREATE_POSTS,
  },
  user: {
    username: 'Jhon Doe',
  },
  site: {
    title: 'Example site',
    configId: 1,
  },
  git: {
    storage: {
      token: 'test-token',
      serviceType: MetaWorker.Enums.GitServiceType.GITHUB,
      username: 'ghost',
      reponame: 'ghost',
      branchname: 'main',
    },
  },
};
const publishTaskConfig: MetaWorker.Configs.PublishTaskConfig = {
  task: {
    taskId: 'test-task-1',
    taskMethod: MetaWorker.Enums.WorkerTaskMethod.CREATE_POSTS,
  },
  site: {
    title: 'Example site',
    configId: 1,
  },
  git: {
    publisher: {
      token: 'test-token',
      serviceType: MetaWorker.Enums.GitServiceType.GITHUB,
      username: 'ghost',
      reponame: 'ghost',
      branchname: 'main',
    },
  },
};
const postTaskConfig: MetaWorker.Configs.PostTaskConfig = {
  task: {
    taskId: 'test-task-1',
    taskMethod: MetaWorker.Enums.WorkerTaskMethod.CREATE_POSTS,
  },
  user: {
    username: 'Jhon Doe',
  },
  site: {
    title: 'Example site',
    configId: 1,
  },
  git: {
    storage: {
      token: 'test-token',
      serviceType: MetaWorker.Enums.GitServiceType.GITHUB,
      username: 'ghost',
      reponame: 'ghost',
      branchname: 'main',
    },
  },
  post: {
    title: 'Example title',
    source: 'Example source',
  },
};

test('utils: isDeployTask should be true when give a DeployTaskConfig type object', async (t) => {
  const result = isDeployTask(deployTaskConfig);
  t.is(result, true);
});
test('utils: isPublishTask should be false when give a DeployTaskConfig type object', async (t) => {
  const result = isPublishTask(deployTaskConfig);
  t.is(result, false);
});
test('utils: isPostTask should be false when give a DeployTaskConfig type object', async (t) => {
  const result = isPostTask(deployTaskConfig);
  t.is(result, false);
});

test('utils: isPublishTask should be true when give a PublishTaskConfig type object', async (t) => {
  const result = isPublishTask(publishTaskConfig);
  t.is(result, true);
});
test('utils: isDeployTask should be false when give a PublishTaskConfig type object', async (t) => {
  const result = isDeployTask(publishTaskConfig);
  t.is(result, false);
});
test('utils: isPostTask should be false when give a PublishTaskConfig type object', async (t) => {
  const result = isPostTask(publishTaskConfig);
  t.is(result, false);
});

test('utils: isPostTask should be true when give a PostTaskConfig type object', async (t) => {
  const result = isPostTask(postTaskConfig);
  t.is(result, true);
});
test('utils: isDeployTask should be false when give a PostTaskConfig type object', async (t) => {
  const result = isDeployTask(postTaskConfig);
  t.is(result, false);
});
test('utils: isPublishTask should be false when give a PostTaskConfig type object', async (t) => {
  const result = isPublishTask(postTaskConfig);
  t.is(result, false);
});
