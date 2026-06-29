import { useState } from "react";

export interface AgentConfig {
  tone: string;
  expertise: string;
  responseLength: string;
}

export function useAgentConfig() {
  const [tone, setTone] = useState("professional");
  const [expertise, setExpertise] = useState("intermediate");
  const [responseLength, setResponseLength] = useState("concise");

  const config: AgentConfig = {
    tone,
    expertise,
    responseLength,
  };

  return {
    config,
    setTone,
    setExpertise,
    setResponseLength,
  };
}
