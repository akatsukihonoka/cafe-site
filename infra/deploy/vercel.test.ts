import { afterEach, describe, expect, it, vi } from "vitest";
import { deploySite } from "./vercel";
import { DEMO_DESIGNER_OUTPUT, DEMO_FRONTEND_OUTPUT } from "@/components-library/demoData";

describe("deploySite", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("VERCEL_API_TOKEN未設定なら例外を投げる", async () => {
    vi.stubEnv("VERCEL_API_TOKEN", "");
    await expect(
      deploySite({ projectId: "p1", siteOutputs: {} })
    ).rejects.toThrow("VERCEL_API_TOKEN");
  });

  it("frontend/designerの出力が無ければ例外を投げる", async () => {
    vi.stubEnv("VERCEL_API_TOKEN", "token");
    await expect(
      deploySite({ projectId: "p1", siteOutputs: {} })
    ).rejects.toThrow();
  });

  it("成功時はVercel APIを正しいリクエストで呼び、URLを返す", async () => {
    vi.stubEnv("VERCEL_API_TOKEN", "test-token");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "ai-web-studio-p1.vercel.app" }),
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await deploySite({
      projectId: "p1",
      siteOutputs: { frontend: DEMO_FRONTEND_OUTPUT, designer: DEMO_DESIGNER_OUTPUT },
    });

    expect(result).toEqual({ url: "https://ai-web-studio-p1.vercel.app" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [urlArg, initArg] = fetchMock.mock.calls[0];
    expect(String(urlArg)).toContain("/v13/deployments");
    expect(initArg.method).toBe("POST");
    expect(initArg.headers.Authorization).toBe("Bearer test-token");

    const body = JSON.parse(initArg.body);
    expect(body.files).toHaveLength(1);
    expect(body.files[0].file).toBe("index.html");
    expect(body.files[0].data).toContain(DEMO_FRONTEND_OUTPUT.pageTitle);
  });

  it("Vercel APIがエラーを返したら理由を含めて例外を投げる", async () => {
    vi.stubEnv("VERCEL_API_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "invalid project name",
      })
    );

    await expect(
      deploySite({
        projectId: "p1",
        siteOutputs: { frontend: DEMO_FRONTEND_OUTPUT, designer: DEMO_DESIGNER_OUTPUT },
      })
    ).rejects.toThrow(/400/);
  });
});
