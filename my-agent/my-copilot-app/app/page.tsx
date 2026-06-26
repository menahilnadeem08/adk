"use client"
import { useState } from "react";
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

export function DelegationLog({ delegations, isRunning }: DelegationLogProps) {
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
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] border ${style.color} ${fired ? "" : "opacity-60"
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



// "use client";
// import React, { useState,useEffect } from "react";
// import {
//   CopilotKit,
//   CopilotChat,
//   CopilotSidebar,
//   CopilotPopup,
//   useFrontendTool,
//   UseAgentUpdate,
//   useAgent,
//   useComponent,
//   useDefaultRenderTool,
//   useCopilotChatConfiguration,
//   useAgentContext,
//   useCopilotKit,
//   useRenderToolCall,
//   useRenderActivityMessage,
//   useHumanInTheLoop,
// } from "@copilotkit/react-core/v2";
// import { CopilotKitCSSProperties } from "@copilotkit/react-ui";
// import "./theme.css";
// import { Canvas } from "./Canvas";
// import { IndexLineChart } from "./ba";
// import { CustomCatchallRenderer, type CatchallToolStatus } from "./custom-catchall-renderer";
// import { z } from "zod";
// import { TimePickerCard } from "./time-picker-card";
// // import { myCatalog } from "./catalog";
// import { catalog } from "./catalog";
// const AGENT_ID = "my_agent";
// //import AgentDashboard from "./AgentDashboard";    
// // import { Background, DEFAULT_BACKGROUND } from "./background";
// // import { useFrontendToolsSuggestions } from "./suggestions";
// // Define the agent state type, should match the actual state of your agent
// type AgentState = {
//   language: "english" | "spanish";
// }
// type Preferences = {
//   [key: string]: any;
// };
// type RWAgentState = {
//   preferences?: Preferences;
//   notes?: string[];
//   [key: string]: any;
// };
// //  import { BarChart, barChartPropsSchema } from "./bar-chart";
// //  import { PieChart, pieChartPropsSchema } from "./pie-chart";
// //============STATE RENDERING================
// export default function Page() {
//   // const { agent } = useAgent({
//   //   agentId: "my_agent",
//   //   updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
//   // });

//   const [userName] = useState("Atai");
//   const [userTimezone] = useState("America/Los_Angeles");
//   const [recentActivity] = useState(["Activity 1", "Activity 2"]);
//   // const { agent } = useAgent({ agentId: "my_agent" });
//   const { copilotkit } = useCopilotKit();
//   const renderToolCall = useRenderToolCall();
//   const { renderActivityMessage } = useRenderActivityMessage();
//   const [input, setInput] = useState("");

//   const send = (text: string) => {
//     const trimmed = text.trim();
//     if (!trimmed || agent.isRunning) return;
//     agent.addMessage({
//       id: crypto.randomUUID(),
//       role: "user",
//       content: trimmed,
//     });
//     setInput("");
//     void copilotkit.runAgent({ agent }).catch((err) => {
//       // The Headless Simple demo is the canonical "two hooks, your
//       // design system" example users copy-paste as a starting point.
//       // Silently swallowing errors here would model broken practice;
//       // log so a network failure / runtime error / transport disconnect
//       // surfaces in the console for the developer.
//       console.error("[google-adk:headless-simple] runAgent failed", err);
//     });
//   };
//   useAgentContext({
//     description: "The currently logged-in user's display name",
//     value: userName,
//   });

//   useAgentContext({
//     description: "The user's IANA timezone (used when mentioning times)",
//     value: userTimezone,
//   });

//   useAgentContext({
//     description: "The user's recent activity in the app, newest first",
//     value: recentActivity,
//   });

// //  useEffect(() => {
// //     agent.setState({
// //       title: "My Project",
// //     });
// //   }, []);
//   // const agentState = agent.state as RWAgentState | undefined;

//   // const handlePreferencesChange = (next: Preferences) => {
//   //   agent.setState({
//   //     ...(agentState as object | undefined),
//   //     preferences: next,
//   //     notes: agentState?.notes ?? [],
//   //   } as RWAgentState);
//   // };
//   // const { agent } = useAgent({
//   //   agentId: "my_agent",
//   // });
//   //  const toggleLanguage = () => {
//   //   agent.setState({ language: agent.state?.language === "english" ? "spanish" : "english" });
//   // };
  
//   const [background, setBackground] = useState<string>("#ffffff");
//   const config = useCopilotChatConfiguration();

//   useFrontendTool({
//     name: "change_background",
//     description:
//       "Change the page background. Accepts any valid CSS background value — colors, linear or radial gradients, etc.",
//     parameters: z.object({
//       background: z
//         .string()
//         .describe("The CSS background value. Prefer gradients."),
//     }),
//     handler: async ({ background }) => {
//       setBackground(background);
//       if (typeof document !== "undefined") {
//         document.body.style.background = background;
//       }
//       return { status: "success" };
//     },
//   });
//   //   useDefaultRenderTool(
//   //   {
//   //     render: ({ name, parameters, status, result }) => (
//   //       <CustomCatchallRenderer
//   //         name={name}
//   //         parameters={parameters}
//   //         status={status as CatchallToolStatus}
//   //         result={result}
//   //       />
//   //     ),
//   //   },
//   //   [],
//   // );

//  useComponent({
//     name: "render_bar_chart",
//     description: "Display a bar chart with labeled numeric values.",
//     render: IndexLineChart,
//   });
 
//   // const visible = (agent.messages ?? []).filter(
//   //   (m) => m.role === "user" || m.role === "assistant"
//   // );

//   // const messages = agent.messages ?? [];

//   // const toolMessagesByCallId = new Map<string, any>();
//   // for (const m of messages) {
//   //   if (m.role === "tool" || m.role === "activity") {
//   //     const callId = (m as any).toolCallId || (m as any).tool_call_id;
//   //     if (callId) {
//   //       toolMessagesByCallId.set(callId, m);
//   //     }
//   //   }
//   // }
 
//   return (
// <div>
//       <h1>canvas</h1>

//       {/* {messages.map((m) => {
//         if (m.role === "user") {
//           // Cast through the local input shape — UserBubble accepts a
//           // simplified version of the ag-ui content union.
//           return (
//             <UserBubble
//               key={m.id}
//               content={m.content as Parameters<typeof UserBubble>[0]["content"]}
//             />
//           );
//         }

//         if (m.role === "assistant") {
//           const toolCalls =
//             "toolCalls" in m && Array.isArray(m.toolCalls) ? m.toolCalls : [];
//           return (
//             <AssistantBubble
//               key={m.id}
//               content={typeof m.content === "string" ? m.content : undefined}
//             >
//               {toolCalls.map((tc) => {
//                 const toolMessage = toolMessagesByCallId.get(tc.id);
//                 const node = renderToolCall({
//                   toolCall: tc,
//                   toolMessage,
//                 });
//                 return node ? <div key={tc.id}>{node}</div> : null;
//               })}
//             </AssistantBubble>
//           );
//         }

//         if (m.role === "activity") {
//           const node = renderActivityMessage(m);
//           if (!node) return null;
//           return <ActivityWrapper key={m.id}>{node}</ActivityWrapper>;
//         }

//         return null;
//       })} */}
//           {/* <Canvas/> */}
//           {/* // <div style={{ background, minHeight: "100vh", transition: "background 0.5s ease", padding: "2rem" }}> */}

// {/* OPEN and CLose*/}    
//     {/* <CopilotChat
//   messageView={{
//     assistantMessage: {
//       onThumbsUp: (message) => {
// console.log("feedback", {
//   messageId: message.id,
//   value: "up",
// });      },
//       onThumbsDown: (message) => {
// console.log("feedback", {
//   messageId: message.id,
//   value: "down",
// });      },
//     },
//   }}
// />; */}



// {/* <CopilotPopup
//         agentId="my_agent"
//         defaultOpen={true}
//         labels={{
//           chatInputPlaceholder: "Ask the popup anything...",
//         }}
//       /> */}
//  <h1>Your main content</h1>
//       {/* <p>Language: {agent.state?.language}</p>
//             <button onClick={toggleLanguage}>Toggle Language</button> */}

//       {config?.setModalOpen && (
//         <button
//           onClick={() => config.setModalOpen!(!config.isModalOpen)}
//           style={{
//             padding: "10px 20px",
//             borderRadius: "8px",
//             border: "none",
//             backgroundColor: "#c44a1f",
//             color: "white",
//             cursor: "pointer",
//             fontWeight: "bold",
//           }}
//         >
//           {config.isModalOpen ? "Close chat" : "Open chat"}
//         </button>
//       )}
      
//           <CopilotKit
//       runtimeUrl="/api/copilotkit"
//       agent="SharedStateStreamingAgent"
//       a2ui={{ catalog: catalog }}
//     >
//       <div className="flex justify-center items-center h-screen w-full">
//         <div className="h-full w-full max-w-4xl">
//  <CopilotSidebar />         </div>
//       </div>
//     </CopilotKit>
//       {/* <CopilotSidebar /> */}

// {/* Customization */}
// {/* <div
//   style={
//     {
//       "--copilot-kit-primary-color": "#222222",
//     } as CopilotKitCSSProperties
//   }
// >
//   <CopilotSidebar />
// </div> */}
// {/* <CopilotChat
//   labels={{
//     chatInputPlaceholder: "Ask your agent anything...",
//     welcomeMessageText: "How can I help you today?",
//     chatDisclaimerText: "AI responses may be inaccurate.",
//   }}
// /> */}
// {/* MultiModal attachments */}


// {/* <CopilotChat
//   attachments={{
//     enabled: true,
//     accept: "image/*",              
//     maxSize: 10 * 1024 * 1024,      // 10MB limit (default: 20MB)
//   }}
// />
//  */}
 
//     </div>
//   );
// }

// // function Chat() {
// //   return <CopilotChat agentId="my_agent" />;
// // }

// // Component as tool
// // function Chat() {
// //  useComponent({
// //     name: "render_bar_chart",
// //     description: "Display a bar chart with labeled numeric values.",
// //     render: IndexLineChart,
// //   });
// // }


// //===================Slots==============================
// // const CustomMessageView = ({ messages, isRunning }) => (
// //   <div className="space-y-4 p-6">
// //     {messages?.map((msg) => (
// //       <div key={msg.id} className={msg.role === "user" ? "text-right" : "text-left"}>
// //         {msg.content}
// //       </div>
// //     ))}
// //     {isRunning && <div className="animate-pulse">Thinking...</div>}
// //   </div>
// // );
// // export function Chat() {
// //   return <CopilotChat messageView={CustomMessageView} />;
// // }

// //=================PAUSING AGENTS================
// // function Chat() {

// //   useHumanInTheLoop({
// //     agentId: "my_agent",
// //     name: "schedule_meeting",
// //     description:
// //       "Ask the user to pick a meeting time. The picker renders inline in " +
// //       "the chat; the chosen slot is returned to the agent so it can confirm.",
// //     parameters: z.object({
// //       topic: z
// //         .string()
// //         .describe("What the meeting is about (e.g. 'Intro with sales')"),
// //       attendee: z
// //         .string()
// //         .optional()
// //         .describe("Who the meeting is with (e.g. 'Alice')"),
// //     }),
// //     render: ({ args, respond }: any) => {

// //       const topic = (args?.topic as string | undefined) ?? "a call";
// //       const attendee = args?.attendee as string | undefined;
// //       return (
// //         <TimePickerCard
// //           topic={topic}
// //           attendee={attendee}
// //           onSubmit={(result) => respond?.(result)}
// //         />
// //       );
// //     },
// //   });
// //   return (
// //     <CopilotChat  className="h-full rounded-2xl" />
// //   );
// // }

// //=================Headless================= 
// // function UserBubble({ content }: { content: any }) {
// //   let text = "";
// //   if (typeof content === "string") {
// //     text = content;
// //   } else if (Array.isArray(content)) {
// //     text = content.map((c: any) => (typeof c === "string" ? c : c?.text ?? "")).join("");
// //   } else if (content && typeof content === "object") {
// //     text = content.text ?? JSON.stringify(content);
// //   }
// //   return (
// //     <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
// //       <div
// //         style={{
// //           maxWidth: "72%",
// //           background: "#0070f3",
// //           color: "#fff",
// //           borderRadius: "18px 18px 4px 18px",
// //           padding: "10px 16px",
// //           fontSize: "14px",
// //           lineHeight: "1.55",
// //           wordBreak: "break-word",
// //         }}
// //       >
// //         {text}
// //       </div>
// //     </div>
// //   );
// // }

// // function AssistantBubble({
// //   content,
// //   children,
// // }: {
// //   content?: string;
// //   children?: React.ReactNode;
// // }) {
// //   return (
// //     <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px" }}>
// //       <div style={{ maxWidth: "78%" }}>
// //         {children}
// //         {content && (
// //           <div
// //             style={{
// //               background: "#f1f1f1",
// //               borderRadius: "4px 18px 18px 18px",
// //               padding: "10px 16px",
// //               fontSize: "14px",
// //               lineHeight: "1.6",
// //               whiteSpace: "pre-wrap",
// //               wordBreak: "break-word",
// //             }}
// //           >
// //             {content}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }


// // function ActivityWrapper({ children }: { children: React.ReactNode }) {
// //   return (
// //     <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px" }}>
// //       <div style={{
// //         maxWidth: "78%",
// //         background: "#f8fafc",
// //         border: "1px solid #e2e8f0",
// //         borderRadius: "8px",
// //         padding: "8px 12px",
// //         fontSize: "13px",
// //         color: "#64748b",
// //         fontFamily: "monospace",
// //       }}>
// //         {children}
// //       </div>
// //     </div>
// //   );
// // }
 



