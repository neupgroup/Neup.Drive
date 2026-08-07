
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model FileFolder
 * 
 */
export type FileFolder = $Result.DefaultSelection<Prisma.$FileFolderPayload>
/**
 * Model FileFolderLog
 * 
 */
export type FileFolderLog = $Result.DefaultSelection<Prisma.$FileFolderLogPayload>
/**
 * Model ErrorLog
 * 
 */
export type ErrorLog = $Result.DefaultSelection<Prisma.$ErrorLogPayload>
/**
 * Model SystemError
 * 
 */
export type SystemError = $Result.DefaultSelection<Prisma.$SystemErrorPayload>
/**
 * Model WebDisk
 * 
 */
export type WebDisk = $Result.DefaultSelection<Prisma.$WebDiskPayload>
/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more FileFolders
 * const fileFolders = await prisma.fileFolder.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more FileFolders
   * const fileFolders = await prisma.fileFolder.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.fileFolder`: Exposes CRUD operations for the **FileFolder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FileFolders
    * const fileFolders = await prisma.fileFolder.findMany()
    * ```
    */
  get fileFolder(): Prisma.FileFolderDelegate<ExtArgs>;

  /**
   * `prisma.fileFolderLog`: Exposes CRUD operations for the **FileFolderLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FileFolderLogs
    * const fileFolderLogs = await prisma.fileFolderLog.findMany()
    * ```
    */
  get fileFolderLog(): Prisma.FileFolderLogDelegate<ExtArgs>;

  /**
   * `prisma.errorLog`: Exposes CRUD operations for the **ErrorLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ErrorLogs
    * const errorLogs = await prisma.errorLog.findMany()
    * ```
    */
  get errorLog(): Prisma.ErrorLogDelegate<ExtArgs>;

  /**
   * `prisma.systemError`: Exposes CRUD operations for the **SystemError** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemErrors
    * const systemErrors = await prisma.systemError.findMany()
    * ```
    */
  get systemError(): Prisma.SystemErrorDelegate<ExtArgs>;

  /**
   * `prisma.webDisk`: Exposes CRUD operations for the **WebDisk** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WebDisks
    * const webDisks = await prisma.webDisk.findMany()
    * ```
    */
  get webDisk(): Prisma.WebDiskDelegate<ExtArgs>;

  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    FileFolder: 'FileFolder',
    FileFolderLog: 'FileFolderLog',
    ErrorLog: 'ErrorLog',
    SystemError: 'SystemError',
    WebDisk: 'WebDisk',
    Account: 'Account'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "fileFolder" | "fileFolderLog" | "errorLog" | "systemError" | "webDisk" | "account"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      FileFolder: {
        payload: Prisma.$FileFolderPayload<ExtArgs>
        fields: Prisma.FileFolderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FileFolderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FileFolderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload>
          }
          findFirst: {
            args: Prisma.FileFolderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FileFolderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload>
          }
          findMany: {
            args: Prisma.FileFolderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload>[]
          }
          create: {
            args: Prisma.FileFolderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload>
          }
          createMany: {
            args: Prisma.FileFolderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FileFolderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload>[]
          }
          delete: {
            args: Prisma.FileFolderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload>
          }
          update: {
            args: Prisma.FileFolderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload>
          }
          deleteMany: {
            args: Prisma.FileFolderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FileFolderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FileFolderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderPayload>
          }
          aggregate: {
            args: Prisma.FileFolderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFileFolder>
          }
          groupBy: {
            args: Prisma.FileFolderGroupByArgs<ExtArgs>
            result: $Utils.Optional<FileFolderGroupByOutputType>[]
          }
          count: {
            args: Prisma.FileFolderCountArgs<ExtArgs>
            result: $Utils.Optional<FileFolderCountAggregateOutputType> | number
          }
        }
      }
      FileFolderLog: {
        payload: Prisma.$FileFolderLogPayload<ExtArgs>
        fields: Prisma.FileFolderLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FileFolderLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FileFolderLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload>
          }
          findFirst: {
            args: Prisma.FileFolderLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FileFolderLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload>
          }
          findMany: {
            args: Prisma.FileFolderLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload>[]
          }
          create: {
            args: Prisma.FileFolderLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload>
          }
          createMany: {
            args: Prisma.FileFolderLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FileFolderLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload>[]
          }
          delete: {
            args: Prisma.FileFolderLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload>
          }
          update: {
            args: Prisma.FileFolderLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload>
          }
          deleteMany: {
            args: Prisma.FileFolderLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FileFolderLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FileFolderLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileFolderLogPayload>
          }
          aggregate: {
            args: Prisma.FileFolderLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFileFolderLog>
          }
          groupBy: {
            args: Prisma.FileFolderLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<FileFolderLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.FileFolderLogCountArgs<ExtArgs>
            result: $Utils.Optional<FileFolderLogCountAggregateOutputType> | number
          }
        }
      }
      ErrorLog: {
        payload: Prisma.$ErrorLogPayload<ExtArgs>
        fields: Prisma.ErrorLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ErrorLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ErrorLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload>
          }
          findFirst: {
            args: Prisma.ErrorLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ErrorLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload>
          }
          findMany: {
            args: Prisma.ErrorLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload>[]
          }
          create: {
            args: Prisma.ErrorLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload>
          }
          createMany: {
            args: Prisma.ErrorLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ErrorLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload>[]
          }
          delete: {
            args: Prisma.ErrorLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload>
          }
          update: {
            args: Prisma.ErrorLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload>
          }
          deleteMany: {
            args: Prisma.ErrorLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ErrorLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ErrorLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ErrorLogPayload>
          }
          aggregate: {
            args: Prisma.ErrorLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateErrorLog>
          }
          groupBy: {
            args: Prisma.ErrorLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ErrorLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ErrorLogCountArgs<ExtArgs>
            result: $Utils.Optional<ErrorLogCountAggregateOutputType> | number
          }
        }
      }
      SystemError: {
        payload: Prisma.$SystemErrorPayload<ExtArgs>
        fields: Prisma.SystemErrorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemErrorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemErrorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload>
          }
          findFirst: {
            args: Prisma.SystemErrorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemErrorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload>
          }
          findMany: {
            args: Prisma.SystemErrorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload>[]
          }
          create: {
            args: Prisma.SystemErrorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload>
          }
          createMany: {
            args: Prisma.SystemErrorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SystemErrorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload>[]
          }
          delete: {
            args: Prisma.SystemErrorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload>
          }
          update: {
            args: Prisma.SystemErrorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload>
          }
          deleteMany: {
            args: Prisma.SystemErrorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemErrorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SystemErrorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemErrorPayload>
          }
          aggregate: {
            args: Prisma.SystemErrorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemError>
          }
          groupBy: {
            args: Prisma.SystemErrorGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemErrorGroupByOutputType>[]
          }
          count: {
            args: Prisma.SystemErrorCountArgs<ExtArgs>
            result: $Utils.Optional<SystemErrorCountAggregateOutputType> | number
          }
        }
      }
      WebDisk: {
        payload: Prisma.$WebDiskPayload<ExtArgs>
        fields: Prisma.WebDiskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WebDiskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WebDiskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload>
          }
          findFirst: {
            args: Prisma.WebDiskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WebDiskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload>
          }
          findMany: {
            args: Prisma.WebDiskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload>[]
          }
          create: {
            args: Prisma.WebDiskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload>
          }
          createMany: {
            args: Prisma.WebDiskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WebDiskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload>[]
          }
          delete: {
            args: Prisma.WebDiskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload>
          }
          update: {
            args: Prisma.WebDiskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload>
          }
          deleteMany: {
            args: Prisma.WebDiskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WebDiskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WebDiskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebDiskPayload>
          }
          aggregate: {
            args: Prisma.WebDiskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWebDisk>
          }
          groupBy: {
            args: Prisma.WebDiskGroupByArgs<ExtArgs>
            result: $Utils.Optional<WebDiskGroupByOutputType>[]
          }
          count: {
            args: Prisma.WebDiskCountArgs<ExtArgs>
            result: $Utils.Optional<WebDiskCountAggregateOutputType> | number
          }
        }
      }
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type FileFolderCountOutputType
   */

  export type FileFolderCountOutputType = {
    logs: number
  }

  export type FileFolderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    logs?: boolean | FileFolderCountOutputTypeCountLogsArgs
  }

  // Custom InputTypes
  /**
   * FileFolderCountOutputType without action
   */
  export type FileFolderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderCountOutputType
     */
    select?: FileFolderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FileFolderCountOutputType without action
   */
  export type FileFolderCountOutputTypeCountLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FileFolderLogWhereInput
  }


  /**
   * Models
   */

  /**
   * Model FileFolder
   */

  export type AggregateFileFolder = {
    _count: FileFolderCountAggregateOutputType | null
    _avg: FileFolderAvgAggregateOutputType | null
    _sum: FileFolderSumAggregateOutputType | null
    _min: FileFolderMinAggregateOutputType | null
    _max: FileFolderMaxAggregateOutputType | null
  }

  export type FileFolderAvgAggregateOutputType = {
    size: number | null
    totalActivity: number | null
  }

  export type FileFolderSumAggregateOutputType = {
    size: bigint | null
    totalActivity: number | null
  }

  export type FileFolderMinAggregateOutputType = {
    id: string | null
    name: string | null
    path: string | null
    type: string | null
    owner: string | null
    stored_as: string | null
    size: bigint | null
    lastActivityOn: Date | null
    totalActivity: number | null
    created_on: Date | null
    updated_on: Date | null
  }

  export type FileFolderMaxAggregateOutputType = {
    id: string | null
    name: string | null
    path: string | null
    type: string | null
    owner: string | null
    stored_as: string | null
    size: bigint | null
    lastActivityOn: Date | null
    totalActivity: number | null
    created_on: Date | null
    updated_on: Date | null
  }

  export type FileFolderCountAggregateOutputType = {
    id: number
    name: number
    path: number
    type: number
    owner: number
    stored_as: number
    size: number
    last_activity: number
    lastActivityOn: number
    totalActivity: number
    details: number
    created_on: number
    updated_on: number
    _all: number
  }


  export type FileFolderAvgAggregateInputType = {
    size?: true
    totalActivity?: true
  }

  export type FileFolderSumAggregateInputType = {
    size?: true
    totalActivity?: true
  }

  export type FileFolderMinAggregateInputType = {
    id?: true
    name?: true
    path?: true
    type?: true
    owner?: true
    stored_as?: true
    size?: true
    lastActivityOn?: true
    totalActivity?: true
    created_on?: true
    updated_on?: true
  }

  export type FileFolderMaxAggregateInputType = {
    id?: true
    name?: true
    path?: true
    type?: true
    owner?: true
    stored_as?: true
    size?: true
    lastActivityOn?: true
    totalActivity?: true
    created_on?: true
    updated_on?: true
  }

  export type FileFolderCountAggregateInputType = {
    id?: true
    name?: true
    path?: true
    type?: true
    owner?: true
    stored_as?: true
    size?: true
    last_activity?: true
    lastActivityOn?: true
    totalActivity?: true
    details?: true
    created_on?: true
    updated_on?: true
    _all?: true
  }

  export type FileFolderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FileFolder to aggregate.
     */
    where?: FileFolderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileFolders to fetch.
     */
    orderBy?: FileFolderOrderByWithRelationInput | FileFolderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FileFolderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileFolders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileFolders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FileFolders
    **/
    _count?: true | FileFolderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FileFolderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FileFolderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FileFolderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FileFolderMaxAggregateInputType
  }

  export type GetFileFolderAggregateType<T extends FileFolderAggregateArgs> = {
        [P in keyof T & keyof AggregateFileFolder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFileFolder[P]>
      : GetScalarType<T[P], AggregateFileFolder[P]>
  }




  export type FileFolderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FileFolderWhereInput
    orderBy?: FileFolderOrderByWithAggregationInput | FileFolderOrderByWithAggregationInput[]
    by: FileFolderScalarFieldEnum[] | FileFolderScalarFieldEnum
    having?: FileFolderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FileFolderCountAggregateInputType | true
    _avg?: FileFolderAvgAggregateInputType
    _sum?: FileFolderSumAggregateInputType
    _min?: FileFolderMinAggregateInputType
    _max?: FileFolderMaxAggregateInputType
  }

  export type FileFolderGroupByOutputType = {
    id: string
    name: string
    path: string
    type: string
    owner: string
    stored_as: string
    size: bigint
    last_activity: JsonValue
    lastActivityOn: Date | null
    totalActivity: number
    details: JsonValue
    created_on: Date
    updated_on: Date
    _count: FileFolderCountAggregateOutputType | null
    _avg: FileFolderAvgAggregateOutputType | null
    _sum: FileFolderSumAggregateOutputType | null
    _min: FileFolderMinAggregateOutputType | null
    _max: FileFolderMaxAggregateOutputType | null
  }

  type GetFileFolderGroupByPayload<T extends FileFolderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FileFolderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FileFolderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FileFolderGroupByOutputType[P]>
            : GetScalarType<T[P], FileFolderGroupByOutputType[P]>
        }
      >
    >


  export type FileFolderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    path?: boolean
    type?: boolean
    owner?: boolean
    stored_as?: boolean
    size?: boolean
    last_activity?: boolean
    lastActivityOn?: boolean
    totalActivity?: boolean
    details?: boolean
    created_on?: boolean
    updated_on?: boolean
    logs?: boolean | FileFolder$logsArgs<ExtArgs>
    _count?: boolean | FileFolderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fileFolder"]>

  export type FileFolderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    path?: boolean
    type?: boolean
    owner?: boolean
    stored_as?: boolean
    size?: boolean
    last_activity?: boolean
    lastActivityOn?: boolean
    totalActivity?: boolean
    details?: boolean
    created_on?: boolean
    updated_on?: boolean
  }, ExtArgs["result"]["fileFolder"]>

  export type FileFolderSelectScalar = {
    id?: boolean
    name?: boolean
    path?: boolean
    type?: boolean
    owner?: boolean
    stored_as?: boolean
    size?: boolean
    last_activity?: boolean
    lastActivityOn?: boolean
    totalActivity?: boolean
    details?: boolean
    created_on?: boolean
    updated_on?: boolean
  }

  export type FileFolderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    logs?: boolean | FileFolder$logsArgs<ExtArgs>
    _count?: boolean | FileFolderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FileFolderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $FileFolderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FileFolder"
    objects: {
      logs: Prisma.$FileFolderLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      path: string
      type: string
      owner: string
      stored_as: string
      size: bigint
      last_activity: Prisma.JsonValue
      lastActivityOn: Date | null
      totalActivity: number
      details: Prisma.JsonValue
      created_on: Date
      updated_on: Date
    }, ExtArgs["result"]["fileFolder"]>
    composites: {}
  }

  type FileFolderGetPayload<S extends boolean | null | undefined | FileFolderDefaultArgs> = $Result.GetResult<Prisma.$FileFolderPayload, S>

  type FileFolderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FileFolderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FileFolderCountAggregateInputType | true
    }

  export interface FileFolderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FileFolder'], meta: { name: 'FileFolder' } }
    /**
     * Find zero or one FileFolder that matches the filter.
     * @param {FileFolderFindUniqueArgs} args - Arguments to find a FileFolder
     * @example
     * // Get one FileFolder
     * const fileFolder = await prisma.fileFolder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FileFolderFindUniqueArgs>(args: SelectSubset<T, FileFolderFindUniqueArgs<ExtArgs>>): Prisma__FileFolderClient<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FileFolder that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FileFolderFindUniqueOrThrowArgs} args - Arguments to find a FileFolder
     * @example
     * // Get one FileFolder
     * const fileFolder = await prisma.fileFolder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FileFolderFindUniqueOrThrowArgs>(args: SelectSubset<T, FileFolderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FileFolderClient<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FileFolder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderFindFirstArgs} args - Arguments to find a FileFolder
     * @example
     * // Get one FileFolder
     * const fileFolder = await prisma.fileFolder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FileFolderFindFirstArgs>(args?: SelectSubset<T, FileFolderFindFirstArgs<ExtArgs>>): Prisma__FileFolderClient<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FileFolder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderFindFirstOrThrowArgs} args - Arguments to find a FileFolder
     * @example
     * // Get one FileFolder
     * const fileFolder = await prisma.fileFolder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FileFolderFindFirstOrThrowArgs>(args?: SelectSubset<T, FileFolderFindFirstOrThrowArgs<ExtArgs>>): Prisma__FileFolderClient<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FileFolders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FileFolders
     * const fileFolders = await prisma.fileFolder.findMany()
     * 
     * // Get first 10 FileFolders
     * const fileFolders = await prisma.fileFolder.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fileFolderWithIdOnly = await prisma.fileFolder.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FileFolderFindManyArgs>(args?: SelectSubset<T, FileFolderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FileFolder.
     * @param {FileFolderCreateArgs} args - Arguments to create a FileFolder.
     * @example
     * // Create one FileFolder
     * const FileFolder = await prisma.fileFolder.create({
     *   data: {
     *     // ... data to create a FileFolder
     *   }
     * })
     * 
     */
    create<T extends FileFolderCreateArgs>(args: SelectSubset<T, FileFolderCreateArgs<ExtArgs>>): Prisma__FileFolderClient<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FileFolders.
     * @param {FileFolderCreateManyArgs} args - Arguments to create many FileFolders.
     * @example
     * // Create many FileFolders
     * const fileFolder = await prisma.fileFolder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FileFolderCreateManyArgs>(args?: SelectSubset<T, FileFolderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FileFolders and returns the data saved in the database.
     * @param {FileFolderCreateManyAndReturnArgs} args - Arguments to create many FileFolders.
     * @example
     * // Create many FileFolders
     * const fileFolder = await prisma.fileFolder.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FileFolders and only return the `id`
     * const fileFolderWithIdOnly = await prisma.fileFolder.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FileFolderCreateManyAndReturnArgs>(args?: SelectSubset<T, FileFolderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FileFolder.
     * @param {FileFolderDeleteArgs} args - Arguments to delete one FileFolder.
     * @example
     * // Delete one FileFolder
     * const FileFolder = await prisma.fileFolder.delete({
     *   where: {
     *     // ... filter to delete one FileFolder
     *   }
     * })
     * 
     */
    delete<T extends FileFolderDeleteArgs>(args: SelectSubset<T, FileFolderDeleteArgs<ExtArgs>>): Prisma__FileFolderClient<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FileFolder.
     * @param {FileFolderUpdateArgs} args - Arguments to update one FileFolder.
     * @example
     * // Update one FileFolder
     * const fileFolder = await prisma.fileFolder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FileFolderUpdateArgs>(args: SelectSubset<T, FileFolderUpdateArgs<ExtArgs>>): Prisma__FileFolderClient<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FileFolders.
     * @param {FileFolderDeleteManyArgs} args - Arguments to filter FileFolders to delete.
     * @example
     * // Delete a few FileFolders
     * const { count } = await prisma.fileFolder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FileFolderDeleteManyArgs>(args?: SelectSubset<T, FileFolderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FileFolders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FileFolders
     * const fileFolder = await prisma.fileFolder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FileFolderUpdateManyArgs>(args: SelectSubset<T, FileFolderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FileFolder.
     * @param {FileFolderUpsertArgs} args - Arguments to update or create a FileFolder.
     * @example
     * // Update or create a FileFolder
     * const fileFolder = await prisma.fileFolder.upsert({
     *   create: {
     *     // ... data to create a FileFolder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FileFolder we want to update
     *   }
     * })
     */
    upsert<T extends FileFolderUpsertArgs>(args: SelectSubset<T, FileFolderUpsertArgs<ExtArgs>>): Prisma__FileFolderClient<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FileFolders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderCountArgs} args - Arguments to filter FileFolders to count.
     * @example
     * // Count the number of FileFolders
     * const count = await prisma.fileFolder.count({
     *   where: {
     *     // ... the filter for the FileFolders we want to count
     *   }
     * })
    **/
    count<T extends FileFolderCountArgs>(
      args?: Subset<T, FileFolderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FileFolderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FileFolder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FileFolderAggregateArgs>(args: Subset<T, FileFolderAggregateArgs>): Prisma.PrismaPromise<GetFileFolderAggregateType<T>>

    /**
     * Group by FileFolder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FileFolderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FileFolderGroupByArgs['orderBy'] }
        : { orderBy?: FileFolderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FileFolderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFileFolderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FileFolder model
   */
  readonly fields: FileFolderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FileFolder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FileFolderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    logs<T extends FileFolder$logsArgs<ExtArgs> = {}>(args?: Subset<T, FileFolder$logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FileFolder model
   */ 
  interface FileFolderFieldRefs {
    readonly id: FieldRef<"FileFolder", 'String'>
    readonly name: FieldRef<"FileFolder", 'String'>
    readonly path: FieldRef<"FileFolder", 'String'>
    readonly type: FieldRef<"FileFolder", 'String'>
    readonly owner: FieldRef<"FileFolder", 'String'>
    readonly stored_as: FieldRef<"FileFolder", 'String'>
    readonly size: FieldRef<"FileFolder", 'BigInt'>
    readonly last_activity: FieldRef<"FileFolder", 'Json'>
    readonly lastActivityOn: FieldRef<"FileFolder", 'DateTime'>
    readonly totalActivity: FieldRef<"FileFolder", 'Int'>
    readonly details: FieldRef<"FileFolder", 'Json'>
    readonly created_on: FieldRef<"FileFolder", 'DateTime'>
    readonly updated_on: FieldRef<"FileFolder", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FileFolder findUnique
   */
  export type FileFolderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
    /**
     * Filter, which FileFolder to fetch.
     */
    where: FileFolderWhereUniqueInput
  }

  /**
   * FileFolder findUniqueOrThrow
   */
  export type FileFolderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
    /**
     * Filter, which FileFolder to fetch.
     */
    where: FileFolderWhereUniqueInput
  }

  /**
   * FileFolder findFirst
   */
  export type FileFolderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
    /**
     * Filter, which FileFolder to fetch.
     */
    where?: FileFolderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileFolders to fetch.
     */
    orderBy?: FileFolderOrderByWithRelationInput | FileFolderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FileFolders.
     */
    cursor?: FileFolderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileFolders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileFolders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FileFolders.
     */
    distinct?: FileFolderScalarFieldEnum | FileFolderScalarFieldEnum[]
  }

  /**
   * FileFolder findFirstOrThrow
   */
  export type FileFolderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
    /**
     * Filter, which FileFolder to fetch.
     */
    where?: FileFolderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileFolders to fetch.
     */
    orderBy?: FileFolderOrderByWithRelationInput | FileFolderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FileFolders.
     */
    cursor?: FileFolderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileFolders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileFolders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FileFolders.
     */
    distinct?: FileFolderScalarFieldEnum | FileFolderScalarFieldEnum[]
  }

  /**
   * FileFolder findMany
   */
  export type FileFolderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
    /**
     * Filter, which FileFolders to fetch.
     */
    where?: FileFolderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileFolders to fetch.
     */
    orderBy?: FileFolderOrderByWithRelationInput | FileFolderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FileFolders.
     */
    cursor?: FileFolderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileFolders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileFolders.
     */
    skip?: number
    distinct?: FileFolderScalarFieldEnum | FileFolderScalarFieldEnum[]
  }

  /**
   * FileFolder create
   */
  export type FileFolderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
    /**
     * The data needed to create a FileFolder.
     */
    data: XOR<FileFolderCreateInput, FileFolderUncheckedCreateInput>
  }

  /**
   * FileFolder createMany
   */
  export type FileFolderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FileFolders.
     */
    data: FileFolderCreateManyInput | FileFolderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FileFolder createManyAndReturn
   */
  export type FileFolderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FileFolders.
     */
    data: FileFolderCreateManyInput | FileFolderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FileFolder update
   */
  export type FileFolderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
    /**
     * The data needed to update a FileFolder.
     */
    data: XOR<FileFolderUpdateInput, FileFolderUncheckedUpdateInput>
    /**
     * Choose, which FileFolder to update.
     */
    where: FileFolderWhereUniqueInput
  }

  /**
   * FileFolder updateMany
   */
  export type FileFolderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FileFolders.
     */
    data: XOR<FileFolderUpdateManyMutationInput, FileFolderUncheckedUpdateManyInput>
    /**
     * Filter which FileFolders to update
     */
    where?: FileFolderWhereInput
  }

  /**
   * FileFolder upsert
   */
  export type FileFolderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
    /**
     * The filter to search for the FileFolder to update in case it exists.
     */
    where: FileFolderWhereUniqueInput
    /**
     * In case the FileFolder found by the `where` argument doesn't exist, create a new FileFolder with this data.
     */
    create: XOR<FileFolderCreateInput, FileFolderUncheckedCreateInput>
    /**
     * In case the FileFolder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FileFolderUpdateInput, FileFolderUncheckedUpdateInput>
  }

  /**
   * FileFolder delete
   */
  export type FileFolderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
    /**
     * Filter which FileFolder to delete.
     */
    where: FileFolderWhereUniqueInput
  }

  /**
   * FileFolder deleteMany
   */
  export type FileFolderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FileFolders to delete
     */
    where?: FileFolderWhereInput
  }

  /**
   * FileFolder.logs
   */
  export type FileFolder$logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    where?: FileFolderLogWhereInput
    orderBy?: FileFolderLogOrderByWithRelationInput | FileFolderLogOrderByWithRelationInput[]
    cursor?: FileFolderLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FileFolderLogScalarFieldEnum | FileFolderLogScalarFieldEnum[]
  }

  /**
   * FileFolder without action
   */
  export type FileFolderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolder
     */
    select?: FileFolderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderInclude<ExtArgs> | null
  }


  /**
   * Model FileFolderLog
   */

  export type AggregateFileFolderLog = {
    _count: FileFolderLogCountAggregateOutputType | null
    _min: FileFolderLogMinAggregateOutputType | null
    _max: FileFolderLogMaxAggregateOutputType | null
  }

  export type FileFolderLogMinAggregateOutputType = {
    id: string | null
    filefolder_id: string | null
    action: string | null
    done_by: string | null
    done_on: Date | null
  }

  export type FileFolderLogMaxAggregateOutputType = {
    id: string | null
    filefolder_id: string | null
    action: string | null
    done_by: string | null
    done_on: Date | null
  }

  export type FileFolderLogCountAggregateOutputType = {
    id: number
    filefolder_id: number
    action: number
    details: number
    done_by: number
    done_on: number
    _all: number
  }


  export type FileFolderLogMinAggregateInputType = {
    id?: true
    filefolder_id?: true
    action?: true
    done_by?: true
    done_on?: true
  }

  export type FileFolderLogMaxAggregateInputType = {
    id?: true
    filefolder_id?: true
    action?: true
    done_by?: true
    done_on?: true
  }

  export type FileFolderLogCountAggregateInputType = {
    id?: true
    filefolder_id?: true
    action?: true
    details?: true
    done_by?: true
    done_on?: true
    _all?: true
  }

  export type FileFolderLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FileFolderLog to aggregate.
     */
    where?: FileFolderLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileFolderLogs to fetch.
     */
    orderBy?: FileFolderLogOrderByWithRelationInput | FileFolderLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FileFolderLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileFolderLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileFolderLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FileFolderLogs
    **/
    _count?: true | FileFolderLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FileFolderLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FileFolderLogMaxAggregateInputType
  }

  export type GetFileFolderLogAggregateType<T extends FileFolderLogAggregateArgs> = {
        [P in keyof T & keyof AggregateFileFolderLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFileFolderLog[P]>
      : GetScalarType<T[P], AggregateFileFolderLog[P]>
  }




  export type FileFolderLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FileFolderLogWhereInput
    orderBy?: FileFolderLogOrderByWithAggregationInput | FileFolderLogOrderByWithAggregationInput[]
    by: FileFolderLogScalarFieldEnum[] | FileFolderLogScalarFieldEnum
    having?: FileFolderLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FileFolderLogCountAggregateInputType | true
    _min?: FileFolderLogMinAggregateInputType
    _max?: FileFolderLogMaxAggregateInputType
  }

  export type FileFolderLogGroupByOutputType = {
    id: string
    filefolder_id: string
    action: string
    details: JsonValue
    done_by: string
    done_on: Date
    _count: FileFolderLogCountAggregateOutputType | null
    _min: FileFolderLogMinAggregateOutputType | null
    _max: FileFolderLogMaxAggregateOutputType | null
  }

  type GetFileFolderLogGroupByPayload<T extends FileFolderLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FileFolderLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FileFolderLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FileFolderLogGroupByOutputType[P]>
            : GetScalarType<T[P], FileFolderLogGroupByOutputType[P]>
        }
      >
    >


  export type FileFolderLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filefolder_id?: boolean
    action?: boolean
    details?: boolean
    done_by?: boolean
    done_on?: boolean
    filefolder?: boolean | FileFolderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fileFolderLog"]>

  export type FileFolderLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filefolder_id?: boolean
    action?: boolean
    details?: boolean
    done_by?: boolean
    done_on?: boolean
    filefolder?: boolean | FileFolderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fileFolderLog"]>

  export type FileFolderLogSelectScalar = {
    id?: boolean
    filefolder_id?: boolean
    action?: boolean
    details?: boolean
    done_by?: boolean
    done_on?: boolean
  }

  export type FileFolderLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filefolder?: boolean | FileFolderDefaultArgs<ExtArgs>
  }
  export type FileFolderLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filefolder?: boolean | FileFolderDefaultArgs<ExtArgs>
  }

  export type $FileFolderLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FileFolderLog"
    objects: {
      filefolder: Prisma.$FileFolderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      filefolder_id: string
      action: string
      details: Prisma.JsonValue
      done_by: string
      done_on: Date
    }, ExtArgs["result"]["fileFolderLog"]>
    composites: {}
  }

  type FileFolderLogGetPayload<S extends boolean | null | undefined | FileFolderLogDefaultArgs> = $Result.GetResult<Prisma.$FileFolderLogPayload, S>

  type FileFolderLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FileFolderLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FileFolderLogCountAggregateInputType | true
    }

  export interface FileFolderLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FileFolderLog'], meta: { name: 'FileFolderLog' } }
    /**
     * Find zero or one FileFolderLog that matches the filter.
     * @param {FileFolderLogFindUniqueArgs} args - Arguments to find a FileFolderLog
     * @example
     * // Get one FileFolderLog
     * const fileFolderLog = await prisma.fileFolderLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FileFolderLogFindUniqueArgs>(args: SelectSubset<T, FileFolderLogFindUniqueArgs<ExtArgs>>): Prisma__FileFolderLogClient<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FileFolderLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FileFolderLogFindUniqueOrThrowArgs} args - Arguments to find a FileFolderLog
     * @example
     * // Get one FileFolderLog
     * const fileFolderLog = await prisma.fileFolderLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FileFolderLogFindUniqueOrThrowArgs>(args: SelectSubset<T, FileFolderLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FileFolderLogClient<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FileFolderLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderLogFindFirstArgs} args - Arguments to find a FileFolderLog
     * @example
     * // Get one FileFolderLog
     * const fileFolderLog = await prisma.fileFolderLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FileFolderLogFindFirstArgs>(args?: SelectSubset<T, FileFolderLogFindFirstArgs<ExtArgs>>): Prisma__FileFolderLogClient<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FileFolderLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderLogFindFirstOrThrowArgs} args - Arguments to find a FileFolderLog
     * @example
     * // Get one FileFolderLog
     * const fileFolderLog = await prisma.fileFolderLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FileFolderLogFindFirstOrThrowArgs>(args?: SelectSubset<T, FileFolderLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__FileFolderLogClient<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FileFolderLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FileFolderLogs
     * const fileFolderLogs = await prisma.fileFolderLog.findMany()
     * 
     * // Get first 10 FileFolderLogs
     * const fileFolderLogs = await prisma.fileFolderLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fileFolderLogWithIdOnly = await prisma.fileFolderLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FileFolderLogFindManyArgs>(args?: SelectSubset<T, FileFolderLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FileFolderLog.
     * @param {FileFolderLogCreateArgs} args - Arguments to create a FileFolderLog.
     * @example
     * // Create one FileFolderLog
     * const FileFolderLog = await prisma.fileFolderLog.create({
     *   data: {
     *     // ... data to create a FileFolderLog
     *   }
     * })
     * 
     */
    create<T extends FileFolderLogCreateArgs>(args: SelectSubset<T, FileFolderLogCreateArgs<ExtArgs>>): Prisma__FileFolderLogClient<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FileFolderLogs.
     * @param {FileFolderLogCreateManyArgs} args - Arguments to create many FileFolderLogs.
     * @example
     * // Create many FileFolderLogs
     * const fileFolderLog = await prisma.fileFolderLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FileFolderLogCreateManyArgs>(args?: SelectSubset<T, FileFolderLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FileFolderLogs and returns the data saved in the database.
     * @param {FileFolderLogCreateManyAndReturnArgs} args - Arguments to create many FileFolderLogs.
     * @example
     * // Create many FileFolderLogs
     * const fileFolderLog = await prisma.fileFolderLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FileFolderLogs and only return the `id`
     * const fileFolderLogWithIdOnly = await prisma.fileFolderLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FileFolderLogCreateManyAndReturnArgs>(args?: SelectSubset<T, FileFolderLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FileFolderLog.
     * @param {FileFolderLogDeleteArgs} args - Arguments to delete one FileFolderLog.
     * @example
     * // Delete one FileFolderLog
     * const FileFolderLog = await prisma.fileFolderLog.delete({
     *   where: {
     *     // ... filter to delete one FileFolderLog
     *   }
     * })
     * 
     */
    delete<T extends FileFolderLogDeleteArgs>(args: SelectSubset<T, FileFolderLogDeleteArgs<ExtArgs>>): Prisma__FileFolderLogClient<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FileFolderLog.
     * @param {FileFolderLogUpdateArgs} args - Arguments to update one FileFolderLog.
     * @example
     * // Update one FileFolderLog
     * const fileFolderLog = await prisma.fileFolderLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FileFolderLogUpdateArgs>(args: SelectSubset<T, FileFolderLogUpdateArgs<ExtArgs>>): Prisma__FileFolderLogClient<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FileFolderLogs.
     * @param {FileFolderLogDeleteManyArgs} args - Arguments to filter FileFolderLogs to delete.
     * @example
     * // Delete a few FileFolderLogs
     * const { count } = await prisma.fileFolderLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FileFolderLogDeleteManyArgs>(args?: SelectSubset<T, FileFolderLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FileFolderLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FileFolderLogs
     * const fileFolderLog = await prisma.fileFolderLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FileFolderLogUpdateManyArgs>(args: SelectSubset<T, FileFolderLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FileFolderLog.
     * @param {FileFolderLogUpsertArgs} args - Arguments to update or create a FileFolderLog.
     * @example
     * // Update or create a FileFolderLog
     * const fileFolderLog = await prisma.fileFolderLog.upsert({
     *   create: {
     *     // ... data to create a FileFolderLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FileFolderLog we want to update
     *   }
     * })
     */
    upsert<T extends FileFolderLogUpsertArgs>(args: SelectSubset<T, FileFolderLogUpsertArgs<ExtArgs>>): Prisma__FileFolderLogClient<$Result.GetResult<Prisma.$FileFolderLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FileFolderLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderLogCountArgs} args - Arguments to filter FileFolderLogs to count.
     * @example
     * // Count the number of FileFolderLogs
     * const count = await prisma.fileFolderLog.count({
     *   where: {
     *     // ... the filter for the FileFolderLogs we want to count
     *   }
     * })
    **/
    count<T extends FileFolderLogCountArgs>(
      args?: Subset<T, FileFolderLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FileFolderLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FileFolderLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FileFolderLogAggregateArgs>(args: Subset<T, FileFolderLogAggregateArgs>): Prisma.PrismaPromise<GetFileFolderLogAggregateType<T>>

    /**
     * Group by FileFolderLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFolderLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FileFolderLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FileFolderLogGroupByArgs['orderBy'] }
        : { orderBy?: FileFolderLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FileFolderLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFileFolderLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FileFolderLog model
   */
  readonly fields: FileFolderLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FileFolderLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FileFolderLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    filefolder<T extends FileFolderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FileFolderDefaultArgs<ExtArgs>>): Prisma__FileFolderClient<$Result.GetResult<Prisma.$FileFolderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FileFolderLog model
   */ 
  interface FileFolderLogFieldRefs {
    readonly id: FieldRef<"FileFolderLog", 'String'>
    readonly filefolder_id: FieldRef<"FileFolderLog", 'String'>
    readonly action: FieldRef<"FileFolderLog", 'String'>
    readonly details: FieldRef<"FileFolderLog", 'Json'>
    readonly done_by: FieldRef<"FileFolderLog", 'String'>
    readonly done_on: FieldRef<"FileFolderLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FileFolderLog findUnique
   */
  export type FileFolderLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    /**
     * Filter, which FileFolderLog to fetch.
     */
    where: FileFolderLogWhereUniqueInput
  }

  /**
   * FileFolderLog findUniqueOrThrow
   */
  export type FileFolderLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    /**
     * Filter, which FileFolderLog to fetch.
     */
    where: FileFolderLogWhereUniqueInput
  }

  /**
   * FileFolderLog findFirst
   */
  export type FileFolderLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    /**
     * Filter, which FileFolderLog to fetch.
     */
    where?: FileFolderLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileFolderLogs to fetch.
     */
    orderBy?: FileFolderLogOrderByWithRelationInput | FileFolderLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FileFolderLogs.
     */
    cursor?: FileFolderLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileFolderLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileFolderLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FileFolderLogs.
     */
    distinct?: FileFolderLogScalarFieldEnum | FileFolderLogScalarFieldEnum[]
  }

  /**
   * FileFolderLog findFirstOrThrow
   */
  export type FileFolderLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    /**
     * Filter, which FileFolderLog to fetch.
     */
    where?: FileFolderLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileFolderLogs to fetch.
     */
    orderBy?: FileFolderLogOrderByWithRelationInput | FileFolderLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FileFolderLogs.
     */
    cursor?: FileFolderLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileFolderLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileFolderLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FileFolderLogs.
     */
    distinct?: FileFolderLogScalarFieldEnum | FileFolderLogScalarFieldEnum[]
  }

  /**
   * FileFolderLog findMany
   */
  export type FileFolderLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    /**
     * Filter, which FileFolderLogs to fetch.
     */
    where?: FileFolderLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileFolderLogs to fetch.
     */
    orderBy?: FileFolderLogOrderByWithRelationInput | FileFolderLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FileFolderLogs.
     */
    cursor?: FileFolderLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileFolderLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileFolderLogs.
     */
    skip?: number
    distinct?: FileFolderLogScalarFieldEnum | FileFolderLogScalarFieldEnum[]
  }

  /**
   * FileFolderLog create
   */
  export type FileFolderLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    /**
     * The data needed to create a FileFolderLog.
     */
    data: XOR<FileFolderLogCreateInput, FileFolderLogUncheckedCreateInput>
  }

  /**
   * FileFolderLog createMany
   */
  export type FileFolderLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FileFolderLogs.
     */
    data: FileFolderLogCreateManyInput | FileFolderLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FileFolderLog createManyAndReturn
   */
  export type FileFolderLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FileFolderLogs.
     */
    data: FileFolderLogCreateManyInput | FileFolderLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FileFolderLog update
   */
  export type FileFolderLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    /**
     * The data needed to update a FileFolderLog.
     */
    data: XOR<FileFolderLogUpdateInput, FileFolderLogUncheckedUpdateInput>
    /**
     * Choose, which FileFolderLog to update.
     */
    where: FileFolderLogWhereUniqueInput
  }

  /**
   * FileFolderLog updateMany
   */
  export type FileFolderLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FileFolderLogs.
     */
    data: XOR<FileFolderLogUpdateManyMutationInput, FileFolderLogUncheckedUpdateManyInput>
    /**
     * Filter which FileFolderLogs to update
     */
    where?: FileFolderLogWhereInput
  }

  /**
   * FileFolderLog upsert
   */
  export type FileFolderLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    /**
     * The filter to search for the FileFolderLog to update in case it exists.
     */
    where: FileFolderLogWhereUniqueInput
    /**
     * In case the FileFolderLog found by the `where` argument doesn't exist, create a new FileFolderLog with this data.
     */
    create: XOR<FileFolderLogCreateInput, FileFolderLogUncheckedCreateInput>
    /**
     * In case the FileFolderLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FileFolderLogUpdateInput, FileFolderLogUncheckedUpdateInput>
  }

  /**
   * FileFolderLog delete
   */
  export type FileFolderLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
    /**
     * Filter which FileFolderLog to delete.
     */
    where: FileFolderLogWhereUniqueInput
  }

  /**
   * FileFolderLog deleteMany
   */
  export type FileFolderLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FileFolderLogs to delete
     */
    where?: FileFolderLogWhereInput
  }

  /**
   * FileFolderLog without action
   */
  export type FileFolderLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileFolderLog
     */
    select?: FileFolderLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileFolderLogInclude<ExtArgs> | null
  }


  /**
   * Model ErrorLog
   */

  export type AggregateErrorLog = {
    _count: ErrorLogCountAggregateOutputType | null
    _min: ErrorLogMinAggregateOutputType | null
    _max: ErrorLogMaxAggregateOutputType | null
  }

  export type ErrorLogMinAggregateOutputType = {
    id: string | null
    on_page: string | null
    context: string | null
    created_on: Date | null
  }

  export type ErrorLogMaxAggregateOutputType = {
    id: string | null
    on_page: string | null
    context: string | null
    created_on: Date | null
  }

  export type ErrorLogCountAggregateOutputType = {
    id: number
    on_page: number
    context: number
    created_on: number
    _all: number
  }


  export type ErrorLogMinAggregateInputType = {
    id?: true
    on_page?: true
    context?: true
    created_on?: true
  }

  export type ErrorLogMaxAggregateInputType = {
    id?: true
    on_page?: true
    context?: true
    created_on?: true
  }

  export type ErrorLogCountAggregateInputType = {
    id?: true
    on_page?: true
    context?: true
    created_on?: true
    _all?: true
  }

  export type ErrorLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ErrorLog to aggregate.
     */
    where?: ErrorLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ErrorLogs to fetch.
     */
    orderBy?: ErrorLogOrderByWithRelationInput | ErrorLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ErrorLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ErrorLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ErrorLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ErrorLogs
    **/
    _count?: true | ErrorLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ErrorLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ErrorLogMaxAggregateInputType
  }

  export type GetErrorLogAggregateType<T extends ErrorLogAggregateArgs> = {
        [P in keyof T & keyof AggregateErrorLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateErrorLog[P]>
      : GetScalarType<T[P], AggregateErrorLog[P]>
  }




  export type ErrorLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ErrorLogWhereInput
    orderBy?: ErrorLogOrderByWithAggregationInput | ErrorLogOrderByWithAggregationInput[]
    by: ErrorLogScalarFieldEnum[] | ErrorLogScalarFieldEnum
    having?: ErrorLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ErrorLogCountAggregateInputType | true
    _min?: ErrorLogMinAggregateInputType
    _max?: ErrorLogMaxAggregateInputType
  }

  export type ErrorLogGroupByOutputType = {
    id: string
    on_page: string
    context: string
    created_on: Date
    _count: ErrorLogCountAggregateOutputType | null
    _min: ErrorLogMinAggregateOutputType | null
    _max: ErrorLogMaxAggregateOutputType | null
  }

  type GetErrorLogGroupByPayload<T extends ErrorLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ErrorLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ErrorLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ErrorLogGroupByOutputType[P]>
            : GetScalarType<T[P], ErrorLogGroupByOutputType[P]>
        }
      >
    >


  export type ErrorLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    on_page?: boolean
    context?: boolean
    created_on?: boolean
  }, ExtArgs["result"]["errorLog"]>

  export type ErrorLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    on_page?: boolean
    context?: boolean
    created_on?: boolean
  }, ExtArgs["result"]["errorLog"]>

  export type ErrorLogSelectScalar = {
    id?: boolean
    on_page?: boolean
    context?: boolean
    created_on?: boolean
  }


  export type $ErrorLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ErrorLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      on_page: string
      context: string
      created_on: Date
    }, ExtArgs["result"]["errorLog"]>
    composites: {}
  }

  type ErrorLogGetPayload<S extends boolean | null | undefined | ErrorLogDefaultArgs> = $Result.GetResult<Prisma.$ErrorLogPayload, S>

  type ErrorLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ErrorLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ErrorLogCountAggregateInputType | true
    }

  export interface ErrorLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ErrorLog'], meta: { name: 'ErrorLog' } }
    /**
     * Find zero or one ErrorLog that matches the filter.
     * @param {ErrorLogFindUniqueArgs} args - Arguments to find a ErrorLog
     * @example
     * // Get one ErrorLog
     * const errorLog = await prisma.errorLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ErrorLogFindUniqueArgs>(args: SelectSubset<T, ErrorLogFindUniqueArgs<ExtArgs>>): Prisma__ErrorLogClient<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ErrorLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ErrorLogFindUniqueOrThrowArgs} args - Arguments to find a ErrorLog
     * @example
     * // Get one ErrorLog
     * const errorLog = await prisma.errorLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ErrorLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ErrorLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ErrorLogClient<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ErrorLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ErrorLogFindFirstArgs} args - Arguments to find a ErrorLog
     * @example
     * // Get one ErrorLog
     * const errorLog = await prisma.errorLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ErrorLogFindFirstArgs>(args?: SelectSubset<T, ErrorLogFindFirstArgs<ExtArgs>>): Prisma__ErrorLogClient<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ErrorLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ErrorLogFindFirstOrThrowArgs} args - Arguments to find a ErrorLog
     * @example
     * // Get one ErrorLog
     * const errorLog = await prisma.errorLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ErrorLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ErrorLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ErrorLogClient<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ErrorLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ErrorLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ErrorLogs
     * const errorLogs = await prisma.errorLog.findMany()
     * 
     * // Get first 10 ErrorLogs
     * const errorLogs = await prisma.errorLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const errorLogWithIdOnly = await prisma.errorLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ErrorLogFindManyArgs>(args?: SelectSubset<T, ErrorLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ErrorLog.
     * @param {ErrorLogCreateArgs} args - Arguments to create a ErrorLog.
     * @example
     * // Create one ErrorLog
     * const ErrorLog = await prisma.errorLog.create({
     *   data: {
     *     // ... data to create a ErrorLog
     *   }
     * })
     * 
     */
    create<T extends ErrorLogCreateArgs>(args: SelectSubset<T, ErrorLogCreateArgs<ExtArgs>>): Prisma__ErrorLogClient<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ErrorLogs.
     * @param {ErrorLogCreateManyArgs} args - Arguments to create many ErrorLogs.
     * @example
     * // Create many ErrorLogs
     * const errorLog = await prisma.errorLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ErrorLogCreateManyArgs>(args?: SelectSubset<T, ErrorLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ErrorLogs and returns the data saved in the database.
     * @param {ErrorLogCreateManyAndReturnArgs} args - Arguments to create many ErrorLogs.
     * @example
     * // Create many ErrorLogs
     * const errorLog = await prisma.errorLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ErrorLogs and only return the `id`
     * const errorLogWithIdOnly = await prisma.errorLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ErrorLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ErrorLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ErrorLog.
     * @param {ErrorLogDeleteArgs} args - Arguments to delete one ErrorLog.
     * @example
     * // Delete one ErrorLog
     * const ErrorLog = await prisma.errorLog.delete({
     *   where: {
     *     // ... filter to delete one ErrorLog
     *   }
     * })
     * 
     */
    delete<T extends ErrorLogDeleteArgs>(args: SelectSubset<T, ErrorLogDeleteArgs<ExtArgs>>): Prisma__ErrorLogClient<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ErrorLog.
     * @param {ErrorLogUpdateArgs} args - Arguments to update one ErrorLog.
     * @example
     * // Update one ErrorLog
     * const errorLog = await prisma.errorLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ErrorLogUpdateArgs>(args: SelectSubset<T, ErrorLogUpdateArgs<ExtArgs>>): Prisma__ErrorLogClient<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ErrorLogs.
     * @param {ErrorLogDeleteManyArgs} args - Arguments to filter ErrorLogs to delete.
     * @example
     * // Delete a few ErrorLogs
     * const { count } = await prisma.errorLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ErrorLogDeleteManyArgs>(args?: SelectSubset<T, ErrorLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ErrorLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ErrorLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ErrorLogs
     * const errorLog = await prisma.errorLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ErrorLogUpdateManyArgs>(args: SelectSubset<T, ErrorLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ErrorLog.
     * @param {ErrorLogUpsertArgs} args - Arguments to update or create a ErrorLog.
     * @example
     * // Update or create a ErrorLog
     * const errorLog = await prisma.errorLog.upsert({
     *   create: {
     *     // ... data to create a ErrorLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ErrorLog we want to update
     *   }
     * })
     */
    upsert<T extends ErrorLogUpsertArgs>(args: SelectSubset<T, ErrorLogUpsertArgs<ExtArgs>>): Prisma__ErrorLogClient<$Result.GetResult<Prisma.$ErrorLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ErrorLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ErrorLogCountArgs} args - Arguments to filter ErrorLogs to count.
     * @example
     * // Count the number of ErrorLogs
     * const count = await prisma.errorLog.count({
     *   where: {
     *     // ... the filter for the ErrorLogs we want to count
     *   }
     * })
    **/
    count<T extends ErrorLogCountArgs>(
      args?: Subset<T, ErrorLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ErrorLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ErrorLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ErrorLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ErrorLogAggregateArgs>(args: Subset<T, ErrorLogAggregateArgs>): Prisma.PrismaPromise<GetErrorLogAggregateType<T>>

    /**
     * Group by ErrorLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ErrorLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ErrorLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ErrorLogGroupByArgs['orderBy'] }
        : { orderBy?: ErrorLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ErrorLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetErrorLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ErrorLog model
   */
  readonly fields: ErrorLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ErrorLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ErrorLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ErrorLog model
   */ 
  interface ErrorLogFieldRefs {
    readonly id: FieldRef<"ErrorLog", 'String'>
    readonly on_page: FieldRef<"ErrorLog", 'String'>
    readonly context: FieldRef<"ErrorLog", 'String'>
    readonly created_on: FieldRef<"ErrorLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ErrorLog findUnique
   */
  export type ErrorLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
    /**
     * Filter, which ErrorLog to fetch.
     */
    where: ErrorLogWhereUniqueInput
  }

  /**
   * ErrorLog findUniqueOrThrow
   */
  export type ErrorLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
    /**
     * Filter, which ErrorLog to fetch.
     */
    where: ErrorLogWhereUniqueInput
  }

  /**
   * ErrorLog findFirst
   */
  export type ErrorLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
    /**
     * Filter, which ErrorLog to fetch.
     */
    where?: ErrorLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ErrorLogs to fetch.
     */
    orderBy?: ErrorLogOrderByWithRelationInput | ErrorLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ErrorLogs.
     */
    cursor?: ErrorLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ErrorLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ErrorLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ErrorLogs.
     */
    distinct?: ErrorLogScalarFieldEnum | ErrorLogScalarFieldEnum[]
  }

  /**
   * ErrorLog findFirstOrThrow
   */
  export type ErrorLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
    /**
     * Filter, which ErrorLog to fetch.
     */
    where?: ErrorLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ErrorLogs to fetch.
     */
    orderBy?: ErrorLogOrderByWithRelationInput | ErrorLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ErrorLogs.
     */
    cursor?: ErrorLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ErrorLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ErrorLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ErrorLogs.
     */
    distinct?: ErrorLogScalarFieldEnum | ErrorLogScalarFieldEnum[]
  }

  /**
   * ErrorLog findMany
   */
  export type ErrorLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
    /**
     * Filter, which ErrorLogs to fetch.
     */
    where?: ErrorLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ErrorLogs to fetch.
     */
    orderBy?: ErrorLogOrderByWithRelationInput | ErrorLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ErrorLogs.
     */
    cursor?: ErrorLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ErrorLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ErrorLogs.
     */
    skip?: number
    distinct?: ErrorLogScalarFieldEnum | ErrorLogScalarFieldEnum[]
  }

  /**
   * ErrorLog create
   */
  export type ErrorLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
    /**
     * The data needed to create a ErrorLog.
     */
    data: XOR<ErrorLogCreateInput, ErrorLogUncheckedCreateInput>
  }

  /**
   * ErrorLog createMany
   */
  export type ErrorLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ErrorLogs.
     */
    data: ErrorLogCreateManyInput | ErrorLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ErrorLog createManyAndReturn
   */
  export type ErrorLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ErrorLogs.
     */
    data: ErrorLogCreateManyInput | ErrorLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ErrorLog update
   */
  export type ErrorLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
    /**
     * The data needed to update a ErrorLog.
     */
    data: XOR<ErrorLogUpdateInput, ErrorLogUncheckedUpdateInput>
    /**
     * Choose, which ErrorLog to update.
     */
    where: ErrorLogWhereUniqueInput
  }

  /**
   * ErrorLog updateMany
   */
  export type ErrorLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ErrorLogs.
     */
    data: XOR<ErrorLogUpdateManyMutationInput, ErrorLogUncheckedUpdateManyInput>
    /**
     * Filter which ErrorLogs to update
     */
    where?: ErrorLogWhereInput
  }

  /**
   * ErrorLog upsert
   */
  export type ErrorLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
    /**
     * The filter to search for the ErrorLog to update in case it exists.
     */
    where: ErrorLogWhereUniqueInput
    /**
     * In case the ErrorLog found by the `where` argument doesn't exist, create a new ErrorLog with this data.
     */
    create: XOR<ErrorLogCreateInput, ErrorLogUncheckedCreateInput>
    /**
     * In case the ErrorLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ErrorLogUpdateInput, ErrorLogUncheckedUpdateInput>
  }

  /**
   * ErrorLog delete
   */
  export type ErrorLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
    /**
     * Filter which ErrorLog to delete.
     */
    where: ErrorLogWhereUniqueInput
  }

  /**
   * ErrorLog deleteMany
   */
  export type ErrorLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ErrorLogs to delete
     */
    where?: ErrorLogWhereInput
  }

  /**
   * ErrorLog without action
   */
  export type ErrorLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ErrorLog
     */
    select?: ErrorLogSelect<ExtArgs> | null
  }


  /**
   * Model SystemError
   */

  export type AggregateSystemError = {
    _count: SystemErrorCountAggregateOutputType | null
    _min: SystemErrorMinAggregateOutputType | null
    _max: SystemErrorMaxAggregateOutputType | null
  }

  export type SystemErrorMinAggregateOutputType = {
    id: string | null
    on_account: string | null
    type: string | null
    log: string | null
    logged_on: Date | null
  }

  export type SystemErrorMaxAggregateOutputType = {
    id: string | null
    on_account: string | null
    type: string | null
    log: string | null
    logged_on: Date | null
  }

  export type SystemErrorCountAggregateOutputType = {
    id: number
    on_account: number
    type: number
    log: number
    details: number
    logged_on: number
    _all: number
  }


  export type SystemErrorMinAggregateInputType = {
    id?: true
    on_account?: true
    type?: true
    log?: true
    logged_on?: true
  }

  export type SystemErrorMaxAggregateInputType = {
    id?: true
    on_account?: true
    type?: true
    log?: true
    logged_on?: true
  }

  export type SystemErrorCountAggregateInputType = {
    id?: true
    on_account?: true
    type?: true
    log?: true
    details?: true
    logged_on?: true
    _all?: true
  }

  export type SystemErrorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemError to aggregate.
     */
    where?: SystemErrorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemErrors to fetch.
     */
    orderBy?: SystemErrorOrderByWithRelationInput | SystemErrorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemErrorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemErrors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemErrors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemErrors
    **/
    _count?: true | SystemErrorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemErrorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemErrorMaxAggregateInputType
  }

  export type GetSystemErrorAggregateType<T extends SystemErrorAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemError]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemError[P]>
      : GetScalarType<T[P], AggregateSystemError[P]>
  }




  export type SystemErrorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemErrorWhereInput
    orderBy?: SystemErrorOrderByWithAggregationInput | SystemErrorOrderByWithAggregationInput[]
    by: SystemErrorScalarFieldEnum[] | SystemErrorScalarFieldEnum
    having?: SystemErrorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemErrorCountAggregateInputType | true
    _min?: SystemErrorMinAggregateInputType
    _max?: SystemErrorMaxAggregateInputType
  }

  export type SystemErrorGroupByOutputType = {
    id: string
    on_account: string | null
    type: string
    log: string
    details: JsonValue
    logged_on: Date
    _count: SystemErrorCountAggregateOutputType | null
    _min: SystemErrorMinAggregateOutputType | null
    _max: SystemErrorMaxAggregateOutputType | null
  }

  type GetSystemErrorGroupByPayload<T extends SystemErrorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemErrorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemErrorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemErrorGroupByOutputType[P]>
            : GetScalarType<T[P], SystemErrorGroupByOutputType[P]>
        }
      >
    >


  export type SystemErrorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    on_account?: boolean
    type?: boolean
    log?: boolean
    details?: boolean
    logged_on?: boolean
  }, ExtArgs["result"]["systemError"]>

  export type SystemErrorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    on_account?: boolean
    type?: boolean
    log?: boolean
    details?: boolean
    logged_on?: boolean
  }, ExtArgs["result"]["systemError"]>

  export type SystemErrorSelectScalar = {
    id?: boolean
    on_account?: boolean
    type?: boolean
    log?: boolean
    details?: boolean
    logged_on?: boolean
  }


  export type $SystemErrorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemError"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      on_account: string | null
      type: string
      log: string
      details: Prisma.JsonValue
      logged_on: Date
    }, ExtArgs["result"]["systemError"]>
    composites: {}
  }

  type SystemErrorGetPayload<S extends boolean | null | undefined | SystemErrorDefaultArgs> = $Result.GetResult<Prisma.$SystemErrorPayload, S>

  type SystemErrorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SystemErrorFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SystemErrorCountAggregateInputType | true
    }

  export interface SystemErrorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemError'], meta: { name: 'SystemError' } }
    /**
     * Find zero or one SystemError that matches the filter.
     * @param {SystemErrorFindUniqueArgs} args - Arguments to find a SystemError
     * @example
     * // Get one SystemError
     * const systemError = await prisma.systemError.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemErrorFindUniqueArgs>(args: SelectSubset<T, SystemErrorFindUniqueArgs<ExtArgs>>): Prisma__SystemErrorClient<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SystemError that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SystemErrorFindUniqueOrThrowArgs} args - Arguments to find a SystemError
     * @example
     * // Get one SystemError
     * const systemError = await prisma.systemError.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemErrorFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemErrorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemErrorClient<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SystemError that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemErrorFindFirstArgs} args - Arguments to find a SystemError
     * @example
     * // Get one SystemError
     * const systemError = await prisma.systemError.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemErrorFindFirstArgs>(args?: SelectSubset<T, SystemErrorFindFirstArgs<ExtArgs>>): Prisma__SystemErrorClient<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SystemError that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemErrorFindFirstOrThrowArgs} args - Arguments to find a SystemError
     * @example
     * // Get one SystemError
     * const systemError = await prisma.systemError.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemErrorFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemErrorFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemErrorClient<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SystemErrors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemErrorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemErrors
     * const systemErrors = await prisma.systemError.findMany()
     * 
     * // Get first 10 SystemErrors
     * const systemErrors = await prisma.systemError.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const systemErrorWithIdOnly = await prisma.systemError.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SystemErrorFindManyArgs>(args?: SelectSubset<T, SystemErrorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SystemError.
     * @param {SystemErrorCreateArgs} args - Arguments to create a SystemError.
     * @example
     * // Create one SystemError
     * const SystemError = await prisma.systemError.create({
     *   data: {
     *     // ... data to create a SystemError
     *   }
     * })
     * 
     */
    create<T extends SystemErrorCreateArgs>(args: SelectSubset<T, SystemErrorCreateArgs<ExtArgs>>): Prisma__SystemErrorClient<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SystemErrors.
     * @param {SystemErrorCreateManyArgs} args - Arguments to create many SystemErrors.
     * @example
     * // Create many SystemErrors
     * const systemError = await prisma.systemError.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemErrorCreateManyArgs>(args?: SelectSubset<T, SystemErrorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SystemErrors and returns the data saved in the database.
     * @param {SystemErrorCreateManyAndReturnArgs} args - Arguments to create many SystemErrors.
     * @example
     * // Create many SystemErrors
     * const systemError = await prisma.systemError.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SystemErrors and only return the `id`
     * const systemErrorWithIdOnly = await prisma.systemError.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SystemErrorCreateManyAndReturnArgs>(args?: SelectSubset<T, SystemErrorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SystemError.
     * @param {SystemErrorDeleteArgs} args - Arguments to delete one SystemError.
     * @example
     * // Delete one SystemError
     * const SystemError = await prisma.systemError.delete({
     *   where: {
     *     // ... filter to delete one SystemError
     *   }
     * })
     * 
     */
    delete<T extends SystemErrorDeleteArgs>(args: SelectSubset<T, SystemErrorDeleteArgs<ExtArgs>>): Prisma__SystemErrorClient<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SystemError.
     * @param {SystemErrorUpdateArgs} args - Arguments to update one SystemError.
     * @example
     * // Update one SystemError
     * const systemError = await prisma.systemError.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemErrorUpdateArgs>(args: SelectSubset<T, SystemErrorUpdateArgs<ExtArgs>>): Prisma__SystemErrorClient<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SystemErrors.
     * @param {SystemErrorDeleteManyArgs} args - Arguments to filter SystemErrors to delete.
     * @example
     * // Delete a few SystemErrors
     * const { count } = await prisma.systemError.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemErrorDeleteManyArgs>(args?: SelectSubset<T, SystemErrorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemErrors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemErrorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemErrors
     * const systemError = await prisma.systemError.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemErrorUpdateManyArgs>(args: SelectSubset<T, SystemErrorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SystemError.
     * @param {SystemErrorUpsertArgs} args - Arguments to update or create a SystemError.
     * @example
     * // Update or create a SystemError
     * const systemError = await prisma.systemError.upsert({
     *   create: {
     *     // ... data to create a SystemError
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemError we want to update
     *   }
     * })
     */
    upsert<T extends SystemErrorUpsertArgs>(args: SelectSubset<T, SystemErrorUpsertArgs<ExtArgs>>): Prisma__SystemErrorClient<$Result.GetResult<Prisma.$SystemErrorPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SystemErrors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemErrorCountArgs} args - Arguments to filter SystemErrors to count.
     * @example
     * // Count the number of SystemErrors
     * const count = await prisma.systemError.count({
     *   where: {
     *     // ... the filter for the SystemErrors we want to count
     *   }
     * })
    **/
    count<T extends SystemErrorCountArgs>(
      args?: Subset<T, SystemErrorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemErrorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemError.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemErrorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SystemErrorAggregateArgs>(args: Subset<T, SystemErrorAggregateArgs>): Prisma.PrismaPromise<GetSystemErrorAggregateType<T>>

    /**
     * Group by SystemError.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemErrorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SystemErrorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemErrorGroupByArgs['orderBy'] }
        : { orderBy?: SystemErrorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SystemErrorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemErrorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemError model
   */
  readonly fields: SystemErrorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemError.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemErrorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SystemError model
   */ 
  interface SystemErrorFieldRefs {
    readonly id: FieldRef<"SystemError", 'String'>
    readonly on_account: FieldRef<"SystemError", 'String'>
    readonly type: FieldRef<"SystemError", 'String'>
    readonly log: FieldRef<"SystemError", 'String'>
    readonly details: FieldRef<"SystemError", 'Json'>
    readonly logged_on: FieldRef<"SystemError", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SystemError findUnique
   */
  export type SystemErrorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
    /**
     * Filter, which SystemError to fetch.
     */
    where: SystemErrorWhereUniqueInput
  }

  /**
   * SystemError findUniqueOrThrow
   */
  export type SystemErrorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
    /**
     * Filter, which SystemError to fetch.
     */
    where: SystemErrorWhereUniqueInput
  }

  /**
   * SystemError findFirst
   */
  export type SystemErrorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
    /**
     * Filter, which SystemError to fetch.
     */
    where?: SystemErrorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemErrors to fetch.
     */
    orderBy?: SystemErrorOrderByWithRelationInput | SystemErrorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemErrors.
     */
    cursor?: SystemErrorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemErrors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemErrors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemErrors.
     */
    distinct?: SystemErrorScalarFieldEnum | SystemErrorScalarFieldEnum[]
  }

  /**
   * SystemError findFirstOrThrow
   */
  export type SystemErrorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
    /**
     * Filter, which SystemError to fetch.
     */
    where?: SystemErrorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemErrors to fetch.
     */
    orderBy?: SystemErrorOrderByWithRelationInput | SystemErrorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemErrors.
     */
    cursor?: SystemErrorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemErrors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemErrors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemErrors.
     */
    distinct?: SystemErrorScalarFieldEnum | SystemErrorScalarFieldEnum[]
  }

  /**
   * SystemError findMany
   */
  export type SystemErrorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
    /**
     * Filter, which SystemErrors to fetch.
     */
    where?: SystemErrorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemErrors to fetch.
     */
    orderBy?: SystemErrorOrderByWithRelationInput | SystemErrorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemErrors.
     */
    cursor?: SystemErrorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemErrors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemErrors.
     */
    skip?: number
    distinct?: SystemErrorScalarFieldEnum | SystemErrorScalarFieldEnum[]
  }

  /**
   * SystemError create
   */
  export type SystemErrorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
    /**
     * The data needed to create a SystemError.
     */
    data: XOR<SystemErrorCreateInput, SystemErrorUncheckedCreateInput>
  }

  /**
   * SystemError createMany
   */
  export type SystemErrorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemErrors.
     */
    data: SystemErrorCreateManyInput | SystemErrorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemError createManyAndReturn
   */
  export type SystemErrorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SystemErrors.
     */
    data: SystemErrorCreateManyInput | SystemErrorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemError update
   */
  export type SystemErrorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
    /**
     * The data needed to update a SystemError.
     */
    data: XOR<SystemErrorUpdateInput, SystemErrorUncheckedUpdateInput>
    /**
     * Choose, which SystemError to update.
     */
    where: SystemErrorWhereUniqueInput
  }

  /**
   * SystemError updateMany
   */
  export type SystemErrorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemErrors.
     */
    data: XOR<SystemErrorUpdateManyMutationInput, SystemErrorUncheckedUpdateManyInput>
    /**
     * Filter which SystemErrors to update
     */
    where?: SystemErrorWhereInput
  }

  /**
   * SystemError upsert
   */
  export type SystemErrorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
    /**
     * The filter to search for the SystemError to update in case it exists.
     */
    where: SystemErrorWhereUniqueInput
    /**
     * In case the SystemError found by the `where` argument doesn't exist, create a new SystemError with this data.
     */
    create: XOR<SystemErrorCreateInput, SystemErrorUncheckedCreateInput>
    /**
     * In case the SystemError was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemErrorUpdateInput, SystemErrorUncheckedUpdateInput>
  }

  /**
   * SystemError delete
   */
  export type SystemErrorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
    /**
     * Filter which SystemError to delete.
     */
    where: SystemErrorWhereUniqueInput
  }

  /**
   * SystemError deleteMany
   */
  export type SystemErrorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemErrors to delete
     */
    where?: SystemErrorWhereInput
  }

  /**
   * SystemError without action
   */
  export type SystemErrorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemError
     */
    select?: SystemErrorSelect<ExtArgs> | null
  }


  /**
   * Model WebDisk
   */

  export type AggregateWebDisk = {
    _count: WebDiskCountAggregateOutputType | null
    _min: WebDiskMinAggregateOutputType | null
    _max: WebDiskMaxAggregateOutputType | null
  }

  export type WebDiskMinAggregateOutputType = {
    id: string | null
    filename: string | null
    path: string | null
    mimeType: string | null
    uploaded_by: string | null
    uploaded_on: Date | null
  }

  export type WebDiskMaxAggregateOutputType = {
    id: string | null
    filename: string | null
    path: string | null
    mimeType: string | null
    uploaded_by: string | null
    uploaded_on: Date | null
  }

  export type WebDiskCountAggregateOutputType = {
    id: number
    filename: number
    path: number
    mimeType: number
    uploaded_by: number
    uploaded_on: number
    _all: number
  }


  export type WebDiskMinAggregateInputType = {
    id?: true
    filename?: true
    path?: true
    mimeType?: true
    uploaded_by?: true
    uploaded_on?: true
  }

  export type WebDiskMaxAggregateInputType = {
    id?: true
    filename?: true
    path?: true
    mimeType?: true
    uploaded_by?: true
    uploaded_on?: true
  }

  export type WebDiskCountAggregateInputType = {
    id?: true
    filename?: true
    path?: true
    mimeType?: true
    uploaded_by?: true
    uploaded_on?: true
    _all?: true
  }

  export type WebDiskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WebDisk to aggregate.
     */
    where?: WebDiskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebDisks to fetch.
     */
    orderBy?: WebDiskOrderByWithRelationInput | WebDiskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WebDiskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebDisks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebDisks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WebDisks
    **/
    _count?: true | WebDiskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WebDiskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WebDiskMaxAggregateInputType
  }

  export type GetWebDiskAggregateType<T extends WebDiskAggregateArgs> = {
        [P in keyof T & keyof AggregateWebDisk]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWebDisk[P]>
      : GetScalarType<T[P], AggregateWebDisk[P]>
  }




  export type WebDiskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WebDiskWhereInput
    orderBy?: WebDiskOrderByWithAggregationInput | WebDiskOrderByWithAggregationInput[]
    by: WebDiskScalarFieldEnum[] | WebDiskScalarFieldEnum
    having?: WebDiskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WebDiskCountAggregateInputType | true
    _min?: WebDiskMinAggregateInputType
    _max?: WebDiskMaxAggregateInputType
  }

  export type WebDiskGroupByOutputType = {
    id: string
    filename: string
    path: string
    mimeType: string
    uploaded_by: string
    uploaded_on: Date
    _count: WebDiskCountAggregateOutputType | null
    _min: WebDiskMinAggregateOutputType | null
    _max: WebDiskMaxAggregateOutputType | null
  }

  type GetWebDiskGroupByPayload<T extends WebDiskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WebDiskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WebDiskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WebDiskGroupByOutputType[P]>
            : GetScalarType<T[P], WebDiskGroupByOutputType[P]>
        }
      >
    >


  export type WebDiskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    path?: boolean
    mimeType?: boolean
    uploaded_by?: boolean
    uploaded_on?: boolean
  }, ExtArgs["result"]["webDisk"]>

  export type WebDiskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    path?: boolean
    mimeType?: boolean
    uploaded_by?: boolean
    uploaded_on?: boolean
  }, ExtArgs["result"]["webDisk"]>

  export type WebDiskSelectScalar = {
    id?: boolean
    filename?: boolean
    path?: boolean
    mimeType?: boolean
    uploaded_by?: boolean
    uploaded_on?: boolean
  }


  export type $WebDiskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WebDisk"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      filename: string
      path: string
      mimeType: string
      uploaded_by: string
      uploaded_on: Date
    }, ExtArgs["result"]["webDisk"]>
    composites: {}
  }

  type WebDiskGetPayload<S extends boolean | null | undefined | WebDiskDefaultArgs> = $Result.GetResult<Prisma.$WebDiskPayload, S>

  type WebDiskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WebDiskFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WebDiskCountAggregateInputType | true
    }

  export interface WebDiskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WebDisk'], meta: { name: 'WebDisk' } }
    /**
     * Find zero or one WebDisk that matches the filter.
     * @param {WebDiskFindUniqueArgs} args - Arguments to find a WebDisk
     * @example
     * // Get one WebDisk
     * const webDisk = await prisma.webDisk.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WebDiskFindUniqueArgs>(args: SelectSubset<T, WebDiskFindUniqueArgs<ExtArgs>>): Prisma__WebDiskClient<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one WebDisk that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WebDiskFindUniqueOrThrowArgs} args - Arguments to find a WebDisk
     * @example
     * // Get one WebDisk
     * const webDisk = await prisma.webDisk.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WebDiskFindUniqueOrThrowArgs>(args: SelectSubset<T, WebDiskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WebDiskClient<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first WebDisk that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebDiskFindFirstArgs} args - Arguments to find a WebDisk
     * @example
     * // Get one WebDisk
     * const webDisk = await prisma.webDisk.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WebDiskFindFirstArgs>(args?: SelectSubset<T, WebDiskFindFirstArgs<ExtArgs>>): Prisma__WebDiskClient<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first WebDisk that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebDiskFindFirstOrThrowArgs} args - Arguments to find a WebDisk
     * @example
     * // Get one WebDisk
     * const webDisk = await prisma.webDisk.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WebDiskFindFirstOrThrowArgs>(args?: SelectSubset<T, WebDiskFindFirstOrThrowArgs<ExtArgs>>): Prisma__WebDiskClient<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more WebDisks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebDiskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WebDisks
     * const webDisks = await prisma.webDisk.findMany()
     * 
     * // Get first 10 WebDisks
     * const webDisks = await prisma.webDisk.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const webDiskWithIdOnly = await prisma.webDisk.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WebDiskFindManyArgs>(args?: SelectSubset<T, WebDiskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a WebDisk.
     * @param {WebDiskCreateArgs} args - Arguments to create a WebDisk.
     * @example
     * // Create one WebDisk
     * const WebDisk = await prisma.webDisk.create({
     *   data: {
     *     // ... data to create a WebDisk
     *   }
     * })
     * 
     */
    create<T extends WebDiskCreateArgs>(args: SelectSubset<T, WebDiskCreateArgs<ExtArgs>>): Prisma__WebDiskClient<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many WebDisks.
     * @param {WebDiskCreateManyArgs} args - Arguments to create many WebDisks.
     * @example
     * // Create many WebDisks
     * const webDisk = await prisma.webDisk.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WebDiskCreateManyArgs>(args?: SelectSubset<T, WebDiskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WebDisks and returns the data saved in the database.
     * @param {WebDiskCreateManyAndReturnArgs} args - Arguments to create many WebDisks.
     * @example
     * // Create many WebDisks
     * const webDisk = await prisma.webDisk.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WebDisks and only return the `id`
     * const webDiskWithIdOnly = await prisma.webDisk.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WebDiskCreateManyAndReturnArgs>(args?: SelectSubset<T, WebDiskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a WebDisk.
     * @param {WebDiskDeleteArgs} args - Arguments to delete one WebDisk.
     * @example
     * // Delete one WebDisk
     * const WebDisk = await prisma.webDisk.delete({
     *   where: {
     *     // ... filter to delete one WebDisk
     *   }
     * })
     * 
     */
    delete<T extends WebDiskDeleteArgs>(args: SelectSubset<T, WebDiskDeleteArgs<ExtArgs>>): Prisma__WebDiskClient<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one WebDisk.
     * @param {WebDiskUpdateArgs} args - Arguments to update one WebDisk.
     * @example
     * // Update one WebDisk
     * const webDisk = await prisma.webDisk.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WebDiskUpdateArgs>(args: SelectSubset<T, WebDiskUpdateArgs<ExtArgs>>): Prisma__WebDiskClient<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more WebDisks.
     * @param {WebDiskDeleteManyArgs} args - Arguments to filter WebDisks to delete.
     * @example
     * // Delete a few WebDisks
     * const { count } = await prisma.webDisk.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WebDiskDeleteManyArgs>(args?: SelectSubset<T, WebDiskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WebDisks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebDiskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WebDisks
     * const webDisk = await prisma.webDisk.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WebDiskUpdateManyArgs>(args: SelectSubset<T, WebDiskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WebDisk.
     * @param {WebDiskUpsertArgs} args - Arguments to update or create a WebDisk.
     * @example
     * // Update or create a WebDisk
     * const webDisk = await prisma.webDisk.upsert({
     *   create: {
     *     // ... data to create a WebDisk
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WebDisk we want to update
     *   }
     * })
     */
    upsert<T extends WebDiskUpsertArgs>(args: SelectSubset<T, WebDiskUpsertArgs<ExtArgs>>): Prisma__WebDiskClient<$Result.GetResult<Prisma.$WebDiskPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of WebDisks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebDiskCountArgs} args - Arguments to filter WebDisks to count.
     * @example
     * // Count the number of WebDisks
     * const count = await prisma.webDisk.count({
     *   where: {
     *     // ... the filter for the WebDisks we want to count
     *   }
     * })
    **/
    count<T extends WebDiskCountArgs>(
      args?: Subset<T, WebDiskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WebDiskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WebDisk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebDiskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WebDiskAggregateArgs>(args: Subset<T, WebDiskAggregateArgs>): Prisma.PrismaPromise<GetWebDiskAggregateType<T>>

    /**
     * Group by WebDisk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebDiskGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WebDiskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WebDiskGroupByArgs['orderBy'] }
        : { orderBy?: WebDiskGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WebDiskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWebDiskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WebDisk model
   */
  readonly fields: WebDiskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WebDisk.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WebDiskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WebDisk model
   */ 
  interface WebDiskFieldRefs {
    readonly id: FieldRef<"WebDisk", 'String'>
    readonly filename: FieldRef<"WebDisk", 'String'>
    readonly path: FieldRef<"WebDisk", 'String'>
    readonly mimeType: FieldRef<"WebDisk", 'String'>
    readonly uploaded_by: FieldRef<"WebDisk", 'String'>
    readonly uploaded_on: FieldRef<"WebDisk", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WebDisk findUnique
   */
  export type WebDiskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
    /**
     * Filter, which WebDisk to fetch.
     */
    where: WebDiskWhereUniqueInput
  }

  /**
   * WebDisk findUniqueOrThrow
   */
  export type WebDiskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
    /**
     * Filter, which WebDisk to fetch.
     */
    where: WebDiskWhereUniqueInput
  }

  /**
   * WebDisk findFirst
   */
  export type WebDiskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
    /**
     * Filter, which WebDisk to fetch.
     */
    where?: WebDiskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebDisks to fetch.
     */
    orderBy?: WebDiskOrderByWithRelationInput | WebDiskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WebDisks.
     */
    cursor?: WebDiskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebDisks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebDisks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WebDisks.
     */
    distinct?: WebDiskScalarFieldEnum | WebDiskScalarFieldEnum[]
  }

  /**
   * WebDisk findFirstOrThrow
   */
  export type WebDiskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
    /**
     * Filter, which WebDisk to fetch.
     */
    where?: WebDiskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebDisks to fetch.
     */
    orderBy?: WebDiskOrderByWithRelationInput | WebDiskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WebDisks.
     */
    cursor?: WebDiskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebDisks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebDisks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WebDisks.
     */
    distinct?: WebDiskScalarFieldEnum | WebDiskScalarFieldEnum[]
  }

  /**
   * WebDisk findMany
   */
  export type WebDiskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
    /**
     * Filter, which WebDisks to fetch.
     */
    where?: WebDiskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebDisks to fetch.
     */
    orderBy?: WebDiskOrderByWithRelationInput | WebDiskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WebDisks.
     */
    cursor?: WebDiskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebDisks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebDisks.
     */
    skip?: number
    distinct?: WebDiskScalarFieldEnum | WebDiskScalarFieldEnum[]
  }

  /**
   * WebDisk create
   */
  export type WebDiskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
    /**
     * The data needed to create a WebDisk.
     */
    data: XOR<WebDiskCreateInput, WebDiskUncheckedCreateInput>
  }

  /**
   * WebDisk createMany
   */
  export type WebDiskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WebDisks.
     */
    data: WebDiskCreateManyInput | WebDiskCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WebDisk createManyAndReturn
   */
  export type WebDiskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many WebDisks.
     */
    data: WebDiskCreateManyInput | WebDiskCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WebDisk update
   */
  export type WebDiskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
    /**
     * The data needed to update a WebDisk.
     */
    data: XOR<WebDiskUpdateInput, WebDiskUncheckedUpdateInput>
    /**
     * Choose, which WebDisk to update.
     */
    where: WebDiskWhereUniqueInput
  }

  /**
   * WebDisk updateMany
   */
  export type WebDiskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WebDisks.
     */
    data: XOR<WebDiskUpdateManyMutationInput, WebDiskUncheckedUpdateManyInput>
    /**
     * Filter which WebDisks to update
     */
    where?: WebDiskWhereInput
  }

  /**
   * WebDisk upsert
   */
  export type WebDiskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
    /**
     * The filter to search for the WebDisk to update in case it exists.
     */
    where: WebDiskWhereUniqueInput
    /**
     * In case the WebDisk found by the `where` argument doesn't exist, create a new WebDisk with this data.
     */
    create: XOR<WebDiskCreateInput, WebDiskUncheckedCreateInput>
    /**
     * In case the WebDisk was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WebDiskUpdateInput, WebDiskUncheckedUpdateInput>
  }

  /**
   * WebDisk delete
   */
  export type WebDiskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
    /**
     * Filter which WebDisk to delete.
     */
    where: WebDiskWhereUniqueInput
  }

  /**
   * WebDisk deleteMany
   */
  export type WebDiskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WebDisks to delete
     */
    where?: WebDiskWhereInput
  }

  /**
   * WebDisk without action
   */
  export type WebDiskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebDisk
     */
    select?: WebDiskSelect<ExtArgs> | null
  }


  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountMinAggregateOutputType = {
    id: string | null
    account_type: string | null
    connection_id: string | null
    display_name: string | null
    display_image: string | null
    neupid: string | null
    created_on: Date | null
    accessed_on: Date | null
  }

  export type AccountMaxAggregateOutputType = {
    id: string | null
    account_type: string | null
    connection_id: string | null
    display_name: string | null
    display_image: string | null
    neupid: string | null
    created_on: Date | null
    accessed_on: Date | null
  }

  export type AccountCountAggregateOutputType = {
    id: number
    account_type: number
    connection_id: number
    display_name: number
    display_image: number
    neupid: number
    created_on: number
    accessed_on: number
    _all: number
  }


  export type AccountMinAggregateInputType = {
    id?: true
    account_type?: true
    connection_id?: true
    display_name?: true
    display_image?: true
    neupid?: true
    created_on?: true
    accessed_on?: true
  }

  export type AccountMaxAggregateInputType = {
    id?: true
    account_type?: true
    connection_id?: true
    display_name?: true
    display_image?: true
    neupid?: true
    created_on?: true
    accessed_on?: true
  }

  export type AccountCountAggregateInputType = {
    id?: true
    account_type?: true
    connection_id?: true
    display_name?: true
    display_image?: true
    neupid?: true
    created_on?: true
    accessed_on?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    id: string
    account_type: string
    connection_id: string | null
    display_name: string | null
    display_image: string | null
    neupid: string | null
    created_on: Date
    accessed_on: Date | null
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    account_type?: boolean
    connection_id?: boolean
    display_name?: boolean
    display_image?: boolean
    neupid?: boolean
    created_on?: boolean
    accessed_on?: boolean
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    account_type?: boolean
    connection_id?: boolean
    display_name?: boolean
    display_image?: boolean
    neupid?: boolean
    created_on?: boolean
    accessed_on?: boolean
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    id?: boolean
    account_type?: boolean
    connection_id?: boolean
    display_name?: boolean
    display_image?: boolean
    neupid?: boolean
    created_on?: boolean
    accessed_on?: boolean
  }


  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      account_type: string
      connection_id: string | null
      display_name: string | null
      display_image: string | null
      neupid: string | null
      created_on: Date
      accessed_on: Date | null
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */ 
  interface AccountFieldRefs {
    readonly id: FieldRef<"Account", 'String'>
    readonly account_type: FieldRef<"Account", 'String'>
    readonly connection_id: FieldRef<"Account", 'String'>
    readonly display_name: FieldRef<"Account", 'String'>
    readonly display_image: FieldRef<"Account", 'String'>
    readonly neupid: FieldRef<"Account", 'String'>
    readonly created_on: FieldRef<"Account", 'DateTime'>
    readonly accessed_on: FieldRef<"Account", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const FileFolderScalarFieldEnum: {
    id: 'id',
    name: 'name',
    path: 'path',
    type: 'type',
    owner: 'owner',
    stored_as: 'stored_as',
    size: 'size',
    last_activity: 'last_activity',
    lastActivityOn: 'lastActivityOn',
    totalActivity: 'totalActivity',
    details: 'details',
    created_on: 'created_on',
    updated_on: 'updated_on'
  };

  export type FileFolderScalarFieldEnum = (typeof FileFolderScalarFieldEnum)[keyof typeof FileFolderScalarFieldEnum]


  export const FileFolderLogScalarFieldEnum: {
    id: 'id',
    filefolder_id: 'filefolder_id',
    action: 'action',
    details: 'details',
    done_by: 'done_by',
    done_on: 'done_on'
  };

  export type FileFolderLogScalarFieldEnum = (typeof FileFolderLogScalarFieldEnum)[keyof typeof FileFolderLogScalarFieldEnum]


  export const ErrorLogScalarFieldEnum: {
    id: 'id',
    on_page: 'on_page',
    context: 'context',
    created_on: 'created_on'
  };

  export type ErrorLogScalarFieldEnum = (typeof ErrorLogScalarFieldEnum)[keyof typeof ErrorLogScalarFieldEnum]


  export const SystemErrorScalarFieldEnum: {
    id: 'id',
    on_account: 'on_account',
    type: 'type',
    log: 'log',
    details: 'details',
    logged_on: 'logged_on'
  };

  export type SystemErrorScalarFieldEnum = (typeof SystemErrorScalarFieldEnum)[keyof typeof SystemErrorScalarFieldEnum]


  export const WebDiskScalarFieldEnum: {
    id: 'id',
    filename: 'filename',
    path: 'path',
    mimeType: 'mimeType',
    uploaded_by: 'uploaded_by',
    uploaded_on: 'uploaded_on'
  };

  export type WebDiskScalarFieldEnum = (typeof WebDiskScalarFieldEnum)[keyof typeof WebDiskScalarFieldEnum]


  export const AccountScalarFieldEnum: {
    id: 'id',
    account_type: 'account_type',
    connection_id: 'connection_id',
    display_name: 'display_name',
    display_image: 'display_image',
    neupid: 'neupid',
    created_on: 'created_on',
    accessed_on: 'accessed_on'
  };

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type FileFolderWhereInput = {
    AND?: FileFolderWhereInput | FileFolderWhereInput[]
    OR?: FileFolderWhereInput[]
    NOT?: FileFolderWhereInput | FileFolderWhereInput[]
    id?: StringFilter<"FileFolder"> | string
    name?: StringFilter<"FileFolder"> | string
    path?: StringFilter<"FileFolder"> | string
    type?: StringFilter<"FileFolder"> | string
    owner?: StringFilter<"FileFolder"> | string
    stored_as?: StringFilter<"FileFolder"> | string
    size?: BigIntFilter<"FileFolder"> | bigint | number
    last_activity?: JsonFilter<"FileFolder">
    lastActivityOn?: DateTimeNullableFilter<"FileFolder"> | Date | string | null
    totalActivity?: IntFilter<"FileFolder"> | number
    details?: JsonFilter<"FileFolder">
    created_on?: DateTimeFilter<"FileFolder"> | Date | string
    updated_on?: DateTimeFilter<"FileFolder"> | Date | string
    logs?: FileFolderLogListRelationFilter
  }

  export type FileFolderOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    path?: SortOrder
    type?: SortOrder
    owner?: SortOrder
    stored_as?: SortOrder
    size?: SortOrder
    last_activity?: SortOrder
    lastActivityOn?: SortOrderInput | SortOrder
    totalActivity?: SortOrder
    details?: SortOrder
    created_on?: SortOrder
    updated_on?: SortOrder
    logs?: FileFolderLogOrderByRelationAggregateInput
  }

  export type FileFolderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FileFolderWhereInput | FileFolderWhereInput[]
    OR?: FileFolderWhereInput[]
    NOT?: FileFolderWhereInput | FileFolderWhereInput[]
    name?: StringFilter<"FileFolder"> | string
    path?: StringFilter<"FileFolder"> | string
    type?: StringFilter<"FileFolder"> | string
    owner?: StringFilter<"FileFolder"> | string
    stored_as?: StringFilter<"FileFolder"> | string
    size?: BigIntFilter<"FileFolder"> | bigint | number
    last_activity?: JsonFilter<"FileFolder">
    lastActivityOn?: DateTimeNullableFilter<"FileFolder"> | Date | string | null
    totalActivity?: IntFilter<"FileFolder"> | number
    details?: JsonFilter<"FileFolder">
    created_on?: DateTimeFilter<"FileFolder"> | Date | string
    updated_on?: DateTimeFilter<"FileFolder"> | Date | string
    logs?: FileFolderLogListRelationFilter
  }, "id">

  export type FileFolderOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    path?: SortOrder
    type?: SortOrder
    owner?: SortOrder
    stored_as?: SortOrder
    size?: SortOrder
    last_activity?: SortOrder
    lastActivityOn?: SortOrderInput | SortOrder
    totalActivity?: SortOrder
    details?: SortOrder
    created_on?: SortOrder
    updated_on?: SortOrder
    _count?: FileFolderCountOrderByAggregateInput
    _avg?: FileFolderAvgOrderByAggregateInput
    _max?: FileFolderMaxOrderByAggregateInput
    _min?: FileFolderMinOrderByAggregateInput
    _sum?: FileFolderSumOrderByAggregateInput
  }

  export type FileFolderScalarWhereWithAggregatesInput = {
    AND?: FileFolderScalarWhereWithAggregatesInput | FileFolderScalarWhereWithAggregatesInput[]
    OR?: FileFolderScalarWhereWithAggregatesInput[]
    NOT?: FileFolderScalarWhereWithAggregatesInput | FileFolderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FileFolder"> | string
    name?: StringWithAggregatesFilter<"FileFolder"> | string
    path?: StringWithAggregatesFilter<"FileFolder"> | string
    type?: StringWithAggregatesFilter<"FileFolder"> | string
    owner?: StringWithAggregatesFilter<"FileFolder"> | string
    stored_as?: StringWithAggregatesFilter<"FileFolder"> | string
    size?: BigIntWithAggregatesFilter<"FileFolder"> | bigint | number
    last_activity?: JsonWithAggregatesFilter<"FileFolder">
    lastActivityOn?: DateTimeNullableWithAggregatesFilter<"FileFolder"> | Date | string | null
    totalActivity?: IntWithAggregatesFilter<"FileFolder"> | number
    details?: JsonWithAggregatesFilter<"FileFolder">
    created_on?: DateTimeWithAggregatesFilter<"FileFolder"> | Date | string
    updated_on?: DateTimeWithAggregatesFilter<"FileFolder"> | Date | string
  }

  export type FileFolderLogWhereInput = {
    AND?: FileFolderLogWhereInput | FileFolderLogWhereInput[]
    OR?: FileFolderLogWhereInput[]
    NOT?: FileFolderLogWhereInput | FileFolderLogWhereInput[]
    id?: StringFilter<"FileFolderLog"> | string
    filefolder_id?: StringFilter<"FileFolderLog"> | string
    action?: StringFilter<"FileFolderLog"> | string
    details?: JsonFilter<"FileFolderLog">
    done_by?: StringFilter<"FileFolderLog"> | string
    done_on?: DateTimeFilter<"FileFolderLog"> | Date | string
    filefolder?: XOR<FileFolderRelationFilter, FileFolderWhereInput>
  }

  export type FileFolderLogOrderByWithRelationInput = {
    id?: SortOrder
    filefolder_id?: SortOrder
    action?: SortOrder
    details?: SortOrder
    done_by?: SortOrder
    done_on?: SortOrder
    filefolder?: FileFolderOrderByWithRelationInput
  }

  export type FileFolderLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FileFolderLogWhereInput | FileFolderLogWhereInput[]
    OR?: FileFolderLogWhereInput[]
    NOT?: FileFolderLogWhereInput | FileFolderLogWhereInput[]
    filefolder_id?: StringFilter<"FileFolderLog"> | string
    action?: StringFilter<"FileFolderLog"> | string
    details?: JsonFilter<"FileFolderLog">
    done_by?: StringFilter<"FileFolderLog"> | string
    done_on?: DateTimeFilter<"FileFolderLog"> | Date | string
    filefolder?: XOR<FileFolderRelationFilter, FileFolderWhereInput>
  }, "id">

  export type FileFolderLogOrderByWithAggregationInput = {
    id?: SortOrder
    filefolder_id?: SortOrder
    action?: SortOrder
    details?: SortOrder
    done_by?: SortOrder
    done_on?: SortOrder
    _count?: FileFolderLogCountOrderByAggregateInput
    _max?: FileFolderLogMaxOrderByAggregateInput
    _min?: FileFolderLogMinOrderByAggregateInput
  }

  export type FileFolderLogScalarWhereWithAggregatesInput = {
    AND?: FileFolderLogScalarWhereWithAggregatesInput | FileFolderLogScalarWhereWithAggregatesInput[]
    OR?: FileFolderLogScalarWhereWithAggregatesInput[]
    NOT?: FileFolderLogScalarWhereWithAggregatesInput | FileFolderLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FileFolderLog"> | string
    filefolder_id?: StringWithAggregatesFilter<"FileFolderLog"> | string
    action?: StringWithAggregatesFilter<"FileFolderLog"> | string
    details?: JsonWithAggregatesFilter<"FileFolderLog">
    done_by?: StringWithAggregatesFilter<"FileFolderLog"> | string
    done_on?: DateTimeWithAggregatesFilter<"FileFolderLog"> | Date | string
  }

  export type ErrorLogWhereInput = {
    AND?: ErrorLogWhereInput | ErrorLogWhereInput[]
    OR?: ErrorLogWhereInput[]
    NOT?: ErrorLogWhereInput | ErrorLogWhereInput[]
    id?: StringFilter<"ErrorLog"> | string
    on_page?: StringFilter<"ErrorLog"> | string
    context?: StringFilter<"ErrorLog"> | string
    created_on?: DateTimeFilter<"ErrorLog"> | Date | string
  }

  export type ErrorLogOrderByWithRelationInput = {
    id?: SortOrder
    on_page?: SortOrder
    context?: SortOrder
    created_on?: SortOrder
  }

  export type ErrorLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ErrorLogWhereInput | ErrorLogWhereInput[]
    OR?: ErrorLogWhereInput[]
    NOT?: ErrorLogWhereInput | ErrorLogWhereInput[]
    on_page?: StringFilter<"ErrorLog"> | string
    context?: StringFilter<"ErrorLog"> | string
    created_on?: DateTimeFilter<"ErrorLog"> | Date | string
  }, "id">

  export type ErrorLogOrderByWithAggregationInput = {
    id?: SortOrder
    on_page?: SortOrder
    context?: SortOrder
    created_on?: SortOrder
    _count?: ErrorLogCountOrderByAggregateInput
    _max?: ErrorLogMaxOrderByAggregateInput
    _min?: ErrorLogMinOrderByAggregateInput
  }

  export type ErrorLogScalarWhereWithAggregatesInput = {
    AND?: ErrorLogScalarWhereWithAggregatesInput | ErrorLogScalarWhereWithAggregatesInput[]
    OR?: ErrorLogScalarWhereWithAggregatesInput[]
    NOT?: ErrorLogScalarWhereWithAggregatesInput | ErrorLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ErrorLog"> | string
    on_page?: StringWithAggregatesFilter<"ErrorLog"> | string
    context?: StringWithAggregatesFilter<"ErrorLog"> | string
    created_on?: DateTimeWithAggregatesFilter<"ErrorLog"> | Date | string
  }

  export type SystemErrorWhereInput = {
    AND?: SystemErrorWhereInput | SystemErrorWhereInput[]
    OR?: SystemErrorWhereInput[]
    NOT?: SystemErrorWhereInput | SystemErrorWhereInput[]
    id?: StringFilter<"SystemError"> | string
    on_account?: StringNullableFilter<"SystemError"> | string | null
    type?: StringFilter<"SystemError"> | string
    log?: StringFilter<"SystemError"> | string
    details?: JsonFilter<"SystemError">
    logged_on?: DateTimeFilter<"SystemError"> | Date | string
  }

  export type SystemErrorOrderByWithRelationInput = {
    id?: SortOrder
    on_account?: SortOrderInput | SortOrder
    type?: SortOrder
    log?: SortOrder
    details?: SortOrder
    logged_on?: SortOrder
  }

  export type SystemErrorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SystemErrorWhereInput | SystemErrorWhereInput[]
    OR?: SystemErrorWhereInput[]
    NOT?: SystemErrorWhereInput | SystemErrorWhereInput[]
    on_account?: StringNullableFilter<"SystemError"> | string | null
    type?: StringFilter<"SystemError"> | string
    log?: StringFilter<"SystemError"> | string
    details?: JsonFilter<"SystemError">
    logged_on?: DateTimeFilter<"SystemError"> | Date | string
  }, "id">

  export type SystemErrorOrderByWithAggregationInput = {
    id?: SortOrder
    on_account?: SortOrderInput | SortOrder
    type?: SortOrder
    log?: SortOrder
    details?: SortOrder
    logged_on?: SortOrder
    _count?: SystemErrorCountOrderByAggregateInput
    _max?: SystemErrorMaxOrderByAggregateInput
    _min?: SystemErrorMinOrderByAggregateInput
  }

  export type SystemErrorScalarWhereWithAggregatesInput = {
    AND?: SystemErrorScalarWhereWithAggregatesInput | SystemErrorScalarWhereWithAggregatesInput[]
    OR?: SystemErrorScalarWhereWithAggregatesInput[]
    NOT?: SystemErrorScalarWhereWithAggregatesInput | SystemErrorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SystemError"> | string
    on_account?: StringNullableWithAggregatesFilter<"SystemError"> | string | null
    type?: StringWithAggregatesFilter<"SystemError"> | string
    log?: StringWithAggregatesFilter<"SystemError"> | string
    details?: JsonWithAggregatesFilter<"SystemError">
    logged_on?: DateTimeWithAggregatesFilter<"SystemError"> | Date | string
  }

  export type WebDiskWhereInput = {
    AND?: WebDiskWhereInput | WebDiskWhereInput[]
    OR?: WebDiskWhereInput[]
    NOT?: WebDiskWhereInput | WebDiskWhereInput[]
    id?: StringFilter<"WebDisk"> | string
    filename?: StringFilter<"WebDisk"> | string
    path?: StringFilter<"WebDisk"> | string
    mimeType?: StringFilter<"WebDisk"> | string
    uploaded_by?: StringFilter<"WebDisk"> | string
    uploaded_on?: DateTimeFilter<"WebDisk"> | Date | string
  }

  export type WebDiskOrderByWithRelationInput = {
    id?: SortOrder
    filename?: SortOrder
    path?: SortOrder
    mimeType?: SortOrder
    uploaded_by?: SortOrder
    uploaded_on?: SortOrder
  }

  export type WebDiskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WebDiskWhereInput | WebDiskWhereInput[]
    OR?: WebDiskWhereInput[]
    NOT?: WebDiskWhereInput | WebDiskWhereInput[]
    filename?: StringFilter<"WebDisk"> | string
    path?: StringFilter<"WebDisk"> | string
    mimeType?: StringFilter<"WebDisk"> | string
    uploaded_by?: StringFilter<"WebDisk"> | string
    uploaded_on?: DateTimeFilter<"WebDisk"> | Date | string
  }, "id">

  export type WebDiskOrderByWithAggregationInput = {
    id?: SortOrder
    filename?: SortOrder
    path?: SortOrder
    mimeType?: SortOrder
    uploaded_by?: SortOrder
    uploaded_on?: SortOrder
    _count?: WebDiskCountOrderByAggregateInput
    _max?: WebDiskMaxOrderByAggregateInput
    _min?: WebDiskMinOrderByAggregateInput
  }

  export type WebDiskScalarWhereWithAggregatesInput = {
    AND?: WebDiskScalarWhereWithAggregatesInput | WebDiskScalarWhereWithAggregatesInput[]
    OR?: WebDiskScalarWhereWithAggregatesInput[]
    NOT?: WebDiskScalarWhereWithAggregatesInput | WebDiskScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WebDisk"> | string
    filename?: StringWithAggregatesFilter<"WebDisk"> | string
    path?: StringWithAggregatesFilter<"WebDisk"> | string
    mimeType?: StringWithAggregatesFilter<"WebDisk"> | string
    uploaded_by?: StringWithAggregatesFilter<"WebDisk"> | string
    uploaded_on?: DateTimeWithAggregatesFilter<"WebDisk"> | Date | string
  }

  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    id?: StringFilter<"Account"> | string
    account_type?: StringFilter<"Account"> | string
    connection_id?: StringNullableFilter<"Account"> | string | null
    display_name?: StringNullableFilter<"Account"> | string | null
    display_image?: StringNullableFilter<"Account"> | string | null
    neupid?: StringNullableFilter<"Account"> | string | null
    created_on?: DateTimeFilter<"Account"> | Date | string
    accessed_on?: DateTimeNullableFilter<"Account"> | Date | string | null
  }

  export type AccountOrderByWithRelationInput = {
    id?: SortOrder
    account_type?: SortOrder
    connection_id?: SortOrderInput | SortOrder
    display_name?: SortOrderInput | SortOrder
    display_image?: SortOrderInput | SortOrder
    neupid?: SortOrderInput | SortOrder
    created_on?: SortOrder
    accessed_on?: SortOrderInput | SortOrder
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    account_type?: StringFilter<"Account"> | string
    connection_id?: StringNullableFilter<"Account"> | string | null
    display_name?: StringNullableFilter<"Account"> | string | null
    display_image?: StringNullableFilter<"Account"> | string | null
    neupid?: StringNullableFilter<"Account"> | string | null
    created_on?: DateTimeFilter<"Account"> | Date | string
    accessed_on?: DateTimeNullableFilter<"Account"> | Date | string | null
  }, "id">

  export type AccountOrderByWithAggregationInput = {
    id?: SortOrder
    account_type?: SortOrder
    connection_id?: SortOrderInput | SortOrder
    display_name?: SortOrderInput | SortOrder
    display_image?: SortOrderInput | SortOrder
    neupid?: SortOrderInput | SortOrder
    created_on?: SortOrder
    accessed_on?: SortOrderInput | SortOrder
    _count?: AccountCountOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Account"> | string
    account_type?: StringWithAggregatesFilter<"Account"> | string
    connection_id?: StringNullableWithAggregatesFilter<"Account"> | string | null
    display_name?: StringNullableWithAggregatesFilter<"Account"> | string | null
    display_image?: StringNullableWithAggregatesFilter<"Account"> | string | null
    neupid?: StringNullableWithAggregatesFilter<"Account"> | string | null
    created_on?: DateTimeWithAggregatesFilter<"Account"> | Date | string
    accessed_on?: DateTimeNullableWithAggregatesFilter<"Account"> | Date | string | null
  }

  export type FileFolderCreateInput = {
    id?: string
    name: string
    path: string
    type: string
    owner: string
    stored_as?: string
    size?: bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: Date | string | null
    totalActivity?: number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: Date | string
    updated_on?: Date | string
    logs?: FileFolderLogCreateNestedManyWithoutFilefolderInput
  }

  export type FileFolderUncheckedCreateInput = {
    id?: string
    name: string
    path: string
    type: string
    owner: string
    stored_as?: string
    size?: bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: Date | string | null
    totalActivity?: number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: Date | string
    updated_on?: Date | string
    logs?: FileFolderLogUncheckedCreateNestedManyWithoutFilefolderInput
  }

  export type FileFolderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    owner?: StringFieldUpdateOperationsInput | string
    stored_as?: StringFieldUpdateOperationsInput | string
    size?: BigIntFieldUpdateOperationsInput | bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalActivity?: IntFieldUpdateOperationsInput | number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_on?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: FileFolderLogUpdateManyWithoutFilefolderNestedInput
  }

  export type FileFolderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    owner?: StringFieldUpdateOperationsInput | string
    stored_as?: StringFieldUpdateOperationsInput | string
    size?: BigIntFieldUpdateOperationsInput | bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalActivity?: IntFieldUpdateOperationsInput | number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_on?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: FileFolderLogUncheckedUpdateManyWithoutFilefolderNestedInput
  }

  export type FileFolderCreateManyInput = {
    id?: string
    name: string
    path: string
    type: string
    owner: string
    stored_as?: string
    size?: bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: Date | string | null
    totalActivity?: number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: Date | string
    updated_on?: Date | string
  }

  export type FileFolderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    owner?: StringFieldUpdateOperationsInput | string
    stored_as?: StringFieldUpdateOperationsInput | string
    size?: BigIntFieldUpdateOperationsInput | bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalActivity?: IntFieldUpdateOperationsInput | number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FileFolderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    owner?: StringFieldUpdateOperationsInput | string
    stored_as?: StringFieldUpdateOperationsInput | string
    size?: BigIntFieldUpdateOperationsInput | bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalActivity?: IntFieldUpdateOperationsInput | number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FileFolderLogCreateInput = {
    id?: string
    action: string
    details?: JsonNullValueInput | InputJsonValue
    done_by: string
    done_on?: Date | string
    filefolder: FileFolderCreateNestedOneWithoutLogsInput
  }

  export type FileFolderLogUncheckedCreateInput = {
    id?: string
    filefolder_id: string
    action: string
    details?: JsonNullValueInput | InputJsonValue
    done_by: string
    done_on?: Date | string
  }

  export type FileFolderLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    done_by?: StringFieldUpdateOperationsInput | string
    done_on?: DateTimeFieldUpdateOperationsInput | Date | string
    filefolder?: FileFolderUpdateOneRequiredWithoutLogsNestedInput
  }

  export type FileFolderLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filefolder_id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    done_by?: StringFieldUpdateOperationsInput | string
    done_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FileFolderLogCreateManyInput = {
    id?: string
    filefolder_id: string
    action: string
    details?: JsonNullValueInput | InputJsonValue
    done_by: string
    done_on?: Date | string
  }

  export type FileFolderLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    done_by?: StringFieldUpdateOperationsInput | string
    done_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FileFolderLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    filefolder_id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    done_by?: StringFieldUpdateOperationsInput | string
    done_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ErrorLogCreateInput = {
    id?: string
    on_page: string
    context: string
    created_on?: Date | string
  }

  export type ErrorLogUncheckedCreateInput = {
    id?: string
    on_page: string
    context: string
    created_on?: Date | string
  }

  export type ErrorLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    on_page?: StringFieldUpdateOperationsInput | string
    context?: StringFieldUpdateOperationsInput | string
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ErrorLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    on_page?: StringFieldUpdateOperationsInput | string
    context?: StringFieldUpdateOperationsInput | string
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ErrorLogCreateManyInput = {
    id?: string
    on_page: string
    context: string
    created_on?: Date | string
  }

  export type ErrorLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    on_page?: StringFieldUpdateOperationsInput | string
    context?: StringFieldUpdateOperationsInput | string
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ErrorLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    on_page?: StringFieldUpdateOperationsInput | string
    context?: StringFieldUpdateOperationsInput | string
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemErrorCreateInput = {
    id?: string
    on_account?: string | null
    type: string
    log: string
    details?: JsonNullValueInput | InputJsonValue
    logged_on?: Date | string
  }

  export type SystemErrorUncheckedCreateInput = {
    id?: string
    on_account?: string | null
    type: string
    log: string
    details?: JsonNullValueInput | InputJsonValue
    logged_on?: Date | string
  }

  export type SystemErrorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    on_account?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    log?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    logged_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemErrorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    on_account?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    log?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    logged_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemErrorCreateManyInput = {
    id?: string
    on_account?: string | null
    type: string
    log: string
    details?: JsonNullValueInput | InputJsonValue
    logged_on?: Date | string
  }

  export type SystemErrorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    on_account?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    log?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    logged_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemErrorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    on_account?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    log?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    logged_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebDiskCreateInput = {
    id?: string
    filename: string
    path: string
    mimeType?: string
    uploaded_by: string
    uploaded_on?: Date | string
  }

  export type WebDiskUncheckedCreateInput = {
    id?: string
    filename: string
    path: string
    mimeType?: string
    uploaded_by: string
    uploaded_on?: Date | string
  }

  export type WebDiskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    uploaded_by?: StringFieldUpdateOperationsInput | string
    uploaded_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebDiskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    uploaded_by?: StringFieldUpdateOperationsInput | string
    uploaded_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebDiskCreateManyInput = {
    id?: string
    filename: string
    path: string
    mimeType?: string
    uploaded_by: string
    uploaded_on?: Date | string
  }

  export type WebDiskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    uploaded_by?: StringFieldUpdateOperationsInput | string
    uploaded_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebDiskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    uploaded_by?: StringFieldUpdateOperationsInput | string
    uploaded_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountCreateInput = {
    id?: string
    account_type: string
    connection_id?: string | null
    display_name?: string | null
    display_image?: string | null
    neupid?: string | null
    created_on?: Date | string
    accessed_on?: Date | string | null
  }

  export type AccountUncheckedCreateInput = {
    id?: string
    account_type: string
    connection_id?: string | null
    display_name?: string | null
    display_image?: string | null
    neupid?: string | null
    created_on?: Date | string
    accessed_on?: Date | string | null
  }

  export type AccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    account_type?: StringFieldUpdateOperationsInput | string
    connection_id?: NullableStringFieldUpdateOperationsInput | string | null
    display_name?: NullableStringFieldUpdateOperationsInput | string | null
    display_image?: NullableStringFieldUpdateOperationsInput | string | null
    neupid?: NullableStringFieldUpdateOperationsInput | string | null
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    accessed_on?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    account_type?: StringFieldUpdateOperationsInput | string
    connection_id?: NullableStringFieldUpdateOperationsInput | string | null
    display_name?: NullableStringFieldUpdateOperationsInput | string | null
    display_image?: NullableStringFieldUpdateOperationsInput | string | null
    neupid?: NullableStringFieldUpdateOperationsInput | string | null
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    accessed_on?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AccountCreateManyInput = {
    id?: string
    account_type: string
    connection_id?: string | null
    display_name?: string | null
    display_image?: string | null
    neupid?: string | null
    created_on?: Date | string
    accessed_on?: Date | string | null
  }

  export type AccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    account_type?: StringFieldUpdateOperationsInput | string
    connection_id?: NullableStringFieldUpdateOperationsInput | string | null
    display_name?: NullableStringFieldUpdateOperationsInput | string | null
    display_image?: NullableStringFieldUpdateOperationsInput | string | null
    neupid?: NullableStringFieldUpdateOperationsInput | string | null
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    accessed_on?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    account_type?: StringFieldUpdateOperationsInput | string
    connection_id?: NullableStringFieldUpdateOperationsInput | string | null
    display_name?: NullableStringFieldUpdateOperationsInput | string | null
    display_image?: NullableStringFieldUpdateOperationsInput | string | null
    neupid?: NullableStringFieldUpdateOperationsInput | string | null
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    accessed_on?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type FileFolderLogListRelationFilter = {
    every?: FileFolderLogWhereInput
    some?: FileFolderLogWhereInput
    none?: FileFolderLogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FileFolderLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FileFolderCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    path?: SortOrder
    type?: SortOrder
    owner?: SortOrder
    stored_as?: SortOrder
    size?: SortOrder
    last_activity?: SortOrder
    lastActivityOn?: SortOrder
    totalActivity?: SortOrder
    details?: SortOrder
    created_on?: SortOrder
    updated_on?: SortOrder
  }

  export type FileFolderAvgOrderByAggregateInput = {
    size?: SortOrder
    totalActivity?: SortOrder
  }

  export type FileFolderMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    path?: SortOrder
    type?: SortOrder
    owner?: SortOrder
    stored_as?: SortOrder
    size?: SortOrder
    lastActivityOn?: SortOrder
    totalActivity?: SortOrder
    created_on?: SortOrder
    updated_on?: SortOrder
  }

  export type FileFolderMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    path?: SortOrder
    type?: SortOrder
    owner?: SortOrder
    stored_as?: SortOrder
    size?: SortOrder
    lastActivityOn?: SortOrder
    totalActivity?: SortOrder
    created_on?: SortOrder
    updated_on?: SortOrder
  }

  export type FileFolderSumOrderByAggregateInput = {
    size?: SortOrder
    totalActivity?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FileFolderRelationFilter = {
    is?: FileFolderWhereInput
    isNot?: FileFolderWhereInput
  }

  export type FileFolderLogCountOrderByAggregateInput = {
    id?: SortOrder
    filefolder_id?: SortOrder
    action?: SortOrder
    details?: SortOrder
    done_by?: SortOrder
    done_on?: SortOrder
  }

  export type FileFolderLogMaxOrderByAggregateInput = {
    id?: SortOrder
    filefolder_id?: SortOrder
    action?: SortOrder
    done_by?: SortOrder
    done_on?: SortOrder
  }

  export type FileFolderLogMinOrderByAggregateInput = {
    id?: SortOrder
    filefolder_id?: SortOrder
    action?: SortOrder
    done_by?: SortOrder
    done_on?: SortOrder
  }

  export type ErrorLogCountOrderByAggregateInput = {
    id?: SortOrder
    on_page?: SortOrder
    context?: SortOrder
    created_on?: SortOrder
  }

  export type ErrorLogMaxOrderByAggregateInput = {
    id?: SortOrder
    on_page?: SortOrder
    context?: SortOrder
    created_on?: SortOrder
  }

  export type ErrorLogMinOrderByAggregateInput = {
    id?: SortOrder
    on_page?: SortOrder
    context?: SortOrder
    created_on?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type SystemErrorCountOrderByAggregateInput = {
    id?: SortOrder
    on_account?: SortOrder
    type?: SortOrder
    log?: SortOrder
    details?: SortOrder
    logged_on?: SortOrder
  }

  export type SystemErrorMaxOrderByAggregateInput = {
    id?: SortOrder
    on_account?: SortOrder
    type?: SortOrder
    log?: SortOrder
    logged_on?: SortOrder
  }

  export type SystemErrorMinOrderByAggregateInput = {
    id?: SortOrder
    on_account?: SortOrder
    type?: SortOrder
    log?: SortOrder
    logged_on?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type WebDiskCountOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    path?: SortOrder
    mimeType?: SortOrder
    uploaded_by?: SortOrder
    uploaded_on?: SortOrder
  }

  export type WebDiskMaxOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    path?: SortOrder
    mimeType?: SortOrder
    uploaded_by?: SortOrder
    uploaded_on?: SortOrder
  }

  export type WebDiskMinOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    path?: SortOrder
    mimeType?: SortOrder
    uploaded_by?: SortOrder
    uploaded_on?: SortOrder
  }

  export type AccountCountOrderByAggregateInput = {
    id?: SortOrder
    account_type?: SortOrder
    connection_id?: SortOrder
    display_name?: SortOrder
    display_image?: SortOrder
    neupid?: SortOrder
    created_on?: SortOrder
    accessed_on?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    id?: SortOrder
    account_type?: SortOrder
    connection_id?: SortOrder
    display_name?: SortOrder
    display_image?: SortOrder
    neupid?: SortOrder
    created_on?: SortOrder
    accessed_on?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    id?: SortOrder
    account_type?: SortOrder
    connection_id?: SortOrder
    display_name?: SortOrder
    display_image?: SortOrder
    neupid?: SortOrder
    created_on?: SortOrder
    accessed_on?: SortOrder
  }

  export type FileFolderLogCreateNestedManyWithoutFilefolderInput = {
    create?: XOR<FileFolderLogCreateWithoutFilefolderInput, FileFolderLogUncheckedCreateWithoutFilefolderInput> | FileFolderLogCreateWithoutFilefolderInput[] | FileFolderLogUncheckedCreateWithoutFilefolderInput[]
    connectOrCreate?: FileFolderLogCreateOrConnectWithoutFilefolderInput | FileFolderLogCreateOrConnectWithoutFilefolderInput[]
    createMany?: FileFolderLogCreateManyFilefolderInputEnvelope
    connect?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
  }

  export type FileFolderLogUncheckedCreateNestedManyWithoutFilefolderInput = {
    create?: XOR<FileFolderLogCreateWithoutFilefolderInput, FileFolderLogUncheckedCreateWithoutFilefolderInput> | FileFolderLogCreateWithoutFilefolderInput[] | FileFolderLogUncheckedCreateWithoutFilefolderInput[]
    connectOrCreate?: FileFolderLogCreateOrConnectWithoutFilefolderInput | FileFolderLogCreateOrConnectWithoutFilefolderInput[]
    createMany?: FileFolderLogCreateManyFilefolderInputEnvelope
    connect?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type FileFolderLogUpdateManyWithoutFilefolderNestedInput = {
    create?: XOR<FileFolderLogCreateWithoutFilefolderInput, FileFolderLogUncheckedCreateWithoutFilefolderInput> | FileFolderLogCreateWithoutFilefolderInput[] | FileFolderLogUncheckedCreateWithoutFilefolderInput[]
    connectOrCreate?: FileFolderLogCreateOrConnectWithoutFilefolderInput | FileFolderLogCreateOrConnectWithoutFilefolderInput[]
    upsert?: FileFolderLogUpsertWithWhereUniqueWithoutFilefolderInput | FileFolderLogUpsertWithWhereUniqueWithoutFilefolderInput[]
    createMany?: FileFolderLogCreateManyFilefolderInputEnvelope
    set?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
    disconnect?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
    delete?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
    connect?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
    update?: FileFolderLogUpdateWithWhereUniqueWithoutFilefolderInput | FileFolderLogUpdateWithWhereUniqueWithoutFilefolderInput[]
    updateMany?: FileFolderLogUpdateManyWithWhereWithoutFilefolderInput | FileFolderLogUpdateManyWithWhereWithoutFilefolderInput[]
    deleteMany?: FileFolderLogScalarWhereInput | FileFolderLogScalarWhereInput[]
  }

  export type FileFolderLogUncheckedUpdateManyWithoutFilefolderNestedInput = {
    create?: XOR<FileFolderLogCreateWithoutFilefolderInput, FileFolderLogUncheckedCreateWithoutFilefolderInput> | FileFolderLogCreateWithoutFilefolderInput[] | FileFolderLogUncheckedCreateWithoutFilefolderInput[]
    connectOrCreate?: FileFolderLogCreateOrConnectWithoutFilefolderInput | FileFolderLogCreateOrConnectWithoutFilefolderInput[]
    upsert?: FileFolderLogUpsertWithWhereUniqueWithoutFilefolderInput | FileFolderLogUpsertWithWhereUniqueWithoutFilefolderInput[]
    createMany?: FileFolderLogCreateManyFilefolderInputEnvelope
    set?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
    disconnect?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
    delete?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
    connect?: FileFolderLogWhereUniqueInput | FileFolderLogWhereUniqueInput[]
    update?: FileFolderLogUpdateWithWhereUniqueWithoutFilefolderInput | FileFolderLogUpdateWithWhereUniqueWithoutFilefolderInput[]
    updateMany?: FileFolderLogUpdateManyWithWhereWithoutFilefolderInput | FileFolderLogUpdateManyWithWhereWithoutFilefolderInput[]
    deleteMany?: FileFolderLogScalarWhereInput | FileFolderLogScalarWhereInput[]
  }

  export type FileFolderCreateNestedOneWithoutLogsInput = {
    create?: XOR<FileFolderCreateWithoutLogsInput, FileFolderUncheckedCreateWithoutLogsInput>
    connectOrCreate?: FileFolderCreateOrConnectWithoutLogsInput
    connect?: FileFolderWhereUniqueInput
  }

  export type FileFolderUpdateOneRequiredWithoutLogsNestedInput = {
    create?: XOR<FileFolderCreateWithoutLogsInput, FileFolderUncheckedCreateWithoutLogsInput>
    connectOrCreate?: FileFolderCreateOrConnectWithoutLogsInput
    upsert?: FileFolderUpsertWithoutLogsInput
    connect?: FileFolderWhereUniqueInput
    update?: XOR<XOR<FileFolderUpdateToOneWithWhereWithoutLogsInput, FileFolderUpdateWithoutLogsInput>, FileFolderUncheckedUpdateWithoutLogsInput>
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FileFolderLogCreateWithoutFilefolderInput = {
    id?: string
    action: string
    details?: JsonNullValueInput | InputJsonValue
    done_by: string
    done_on?: Date | string
  }

  export type FileFolderLogUncheckedCreateWithoutFilefolderInput = {
    id?: string
    action: string
    details?: JsonNullValueInput | InputJsonValue
    done_by: string
    done_on?: Date | string
  }

  export type FileFolderLogCreateOrConnectWithoutFilefolderInput = {
    where: FileFolderLogWhereUniqueInput
    create: XOR<FileFolderLogCreateWithoutFilefolderInput, FileFolderLogUncheckedCreateWithoutFilefolderInput>
  }

  export type FileFolderLogCreateManyFilefolderInputEnvelope = {
    data: FileFolderLogCreateManyFilefolderInput | FileFolderLogCreateManyFilefolderInput[]
    skipDuplicates?: boolean
  }

  export type FileFolderLogUpsertWithWhereUniqueWithoutFilefolderInput = {
    where: FileFolderLogWhereUniqueInput
    update: XOR<FileFolderLogUpdateWithoutFilefolderInput, FileFolderLogUncheckedUpdateWithoutFilefolderInput>
    create: XOR<FileFolderLogCreateWithoutFilefolderInput, FileFolderLogUncheckedCreateWithoutFilefolderInput>
  }

  export type FileFolderLogUpdateWithWhereUniqueWithoutFilefolderInput = {
    where: FileFolderLogWhereUniqueInput
    data: XOR<FileFolderLogUpdateWithoutFilefolderInput, FileFolderLogUncheckedUpdateWithoutFilefolderInput>
  }

  export type FileFolderLogUpdateManyWithWhereWithoutFilefolderInput = {
    where: FileFolderLogScalarWhereInput
    data: XOR<FileFolderLogUpdateManyMutationInput, FileFolderLogUncheckedUpdateManyWithoutFilefolderInput>
  }

  export type FileFolderLogScalarWhereInput = {
    AND?: FileFolderLogScalarWhereInput | FileFolderLogScalarWhereInput[]
    OR?: FileFolderLogScalarWhereInput[]
    NOT?: FileFolderLogScalarWhereInput | FileFolderLogScalarWhereInput[]
    id?: StringFilter<"FileFolderLog"> | string
    filefolder_id?: StringFilter<"FileFolderLog"> | string
    action?: StringFilter<"FileFolderLog"> | string
    details?: JsonFilter<"FileFolderLog">
    done_by?: StringFilter<"FileFolderLog"> | string
    done_on?: DateTimeFilter<"FileFolderLog"> | Date | string
  }

  export type FileFolderCreateWithoutLogsInput = {
    id?: string
    name: string
    path: string
    type: string
    owner: string
    stored_as?: string
    size?: bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: Date | string | null
    totalActivity?: number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: Date | string
    updated_on?: Date | string
  }

  export type FileFolderUncheckedCreateWithoutLogsInput = {
    id?: string
    name: string
    path: string
    type: string
    owner: string
    stored_as?: string
    size?: bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: Date | string | null
    totalActivity?: number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: Date | string
    updated_on?: Date | string
  }

  export type FileFolderCreateOrConnectWithoutLogsInput = {
    where: FileFolderWhereUniqueInput
    create: XOR<FileFolderCreateWithoutLogsInput, FileFolderUncheckedCreateWithoutLogsInput>
  }

  export type FileFolderUpsertWithoutLogsInput = {
    update: XOR<FileFolderUpdateWithoutLogsInput, FileFolderUncheckedUpdateWithoutLogsInput>
    create: XOR<FileFolderCreateWithoutLogsInput, FileFolderUncheckedCreateWithoutLogsInput>
    where?: FileFolderWhereInput
  }

  export type FileFolderUpdateToOneWithWhereWithoutLogsInput = {
    where?: FileFolderWhereInput
    data: XOR<FileFolderUpdateWithoutLogsInput, FileFolderUncheckedUpdateWithoutLogsInput>
  }

  export type FileFolderUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    owner?: StringFieldUpdateOperationsInput | string
    stored_as?: StringFieldUpdateOperationsInput | string
    size?: BigIntFieldUpdateOperationsInput | bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalActivity?: IntFieldUpdateOperationsInput | number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FileFolderUncheckedUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    owner?: StringFieldUpdateOperationsInput | string
    stored_as?: StringFieldUpdateOperationsInput | string
    size?: BigIntFieldUpdateOperationsInput | bigint | number
    last_activity?: JsonNullValueInput | InputJsonValue
    lastActivityOn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalActivity?: IntFieldUpdateOperationsInput | number
    details?: JsonNullValueInput | InputJsonValue
    created_on?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FileFolderLogCreateManyFilefolderInput = {
    id?: string
    action: string
    details?: JsonNullValueInput | InputJsonValue
    done_by: string
    done_on?: Date | string
  }

  export type FileFolderLogUpdateWithoutFilefolderInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    done_by?: StringFieldUpdateOperationsInput | string
    done_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FileFolderLogUncheckedUpdateWithoutFilefolderInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    done_by?: StringFieldUpdateOperationsInput | string
    done_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FileFolderLogUncheckedUpdateManyWithoutFilefolderInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    details?: JsonNullValueInput | InputJsonValue
    done_by?: StringFieldUpdateOperationsInput | string
    done_on?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use FileFolderCountOutputTypeDefaultArgs instead
     */
    export type FileFolderCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FileFolderCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FileFolderDefaultArgs instead
     */
    export type FileFolderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FileFolderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FileFolderLogDefaultArgs instead
     */
    export type FileFolderLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FileFolderLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ErrorLogDefaultArgs instead
     */
    export type ErrorLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ErrorLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SystemErrorDefaultArgs instead
     */
    export type SystemErrorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SystemErrorDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WebDiskDefaultArgs instead
     */
    export type WebDiskArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WebDiskDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AccountDefaultArgs instead
     */
    export type AccountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AccountDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}