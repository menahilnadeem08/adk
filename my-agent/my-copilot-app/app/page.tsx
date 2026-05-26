// "use client";
// import React, { useState } from "react";
// import {
//   CopilotKit,
//   CopilotChat,
//   CopilotSidebar,
//   CopilotPopup,
//   useFrontendTool,
//   UseAgentUpdate,
//   useAgent
// } from "@copilotkit/react-core/v2";
// import { z } from "zod";
// //import { Background, DEFAULT_BACKGROUND } from "./background";
// //import { useFrontendToolsSuggestions } from "./suggestions";
// // Define the agent state type, should match the actual state of your agent
// // type AgentState = {
// //   language: "english" | "spanish";
// // }
// //============STATE RENDERING================
// // export default function Page() {
// //   const { agent } = useAgent({
// //     agentId: "my_agent",
// //     updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
// //   });

//   // const { agent } = useAgent({
//   //   agentId: "my_agent",
//   //   initialState: { language: "english" }  // optionally provide an initial state
//   // });
//   // const toggleLanguage = () => {
//   //   agent.setState({ language: agent.state?.language === "english" ? "spanish" : "english" });
//   // };
//   return (
//     //====CHAT=================
//     // <CopilotKit runtimeUrl="/api/copilotkit" agent="agentic_chat">
//     //   <Chat />
//     // </CopilotKit>
//     //====SIDEBAR=================
//     //    <CopilotKit runtimeUrl="/api/copilotkit" agent="my_agent">
//     //   <CopilotSidebar agentId="my_agent" defaultOpen={true} />
//     // </CopilotKit>
//     //====POPUP=================
//     //   <CopilotKit runtimeUrl="/api/copilotkit" agent="my_agent">
//     //   <CopilotPopup
//     //     agentId="my_agent"
//     //     defaultOpen={true}
//     //     labels={{
//     //       chatInputPlaceholder: "Ask the popup anything...",
//     //     }}
//     //   />
//     // </CopilotKit>
//     //====FRONTEND TOOL =================
//     /* <CopilotKit runtimeUrl="/api/copilotkit" agent="my_agent">
//       <Chat />
//     </CopilotKit> */

//     <div>
//       {/* <h1>Your main content</h1>
//       <p>Language: {agent.state?.language}</p>
//        <button onClick={toggleLanguage}>Toggle Language</button> */}

//       <CopilotSidebar />
//     </div>


//   );
// }

// // function Chat() {
// //   return <CopilotChat agentId="agentic_chat" />;
// // }

// //Frontend 
// // function Chat() {
// //   const [background, setBackground] = useState<string>(DEFAULT_BACKGROUND);
// //   useFrontendTool({
// //     name: "change_background",
// //     description:
// //       "Change the page background. Accepts any valid CSS background value — colors, linear or radial gradients, etc.",
// //     parameters: z.object({
// //       background: z
// //         .string()
// //         .describe("The CSS background value. Prefer gradients."),
// //     }),
// //     handler: async ({ background }) => {
// //       setBackground(background);
// //       return { status: "success" };
// //     },
// //   });
// // }

//TOOL RENDERING
// import React from "react";
// import {
//   CopilotChat,
//   CopilotKit,
//   useComponent,
// } from "@copilotkit/react-core/v2";
// import { BarChart, barChartPropsSchema } from "./bar-chart";
// import { PieChart, pieChartPropsSchema } from "./pie-chart";
// import { useSuggestions } from "./suggestions";

// export default function ControlledGenUiDemo() {
//   return (
//     <CopilotKit runtimeUrl="/api/copilotkit" agent="gen-ui-tool-based">
//       <Chat />
//     </CopilotKit>
//   );
// }

// function Chat() {
//   useComponent({
//     name: "render_bar_chart",
//     description: "Display a bar chart with labeled numeric values.",
//     parameters: barChartPropsSchema,
//     render: BarChart,
//   });
// }

//TOOL CALL RENDERING
// import React from "react";
// import {
//   CopilotKit,
//   CopilotChat,
//   useRenderTool,
//   useDefaultRenderTool,
// } from "@copilotkit/react-core/v2";
// import { z } from "zod";
// import { WeatherCard } from "./weather-card";
// import { FlightListCard, type Flight } from "./flight-list-card";
// import { StockCard } from "./stock-card";
// import { D20Card } from "./d20-card";
// import {
//   CustomCatchallRenderer,
//   type CatchallToolStatus,
// } from "./custom-catchall-renderer";
// import { parseJsonResult } from "../_shared/parse-json-result";
// import { useSuggestions } from "./suggestions";

// interface WeatherResult {
//   city?: string;
//   temperature?: number;
//   humidity?: number;
//   wind_speed?: number;
//   conditions?: string;
// }

// interface FlightSearchResult {
//   origin?: string;
//   destination?: string;
//   flights?: Flight[];
// }

// interface StockResult {
//   ticker?: string;
//   price_usd?: number;
//   change_pct?: number;
// }

// interface D20Result {
//   value?: number;
//   result?: number;
//   sides?: number;
// }

// export default function ToolRenderingDemo() {
//   return (
//     <CopilotKit runtimeUrl="/api/copilotkit" agent="tool-rendering">
//       <div className="flex justify-center items-center h-screen w-full">
//         <div className="h-full w-full max-w-4xl">
//           <Chat />
//         </div>
//       </div>
//     </CopilotKit>
//   );
// }

// function Chat() {
//   // Per-tool renderer #1: get_weather → branded WeatherCard.
//   useRenderTool(
//     {
//       name: "get_weather",
//       parameters: z.object({
//         location: z.string(),
//       }),
//       render: ({ parameters, result, status }) => {
//         const loading = status !== "complete";
//         const parsed = parseJsonResult<WeatherResult>(result);
//         return (
//           <WeatherCard
//             loading={loading}
//             location={parameters?.location ?? parsed.city ?? ""}
//             temperature={parsed.temperature}
//             humidity={parsed.humidity}
//             windSpeed={parsed.wind_speed}
//             conditions={parsed.conditions}
//           />
//         );
//       },
//     },
//     [],
//   );}