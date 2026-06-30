import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

const serviceAdapter = new ExperimentalEmptyAdapter();

const agent = new HttpAgent({ url: "http://localhost:8000/" });

const runtime = new CopilotRuntime({
  agents: {
    "declarative-gen-ui": agent,
  },
  a2ui: {
    injectA2UITool: true,

  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit-declarative-gen-ui",
  });

  return handleRequest(req);
};
