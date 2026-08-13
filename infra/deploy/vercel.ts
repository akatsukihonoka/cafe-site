import type { DeployInput, DeployResult, DeploySite } from "@/core/workflow/deploy.port";
import { frontendOutputSchema } from "@/agents/frontend/contract";
import { designerOutputSchema } from "@/agents/designer/contract";
import { renderStaticSiteHtml } from "./renderStaticSite";

const VERCEL_API_BASE = "https://api.vercel.com";

interface VercelDeploymentResponse {
  url: string;
}

/** Vercelのプロジェクト名は英数字とハイフンのみ・63文字以内という制約があるため整形する。 */
function projectNameFor(projectId: string): string {
  const prefix = process.env.VERCEL_PROJECT_PREFIX || "ai-web-studio";
  const safeId = projectId.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
  return `${prefix}-${safeId}`.slice(0, 63);
}

/**
 * Vercel Deployments API (`POST /v13/deployments`) を使って、
 * 生成サイトの静的HTMLを実際にデプロイする。
 *
 * 重要な注意: この実装は一度もVercelの実APIに対して実行されていない(未検証)。
 * このプロジェクトの開発環境ではapi.vercel.comへのネットワークアクセス自体が
 * プロキシポリシーでブロックされており、かつVERCEL_API_TOKENも用意されていない。
 * 公開されているVercel Deployments APIの仕様を基に実装しているが、
 * 実際の認証情報を使って動作確認してから本番投入すること
 * (レスポンス形式やフィールド名が実際のAPIと異なる可能性がある)。
 */
export const deploySite: DeploySite = async ({
  projectId,
  siteOutputs,
}: DeployInput): Promise<DeployResult> => {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) {
    throw new Error("VERCEL_API_TOKEN is not set.");
  }

  const frontend = frontendOutputSchema.parse(siteOutputs.frontend);
  const designer = designerOutputSchema.parse(siteOutputs.designer);

  const studioOrigin = process.env.NEXT_PUBLIC_APP_URL;
  const html = renderStaticSiteHtml(
    frontend,
    designer,
    studioOrigin ? { projectId, studioOrigin } : undefined
  );

  const name = projectNameFor(projectId);
  const endpoint = new URL(`${VERCEL_API_BASE}/v13/deployments`);
  const teamId = process.env.VERCEL_TEAM_ID;
  if (teamId) {
    endpoint.searchParams.set("teamId", teamId);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      target: "production",
      files: [{ file: "index.html", data: html }],
      projectSettings: { framework: null },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vercel deployment failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as VercelDeploymentResponse;
  return { url: `https://${data.url}` };
};
