"use client"
import React, { useState } from "react";
import { CopilotChat, useAgentContext, useAgent, UseAgentUpdate } from "@copilotkit/react-core/v2"; 

interface AgentConfig {
  tone: string;
  expertise: string;
  responseLength: string;
}

function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}

type SubAgentName = "research_agent" | "writing_agent" | "critique_agent";

interface DelegationLogProps {
  delegations: Array<{
    id: string;
    sub_agent: SubAgentName;
    status: string;
    task: string;
    result: string;
  }>;
  isRunning: boolean;
}

const SUB_AGENT_STYLE: Record<SubAgentName, { emoji: string; label: string; color: string }> = {
  research_agent: {
    emoji: "🔍",
    label: "Researcher",
    color: "bg-[#E6F4EA] border-[#CEEAD6] text-[#137333]",
  },
  writing_agent: {
    emoji: "✍️",
    label: "Writer",
    color: "bg-[#FEF7E0] border-[#FEEFC3] text-[#B06000]",
  },
  critique_agent: {
    emoji: "⚖️",
    label: "Critic",
    color: "bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F]",
  },
};

const INDICATOR_ROLES: ReadonlyArray<{
  role: "researcher" | "writer" | "critic";
  subAgent: SubAgentName;
}> = [
  { role: "researcher", subAgent: "research_agent" },
  { role: "writer", subAgent: "writing_agent" },
  { role: "critic", subAgent: "critique_agent" },
];

export function DelegatdelegationsionLog({ delegations, isRunning }: DelegationLogProps) {
  const calledRoles = new Set<SubAgentName>(
    delegations.map((d) => d.sub_agent),
  );
  return (
    <div
      data-testid="delegation-log"
      className="w-full h-full flex flex-col bg-white rounded-2xl shadow-sm border border-[#DBDBE5] overflow-hidden text-slate-800"
    >
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#E9E9EF] bg-[#FAFAFC]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#010507]">
            Sub-agent delegations
          </span>
          {isRunning && (
            <span
              data-testid="supervisor-running"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#BEC2FF] bg-[#BEC2FF1A] text-[#010507] text-[10px] font-semibold uppercase tracking-[0.12em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#010507] animate-pulse" />
              Supervisor running
            </span>
          )}
        </div>
        <span
          data-testid="delegation-count"
          className="text-xs font-mono text-[#838389]"
        >
          {delegations.length} calls
        </span>
      </div>
      <div
        data-testid="subagent-indicators"
        className="flex items-center gap-2 border-b border-[#E9E9EF] bg-white px-6 py-2"
      >
        {INDICATOR_ROLES.map(({ role, subAgent }) => {
          const style = SUB_AGENT_STYLE[subAgent];
          const fired = calledRoles.has(subAgent);
          return (
            <span
              key={role}
              data-testid={`subagent-indicator-${role}`}
              data-role={role}
              data-fired={fired ? "true" : "false"}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] border ${style.color} ${
                fired ? "" : "opacity-60"
              }`}
            >
              <span aria-hidden>{style.emoji}</span>
              <span>{style.label}</span>
            </span>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {delegations.length === 0 ? (
          <p className="text-[#838389] italic text-sm">
            Ask the supervisor to complete a task. Every sub-agent it calls will
            appear here.
          </p>
        ) : (
          delegations.map((d, idx) => {
            const style = SUB_AGENT_STYLE[d.sub_agent];
            return (
              <div
                key={d.id}
                data-testid="delegation-entry"
                className="border border-[#E9E9EF] rounded-xl p-3 bg-[#FAFAFC]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#AFAFB7]">
                      #{idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] border ${style.color}`}
                    >
                      <span>{style.emoji}</span>
                      <span>{style.label}</span>
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#189370]">
                    {d.status}
                  </span>
                </div>
                <div className="text-xs text-[#57575B] mb-2">
                  <span className="font-semibold text-[#010507]">Task: </span>
                  {d.task}
                </div>
                <div className="text-sm text-[#010507] whitespace-pre-wrap bg-white rounded-lg p-2.5 border border-[#E9E9EF]">
                  {d.result}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Page() {
  const [config, setConfig] = useState<AgentConfig>({
    tone: "professional",
    expertise: "intermediate",
    responseLength: "concise",
  });

  const { agent } = useAgent({
    agentId: "my_agent",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  const delegations = agent?.state?.delegations || [];
  const isRunning = agent?.isRunning || false;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col xl:flex-row gap-6 p-6">
      {/* Configuration Panel */}
      <div className="w-full xl:w-80 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl h-fit">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Agent Configuration
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Customize how the agent responds in real-time.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Tone
              </label>
              <select
                value={config.tone}
                onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="funny">Funny</option>
                <option value="poetic">Poetic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Expertise Level
              </label>
              <select
                value={config.expertise}
                onChange={(e) => setConfig({ ...config, expertise: e.target.value })}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Response Length
              </label>
              <select
                value={config.responseLength}
                onChange={(e) => setConfig({ ...config, responseLength: e.target.value })}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="short">Short</option>
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-800 pt-4 text-xs text-slate-500 flex flex-col gap-1">
            <div>Tone: <span className="text-blue-400 font-mono">{config.tone}</span></div>
            <div>Expertise: <span className="text-blue-400 font-mono">{config.expertise}</span></div>
            <div>Length: <span className="text-blue-400 font-mono">{config.responseLength}</span></div>
          </div>
        </div>
      </div>

      {/* Delegation Log Panel */}
      <div className="w-full xl:w-96 flex flex-col h-[500px] xl:h-auto min-h-[400px]">
        <DelegationLog delegations={delegations} isRunning={isRunning} />
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
        <ConfigContextRelay config={config} />
        <CopilotChat
          agentId="my_agent"
          labels={{
            chatInputPlaceholder: "Ask your agent anything...",
            welcomeMessageText: `Hi there! I am configured with: tone=${config.tone}, expertise=${config.expertise}, length=${config.responseLength}. Ask me to research, write, or critique.`,
            chatDisclaimerText: "AI responses may be inaccurate.",
          }}
          className="flex-1"
        />
      </div>
    </main>
  );
}

// export default function Page() {
//   return (
//     <main>
//       <h1>Your App</h1>
// <CopilotChat
//   labels={{
//     chatInputPlaceholder: "Ask your agent anything...",
//     welcomeMessageText: "How can I help you today?",
//     chatDisclaimerText: "AI responses may be inaccurate.",
//   }}
// />
// 
//     </main>
//   );
// }
// const CustomMessageView = ({ messages, isRunning }) => (
//   <div className="space-y-4 p-6">
//     {messages?.map((msg) => (
//       <div key={msg.id} className={msg.role === "user" ? "text-right" : "text-left"}>
//         {msg.content}
//       </div>
//     ))}
//     {isRunning && <div className="animate-pulse">Thinking...</div>}
//   </div>
// );
// export function Chat() {
//   return <CopilotChat messageView={CustomMessageView} />;
// }
