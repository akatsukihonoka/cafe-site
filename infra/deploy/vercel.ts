import type { DeploySite } from "@/core/workflow/deploy.port";

/** Phase9で実装する。Vercel Deploy APIを呼び、生成サイトをサブドメインで公開する。 */
export const deploySite: DeploySite = async () => {
  throw new Error("Vercel deploy is not implemented yet. It will be implemented in Phase9.");
};
