import { serve } from "inngest/next";
import { inngest } from "@/infra/inngest/client";
import { generateSite } from "@/inngest/functions/generateSite";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateSite],
});
