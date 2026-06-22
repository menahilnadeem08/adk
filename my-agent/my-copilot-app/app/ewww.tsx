// "use client";
// import React, { useState } from "react";

// import {
//   CopilotKit,
//   CopilotPopup,
//   useAgentContext,
// } from "@copilotkit/react-core/v2";

// export default function ReadonlyStateAgentContextDemo() {
//   return (
//     <CopilotKit
//       runtimeUrl="/api/copilotkit"
//       agent="my_agent"
//     >
//       <DemoContent />
//       <CopilotPopup
//         defaultOpen={true}
//         labels={{ chatInputPlaceholder: "Ask about your context..." }}
//       />
//     </CopilotKit>
//   );
// }

// function DemoContent() {
//   const [userName] = useState("Atai");
//   const [userTimezone] = useState("America/Los_Angeles");
//   const [recentActivity] = useState(["Activity 1", "Activity 2"]);

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

//   return <div>Chat is open — ask the agent anything.</div>;
// }
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
//   useAgentContext
// } from "@copilotkit/react-core/v2";
//      import { CopilotKitCSSProperties } from "@copilotkit/react-ui";
// import "./theme.css";
// import { Canvas } from "./Canvas";
// import { IndexLineChart } from "./ba";
// import { CustomCatchallRenderer, type CatchallToolStatus } from "./custom-catchall-renderer";
// import { z } from "zod";
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
//  const { agent } = useAgent({
//     agentId: "my_agent",
//     updates: [UseAgentUpdate.OnStateChanged],
//   });

//   const [userName] = useState("Atai");
//   const [userTimezone] = useState("America/Los_Angeles");
//   const [recentActivity] = useState(["Activity 1", "Activity 2"]);

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

//  useEffect(() => {
//     agent.setState({
//       title: "My Project",
//     });
//   }, []);
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
//     useDefaultRenderTool(
//     {
//       render: ({ name, parameters, status, result }) => (
//         <CustomCatchallRenderer
//           name={name}
//           parameters={parameters}
//           status={status as CatchallToolStatus}
//           result={result}
//         />
//       ),
//     },
//     [],
//   );

//  useComponent({
//     name: "render_bar_chart",
//     description: "Display a bar chart with labeled numeric values.",
//     render: IndexLineChart,
//   });
//   // const toggleLanguage = () => {
//   //   agent.setState({ language: agent.state?.language === "english" ? "spanish" : "english" });
//   // };

//   return (
// <div>
//       <h1>canvas</h1>


// <Canvas/>
//     {/*       // <div style={{ background, minHeight: "100vh", transition: "background 0.5s ease", padding: "2rem" }}>

    
//     <CopilotChat
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

//       <CopilotSidebar />

//     </div>
//   );
// }

// function Chat() {
//   return <CopilotChat agentId="my_agent" />;
// }

// Component as tool
// function Chat() {
//  useComponent({
//     name: "render_bar_chart",
//     description: "Display a bar chart with labeled numeric values.",
//     render: IndexLineChart,
//   });
// }




// Reasonging
"use client"
const AGENT_ID = "my_agent";
import {CopilotKit,CopilotChat} from "@copilotkit/react-core/v2"

export default function Page() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent={AGENT_ID}>
      <div className="flex justify-center items-center h-screen w-full">
        <div className="h-full w-full max-w-4xl">
          <Chat />
        </div>
      </div>
    </CopilotKit>
  );
}
function Chat() {
//  useReasoningDefaultSuggestions();
  return <CopilotChat agentId={AGENT_ID} className="h-full rounded-2xl" />;
}


//  "use client"
// import { CopilotKit } from "@copilotkit/react-core/v2";
// import { VoiceChat } from "./voice-chat";

