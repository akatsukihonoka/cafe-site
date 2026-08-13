import { registerAgent } from "@/core/agent/registry";
import { runInterviewer } from "./interviewer";
import { runDirector } from "./director";
import { runMarketing } from "./marketing";
import { runUx } from "./ux";
import { runDesigner } from "./designer";
import { runCopywriter } from "./copywriter";
import { runFrontend } from "./frontend";
import { runReviewer } from "./reviewer";
import { runQa } from "./qa";
import { runEditor } from "./editor";

/**
 * このモジュールをimportする(副作用のみが目的)と、全エージェントが
 * core/agent/registryに登録される。LLMベースのrunXXXはcreateLazyAgentで
 * 作られており、ここでimportされてもLLM Providerの解決(環境変数読み込み)は
 * 発生しない。qaのみLLMを使わない決定論的な実装(Phase8参照)。
 */
registerAgent("interviewer", runInterviewer);
registerAgent("director", runDirector);
registerAgent("marketing", runMarketing);
registerAgent("ux", runUx);
registerAgent("designer", runDesigner);
registerAgent("copywriter", runCopywriter);
registerAgent("frontend", runFrontend);
registerAgent("reviewer", runReviewer);
registerAgent("qa", runQa);
registerAgent("editor", runEditor);
