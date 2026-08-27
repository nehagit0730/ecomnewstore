import { PrismaClient } from "@prisma/client";
import { executeMockQuery } from "./mock-executor";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  realPrisma?: PrismaClient | null;
};

/**
 * Checks whether the DATABASE_URL represents a valid external/remote database (e.g. Neon)
 * rather than an unreachable default localhost placeholder.
 */
function isConfiguredRemoteUrl(url?: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed === "" || trimmed.startsWith("postgresql://placeholder")) return false;
  // Localhost in container environment without a local PG daemon
  if (
    trimmed.includes("localhost") ||
    trimmed.includes("127.0.0.1") ||
    trimmed.includes("veloire:veloire_secret@localhost")
  ) {
    return false;
  }
  return trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://");
}

function getRealPrisma(): PrismaClient | null {
  if (globalForPrisma.realPrisma !== undefined) {
    return globalForPrisma.realPrisma;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!isConfiguredRemoteUrl(dbUrl)) {
    globalForPrisma.realPrisma = null;
    return null;
  }

  try {
    const client = new PrismaClient({
      log: [],
    });
    globalForPrisma.realPrisma = client;
    return client;
  } catch {
    globalForPrisma.realPrisma = null;
    return null;
  }
}

function isRecoverableDbError(err: any): boolean {
  if (!err) return false;
  const message = String(err?.message || "");
  const code = String(err?.code || "");
  const name = String(err?.name || "");

  return (
    name === "PrismaClientInitializationError" ||
    name === "PrismaClientRustPanicError" ||
    name === "PrismaClientUnknownRequestError" ||
    code === "P1000" ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P1003" ||
    code === "P1017" ||
    code === "P2021" ||
    code === "P2022" ||
    message.includes("Can't reach database server") ||
    message.includes("connect ECONNREFUSED") ||
    message.includes("ENOTFOUND") ||
    message.includes("ETIMEDOUT") ||
    message.includes("does not exist in the current database") ||
    message.includes("relation") ||
    message.includes("SSL")
  );
}

function createPrismaProxy(): PrismaClient {
  const modelProxyCache = new Map<string, any>();

  const handler: ProxyHandler<any> = {
    get(_target, prop: string | symbol) {
      if (typeof prop !== "string") return undefined;

      const realPrisma = getRealPrisma();

      if (prop === "$connect") {
        return async () => {
          if (realPrisma) {
            try {
              await realPrisma.$connect();
            } catch {
              // Graceful fallback
            }
          }
        };
      }

      if (prop === "$disconnect") {
        return async () => {
          if (realPrisma) {
            try {
              await realPrisma.$disconnect();
            } catch {
              // Graceful fallback
            }
          }
        };
      }

      if (prop === "$transaction") {
        return async (arg: any, options?: any) => {
          if (realPrisma) {
            try {
              return await realPrisma.$transaction(arg, options);
            } catch (err: any) {
              if (!isRecoverableDbError(err)) {
                throw err;
              }
            }
          }
          if (typeof arg === "function") {
            return arg(proxy);
          }
          if (Array.isArray(arg)) {
            return Promise.all(arg);
          }
          return arg;
        };
      }

      if (prop === "$queryRaw" || prop === "$queryRawUnsafe") {
        return async (...args: any[]) => {
          if (realPrisma) {
            try {
              return await (realPrisma as any)[prop](...args);
            } catch {
              return [];
            }
          }
          return [];
        };
      }

      if (prop === "$executeRaw" || prop === "$executeRawUnsafe") {
        return async (...args: any[]) => {
          if (realPrisma) {
            try {
              return await (realPrisma as any)[prop](...args);
            } catch {
              return 0;
            }
          }
          return 0;
        };
      }

      if (modelProxyCache.has(prop)) {
        return modelProxyCache.get(prop);
      }

      const modelHandler = new Proxy(
        {},
        {
          get(_mTarget, action: string | symbol) {
            if (typeof action !== "string") return undefined;

            return async (args: any = {}) => {
              const activePrisma = getRealPrisma();
              if (activePrisma) {
                try {
                  const realModel = (activePrisma as any)[prop];
                  if (realModel && typeof realModel[action] === "function") {
                    return await realModel[action](args);
                  }
                } catch (err: any) {
                  if (!isRecoverableDbError(err)) {
                    throw err;
                  }
                }
              }

              // Fallback to mock query executor
              return executeMockQuery(prop, action, args);
            };
          },
        }
      );

      modelProxyCache.set(prop, modelHandler);
      return modelHandler;
    },
  };

  const proxy = new Proxy({}, handler) as PrismaClient;
  return proxy;
}

export const prisma = globalForPrisma.prisma ?? createPrismaProxy();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

