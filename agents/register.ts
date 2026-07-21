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

/**
 * このモジュールをimportする(副作用のみが目的)と、9エージェントすべてが
 * core/agent/registryに登録される。各runXXXはcreateLazyAgentで作られており、
 * ここでimportされてもLLM Providerの解決(環境変数読み込み)は発生しない。
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
