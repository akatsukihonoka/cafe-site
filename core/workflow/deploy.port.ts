export interface DeployInput {
  projectId: string;
  siteOutputs: Record<string, unknown>;
}

export interface DeployResult {
  url: string;
}

/** Phase9で実装するVercelデプロイ処理の差し込み口。 */
export type DeploySite = (input: DeployInput) => Promise<DeployResult>;