// export default function VoiceDemoPage() {
//   return (
//     <CopilotKit
//       runtimeUrl="/api/copilotkit-voice"
//       agent="voice-demo"
//       useSingleEndpoint={false}
//       // The dev-only `<cpk-web-inspector>` overlay (auto-enabled on
//       // localhost via shouldShowDevConsole) intercepts pointer events
//       // on top of the voice sample-audio button, so dev/D5 probe runs
//       // can't click it through Playwright. Production isn't localhost
//       // so the inspector never mounts there — voice is D5 in prod and
//       // D4 locally for this reason alone. Disable explicitly here so
//       // the demo behaves the same in both environments.
//       enableInspector={false}
//     >
//       <VoiceChat />
//     </CopilotKit>
//   );
// }
// "use client";

// import { useState } from "react";
// import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

// // Define the agent state type, should match the actual state of your agent
// type AgentState = {
//     question: string;
//     answer: string;
// }

// /* Example usage in a pseudo React component */
// export default function Page() {
//     const [inputQuestion, setInputQuestion] = useState("What's the capital of France?");
//     const [isLoading, setIsLoading] = useState(false);

//     const { agent } = useAgent({
//         agentId: "my_agent",
//     });
//     const { copilotkit } = useCopilotKit();

//     const askQuestion = async (newQuestion: string) => {
//         setIsLoading(true);

//         // Update the state with the new question
//         agent.setState({ ...agent.state, question: newQuestion, answer: "" });

//         try {
//             // Add a message and trigger the agent to run
//             agent.addMessage({
//                 id: crypto.randomUUID(),
//                 role: "user",
//                 content: newQuestion,
//             });
//             await copilotkit.runAgent({ agent });
//         } catch (error) {
//             console.error("Error running agent:", error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
//             <h1>Q&A Assistant</h1>

//             <div style={{ marginBottom: "1rem" }}>
//                 <input
//                     type="text"
//                     value={inputQuestion}
//                     onChange={(e) => setInputQuestion(e.target.value)}
//                     placeholder="Enter your question..."
//                     style={{
//                         padding: "0.5rem",
//                         width: "300px",
//                         marginRight: "0.5rem",
//                         borderRadius: "4px",
//                         border: "1px solid #ccc"
//                     }}
//                 />
//                 <button
//                     onClick={() => askQuestion(inputQuestion)}
//                     disabled={isLoading || !inputQuestion.trim()}
//                     style={{
//                         padding: "0.5rem 1rem",
//                         borderRadius: "4px",
//                         border: "none",
//                         backgroundColor: isLoading ? "#ccc" : "#0070f3",
//                         color: "white",
//                         cursor: isLoading ? "not-allowed" : "pointer"
//                     }}
//                 >
//                     {isLoading ? "Thinking..." : "Ask Question"}
//                 </button>
//             </div>

//             <div style={{ marginTop: "1.5rem" }}>
//                 <p><strong>Question:</strong> {agent.state?.question || "(none yet)"}</p>
//                 <p><strong>Answer:</strong> {agent.state?.answer || (isLoading ? "Thinking..." : "Waiting for question...")}</p>
//             </div>
//         </div>
//     );
// }

// "use client";

// import {
//   CopilotKit,
//   CopilotSidebar,
//   useAgent,
// } from "@copilotkit/react-core/v2";

// // ...
// type AgentState = {
//     observed_steps: string[];
// };

// const Page = () => {
//     // Get access to both predicted and final states
//     const { agent } = useAgent({ agentId: "my_agent" });

//     // Add a state renderer to observe predictions
//     useAgent({
//         agentId: "my_agent",
//         render: ({ state }) => {
//             if (!state.observed_steps?.length) return null;
//             return (
//                 <div>
//                     <h3>Current Progress:</h3>
//                     <ul>
//                         {state.observed_steps.map((step, i) => (
//                             <li key={i}>{step}</li>
//                         ))}
//                     </ul>
//                 </div>
//             );
//         },
//     });

//     return (
//         <div>
//             <h1>Agent Progress</h1>
//             {agent.state?.observed_steps?.length > 0 && (
//                 <div>
//                     <h3>Final Steps:</h3>
//                     <ul>
//                         {agent.state.observed_steps.map((step, i) => (
//                             <li key={i}>{step}</li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//         <CopilotSidebar/>
//         </div>
        
//     )
// }
// export default Page;