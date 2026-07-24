import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getServerEnv } from '@/lib/env';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: getServerEnv().DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Next.js dev serverのホットリロードで接続が増殖しないよう、globalThisにキャッシュする。
function getPrismaClient(): PrismaClient {
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = createPrismaClient();
  }
  return globalThis.prismaGlobal;
}

// 実際にクエリを発行するまで(=最初のプロパティアクセスまで)接続・env検証を遅延させる。
// こうしないと、Next.jsのビルド時ページデータ収集がこのモジュールをimportしただけで
// getServerEnv()が実行され、ビルドが失敗する。
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrismaClient() as object, prop, receiver);
  },
});
