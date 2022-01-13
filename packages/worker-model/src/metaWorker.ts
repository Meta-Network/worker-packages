// eslint-disable-next-line import/no-unresolved
import { SetOptional } from 'type-fest';

/* eslint-disable @typescript-eslint/no-namespace */
export namespace MetaWorker {
  export namespace Enums {
    export enum TemplateType {
      HEXO = 'HEXO',
    }

    enum GitServiceEnum {
      GITHUB = 'GITHUB',
      GITEE = 'GITEE',
    }
    export type GitServiceType = GitServiceEnum;
    export const GitServiceType = GitServiceEnum;

    enum DataProcessEnum {}
    export type DataProcessType = TemplateType | DataProcessEnum;
    export const DataProcessType = { ...TemplateType, ...DataProcessEnum };

    enum StorageEnum {}
    export type StorageType = GitServiceEnum | StorageEnum;
    export const StorageType = { ...GitServiceEnum, ...StorageEnum };

    enum CICDEnum {
      GITLAB = 'GITLAB',
      JENKINS = 'JENKINS',
      AZDO = 'AZDO', // Azure DevOps
      CIRCLE = 'CIRCLE',
    }
    export type CICDType = GitServiceEnum | CICDEnum;
    export const CICDType = { ...GitServiceEnum, ...CICDEnum };

    enum PublisherEnum {
      GITLAB = 'GITLAB',
      CLOUDFLARE = 'CLOUDFLARE',
      VERCEL = 'VERCEL',
    }
    export type PublisherType = GitServiceEnum | PublisherEnum;
    export const PublisherType = { ...GitServiceEnum, ...PublisherEnum };

    enum CDNEnum {
      CLOUDFLARE = 'CLOUDFLARE',
    }
    export type CDNType = CDNEnum;
    export const CDNType = { ...CDNEnum };

    enum DNSEnum {
      CLOUDFLARE = 'CLOUDFLARE',
    }
    export type DnsProviderType = DNSEnum;
    export const DnsProviderType = { ...DNSEnum };

    export enum DnsRecordType {
      A = 'A',
      CNAME = 'CNAME',
    }

    export enum WorkerTaskMethod {
      DEPLOY_SITE = 'DEPLOY_SITE',
      PUBLISH_SITE = 'PUBLISH_SITE',
      CREATE_POSTS = 'CREATE_POSTS',
      UPDATE_POSTS = 'UPDATE_POSTS',
      DELETE_POSTS = 'DELETE_POSTS',
    }

    export enum TaskReportReason {
      STARTED = 'STARTED',
      FINISHED = 'FINISHED',
      ERRORED = 'ERRORED',
      HEALTH_CHECK = 'HEALTH_CHECK',
    }
  }

  export namespace Info {
    export type UCenterUser = {
      username: string;
      nickname?: string;
    };

    export type CmsSiteInfo = {
      title: string;
      subtitle?: string;
      description?: string;
      author?: string;
      avatar?: string;
      keywords?: string[] | null;
      favicon?: string | null;
    };

    export type CmsSiteConfig = {
      configId: number;
      language?: string;
      timezone?: string;
      domain?: string;
      metaSpacePrefix?: string;
    };

    export type Template = {
      templateName: string;
      templateRepo: string;
      templateBranch: string;
      templateType?: Enums.TemplateType;
    };

    export type Theme = {
      themeName: string;
      themeRepo: string;
      themeBranch: string;
      themeType?: Enums.TemplateType;
      isPackage?: boolean;
    };

    export type Git = {
      token: string;
      serviceType: Enums.GitServiceType;
      username: string;
      reponame: string;
      branchname: string;
      lastCommitHash?: string | null;
    };

    export type Post = {
      [key: string]: string | number | Array<string | number>;
      title: string;
      source: string;
      cover?: string;
      summary?: string;
      categories?: string[];
      tags?: string[];
      createdAt?: string;
      updatedAt?: string;
    };

    export type DnsRecord = {
      type: Enums.DnsRecordType;
      name: string;
      content: string;
    };

    export type Dns = {
      providerType: Enums.DnsProviderType;
      env: Record<string, any>;
      record: DnsRecord;
    };

    export type Publish = {
      publishDir: string;
      publishBranch: string;
    };

    export type Gateway = {
      [service: string]: {
        baseUrl: string;
      };
    };

    export type Metadata = {
      [key: string]:
        | string
        | string[]
        | {
            storageType: string;
            refer: string;
          };
    };

    export type Task = {
      taskId: string;
      taskMethod: Enums.WorkerTaskMethod;
      createAt?: number;
      startAt?: number;
      updateAt?: number;
      finishAt?: number;
      errorAt?: number;
    };

    export type TaskReport = {
      taskId: string;
      taskMethod: Enums.WorkerTaskMethod;
      reason: Enums.TaskReportReason;
      timestamp: number;
      data?: unknown;
    };
  }

  export namespace Configs {
    type BaseTaskConfig = {
      task: Info.Task;
    };

    type GitConfig = {
      storage: Info.Git;
      publisher: Info.Git;
    };

    /**
     * All about deploy needed configs
     */
    export type DeployConfig = {
      user: Info.UCenterUser;
      site: Info.CmsSiteInfo & Info.CmsSiteConfig;
      git: SetOptional<GitConfig, 'publisher'>;
      template?: Info.Template;
      theme?: Info.Theme;
      gateway?: Info.Gateway;
      metadata?: Info.Metadata;
    };
    export type DeployTaskConfig = BaseTaskConfig & DeployConfig;

    /**
     * All about publish needed configs
     */
    export type PublishConfig = {
      site: Info.CmsSiteInfo & Info.CmsSiteConfig;
      git: SetOptional<GitConfig, 'storage'>;
      metadata?: Info.Metadata;
      publish?: Info.Publish;
    };
    export type PublishTaskConfig = BaseTaskConfig & PublishConfig;

    /**
     * All about post needed configs
     */
    export type PostConfig = {
      user: Info.UCenterUser;
      site: Info.CmsSiteInfo & Info.CmsSiteConfig;
      git: SetOptional<GitConfig, 'publisher'>;
      post: Info.Post | Array<Info.Post>;
    };
    export type PostTaskConfig = BaseTaskConfig & PostConfig;

    /**
     * All about dns configs
     */
    export type DnsConfig = {
      site: Info.CmsSiteInfo & Info.CmsSiteConfig;
      dns: Info.Dns;
    };
    export type DnsTaskConfig = BaseTaskConfig & DnsConfig;

    export type MetaSpaceConfig = Pick<DeployConfig, 'user' | 'site'> &
      Partial<Omit<DeployConfig, 'user' | 'site' | 'template' | 'git'>>;
  }
}
