export type RemoveIndex<Q> = {
  [key in keyof Q as string extends key
    ? never
    : key extends string
    ? key
    : never]: Q[key];
};

type CommonServiceOptions = {
  workerName: string;
  secret: string;
  backendUrl: string;
  taskId: string;
};

export type LoggerServiceOptions = CommonServiceOptions & {
  appName: string;
  lokiUrl: string;
};

export type BackendApiOptions = CommonServiceOptions;

export type ConfigGetOptions = {
  /**
   * If present, "get" method will try to automatically
   * infer a type of property based on the type argument
   * specified at the "ConfigService" class-level (example: ConfigService<Configuration>).
   */
  infer: true;
};

export type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> &
            string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;
export type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;
export type Path<T> = PathImpl2<T> extends string | keyof T
  ? PathImpl2<T>
  : keyof T;
export type PathValue<
  T,
  P extends Path<T>,
> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

export type ConfigType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer ReturnVal
  ? ReturnVal extends Promise<infer AsyncReturnVal>
    ? AsyncReturnVal
    : ReturnVal
  : any;

export type NoInferType<T> = [T][T extends any ? 0 : never];
