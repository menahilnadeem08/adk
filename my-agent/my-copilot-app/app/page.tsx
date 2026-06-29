// "use client";

// import React from "react";
// import {
//   CopilotSidebar,
//   CopilotKit,
//   useAgent,
//   UseAgentUpdate,
//   useRenderTool,
// } from "@copilotkit/react-core/v2";
// import { z } from "zod";

// import { Delegation, DelegationLog } from "./delegation-log.tsx";

// interface SubagentsAgentState {
//   delegations?: Delegation[];
// }


// export default function Page() {
//   const { agent } = useAgent({
//     agentId: "my_agent",
//     updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
//   });


//   const agentState = agent.state as SubagentsAgentState | undefined;
//   const delegations = agentState?.delegations ?? [];
//   const isRunning = agent.isRunning;


//   return (
//     <>
//     <DelegationLog
//       delegations={delegations}
//       isRunning={isRunning}
//     />
//     <CopilotSidebar />
//     </>
//   );
// }
// ====================State streaming====================
// "use client";

// import React from "react";
// import {
//   CopilotKit,
//   useAgent,
//   UseAgentUpdate,
//   CopilotSidebar,
// } from "@copilotkit/react-core/v2";

// import { DocumentView } from "./demo-layout.tsx";

// interface StreamingAgentState {
//   document?: string;
// }

// export default function SharedStateStreamingDemo() {
//   return (
//     <CopilotKit runtimeUrl="/api/copilotkit" agent="my_agent">
//       <DemoContent />
//     </CopilotKit>
//   );
// }

// function DemoContent() {
//   // Subscribe to BOTH state changes and run-status changes. The former
//   // drives the per-token document rerender; the latter toggles the
//   // "LIVE" badge when the agent starts / stops.
//   const { agent } = useAgent({
//     agentId: "my_agent",
//     updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
//   });


//   const agentState = agent.state as StreamingAgentState | undefined;
//   const document = agentState?.document ?? "";
//   const isRunning = agent.isRunning;

//   return (
//     <>
//       <CopilotSidebar />
//       <DocumentView content={document} isStreaming={isRunning} />
//     </>
//   );
// } 
//=========/agent-readonly=========
// "use client";

// import React, { useState } from "react";
// import {
//   CopilotKit,
//   CopilotPopup,
//   useAgentContext,
// } from "@copilotkit/react-core/v2";

// import { ACTIVITIES, DemoLayout } from "./demo-layout";
// import { useReadonlyStateAgentContextSuggestions } from "./suggestions";

// export default function ReadonlyStateAgentContextDemo() {
//   return (
//     <CopilotKit
//       runtimeUrl="/api/copilotkit"
//       agent="readonly-state-agent-context"
//     >
//       <DemoContent />
//       <CopilotPopup
//         agentId="readonly-state-agent-context"
//         defaultOpen={true}
//         labels={{ chatInputPlaceholder: "Ask about your context..." }}
//       />
//     </CopilotKit>
//   );
// }

// function DemoContent() {
//   const [userName, setUserName] = useState("Atai");
//   const [userTimezone, setUserTimezone] = useState("America/Los_Angeles");
//   const [recentActivity, setRecentActivity] = useState<string[]>([
//     ACTIVITIES[0],
//     ACTIVITIES[2],
//   ]);

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

//   useReadonlyStateAgentContextSuggestions();

//   const toggleActivity = (activity: string) => {
//     setRecentActivity((prev) =>
//       prev.includes(activity)
//         ? prev.filter((a) => a !== activity)
//         : [...prev, activity],
//     );
//   };

//   return (
//     <DemoLayout
//       userName={userName}
//       userTimezone={userTimezone}
//       recentActivity={recentActivity}
//       onUserNameChange={setUserName}
//       onUserTimezoneChange={setUserTimezone}
//       onToggleActivity={toggleActivity}
//     />
//   );
// }
"use client"
import { CopilotSidebar, useAgent, UseAgentUpdate } from "@copilotkit/react-core/v2"; 
import { NotesCard } from "./Notes.tsx"

interface NotesAgentState {
  notes?: string[];
}

export default function Page() {
  const { agent } = useAgent({
    agentId: "my_agent",
    updates: [UseAgentUpdate.OnStateChanged],
  });

  const agentState = agent.state as NotesAgentState | undefined;
  const notes = agentState?.notes ?? [];

  const handleClear = () => {
    agent.setState({
      ...agentState,
      notes: [],
    });
  };

  return (
    <main className="min-h-screen bg-radial from-[#F5F7FA] to-[#E4E8F0] dark:from-[#0F1115] dark:to-[#171921] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-xl space-y-8 animate-fade-in">
        {/* Premium Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Agent Connected
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 tracking-tight">
            Co-Pilot Workspace
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Interact with the agent in the sidebar. Its thoughts and observations will stream live on the scratchpad below.
          </p>
        </div>

        {/* Card Wrapper with premium shadow and border */}
        <div className="relative group transition-all duration-300">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-10 blur group-hover:opacity-15 transition-opacity duration-300" />
          <div className="relative bg-white dark:bg-[#1E222B] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden p-1">
            <NotesCard notes={notes} onClear={handleClear} />
          </div>
        </div>
      </div>

      <CopilotSidebar />
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
 



