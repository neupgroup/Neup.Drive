
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.FileFolderScalarFieldEnum = {
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

exports.Prisma.FileFolderLogScalarFieldEnum = {
  id: 'id',
  filefolder_id: 'filefolder_id',
  action: 'action',
  details: 'details',
  done_by: 'done_by',
  done_on: 'done_on'
};

exports.Prisma.ErrorLogScalarFieldEnum = {
  id: 'id',
  on_page: 'on_page',
  context: 'context',
  created_on: 'created_on'
};

exports.Prisma.SystemErrorScalarFieldEnum = {
  id: 'id',
  on_account: 'on_account',
  type: 'type',
  log: 'log',
  details: 'details',
  logged_on: 'logged_on'
};

exports.Prisma.WebDiskScalarFieldEnum = {
  id: 'id',
  filename: 'filename',
  path: 'path',
  mimeType: 'mimeType',
  uploaded_by: 'uploaded_by',
  uploaded_on: 'uploaded_on'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  account_type: 'account_type',
  connection_id: 'connection_id',
  display_name: 'display_name',
  display_image: 'display_image',
  neupid: 'neupid',
  created_on: 'created_on',
  accessed_on: 'accessed_on'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  FileFolder: 'FileFolder',
  FileFolderLog: 'FileFolderLog',
  ErrorLog: 'ErrorLog',
  SystemError: 'SystemError',
  WebDisk: 'WebDisk',
  Account: 'Account'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/neupkishor/Code/Neup.Drive/prisma/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "/Users/neupkishor/Code/Neup.Drive/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../.env"
  },
  "relativePath": "..",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  previewFeatures = [\"driverAdapters\"]\n  output          = \"./client\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel FileFolder {\n  id             String          @id @default(uuid())\n  name           String\n  path           String\n  type           String\n  owner          String\n  stored_as      String          @default(\"drive\")\n  size           BigInt          @default(0)\n  last_activity  Json            @default(\"{}\")\n  lastActivityOn DateTime?       @map(\"last_activity_on\")\n  totalActivity  Int             @default(0) @map(\"total_activity\")\n  details        Json            @default(\"{}\")\n  created_on     DateTime        @default(now())\n  updated_on     DateTime        @updatedAt\n  logs           FileFolderLog[]\n\n  @@index([owner])\n  @@index([path])\n  @@index([stored_as])\n  @@map(\"filefolder\")\n}\n\nmodel FileFolderLog {\n  id            String     @id @default(uuid())\n  filefolder_id String\n  action        String\n  details       Json       @default(\"{}\")\n  done_by       String\n  done_on       DateTime   @default(now())\n  filefolder    FileFolder @relation(fields: [filefolder_id], references: [id], onDelete: Cascade)\n\n  @@index([filefolder_id])\n  @@index([done_by])\n  @@map(\"filefolder_log\")\n}\n\nmodel ErrorLog {\n  id         String   @id @default(uuid())\n  on_page    String // Page/Component where error occurred\n  context    String // JSON string of error details\n  created_on DateTime @default(now())\n}\n\nmodel SystemError {\n  id         String   @id @default(uuid())\n  on_account String?\n  type       String\n  log        String\n  details    Json     @default(\"{}\")\n  logged_on  DateTime @default(now())\n\n  @@index([on_account])\n  @@index([type])\n  @@map(\"system_error\")\n}\n\nmodel WebDisk {\n  id          String   @id @default(uuid())\n  filename    String\n  path        String\n  mimeType    String   @default(\"application/octet-stream\")\n  uploaded_by String\n  uploaded_on DateTime @default(now())\n}\n\nmodel Account {\n  id            String    @id @default(uuid())\n  account_type  String\n  connection_id String?\n  display_name  String?\n  display_image String?\n  neupid        String?\n  created_on    DateTime  @default(now())\n  accessed_on   DateTime?\n}\n",
  "inlineSchemaHash": "5f567765fc4abe2390f11f0fa06ecf06ba30028846e4226133363417d6f6bd06",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"FileFolder\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"path\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stored_as\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"size\",\"kind\":\"scalar\",\"type\":\"BigInt\"},{\"name\":\"last_activity\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"lastActivityOn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"last_activity_on\"},{\"name\":\"totalActivity\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"total_activity\"},{\"name\":\"details\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"created_on\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updated_on\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"logs\",\"kind\":\"object\",\"type\":\"FileFolderLog\",\"relationName\":\"FileFolderToFileFolderLog\"}],\"dbName\":\"filefolder\"},\"FileFolderLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"filefolder_id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"action\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"details\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"done_by\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"done_on\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"filefolder\",\"kind\":\"object\",\"type\":\"FileFolder\",\"relationName\":\"FileFolderToFileFolderLog\"}],\"dbName\":\"filefolder_log\"},\"ErrorLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"on_page\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"context\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"created_on\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"SystemError\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"on_account\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"log\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"details\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"logged_on\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":\"system_error\"},\"WebDisk\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"filename\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"path\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"mimeType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"uploaded_by\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"uploaded_on\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Account\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"account_type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"connection_id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"display_name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"display_image\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"neupid\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"created_on\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"accessed_on\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

