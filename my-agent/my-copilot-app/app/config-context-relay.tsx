import { useAgentContext } from "@copilotkit/react-core/v2";
import { AgentConfig } from "./use-agent-config";

export function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "The user's currently selected response preferences configuration (tone, expertise, responseLength)",
    value: config,
  });

  return null;
}
