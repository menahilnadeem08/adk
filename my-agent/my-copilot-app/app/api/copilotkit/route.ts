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
    my_agent: agent,
    SharedStateStreamingAgent: agent,
    "a2ui-fixed-schema": agent,
  },
  a2ui: { injectA2UITool: true, agents: ["a2ui-fixed-schema", "SharedStateStreamingAgent", "my_agent"] },
});


export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};