"use client";

import React from "react";

export interface DocumentViewProps {
  /** Current document text. Grows token-by-token while the agent is streaming. */
  content: string;
  /** True while the agent is actively running. Used to show a live indicator. */
  isStreaming: boolean;
}

/**
 * Live document panel — renders the `document` slot of agent state.
 *
 * On every streamed token, the parent re-renders this component with a
 * longer `content` string. We surface:
 *
 *   - a "LIVE" badge + blinking cursor while the agent is running
 *   - the current character count (a cheap but visible token-ish counter)
 *   - the growing document text
 *
 * Together they make the per-token delta stream obvious to a viewer.
 */
export function DocumentView({ content, isStreaming }: DocumentViewProps) {
  const charCount = content.length;

  return (
    <div
      data-testid="document-view"
      className="w-full h-full flex flex-col bg-white rounded-2xl shadow-sm border border-[#DBDBE5] overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#E9E9EF] bg-[#FAFAFC]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#010507]">Document</span>
          {isStreaming && (
            <span
              data-testid="document-live-badge"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FA5F67] text-white text-[10px] font-semibold uppercase tracking-[0.14em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
          )}
        </div>
        <span
          data-testid="document-char-count"
          className="text-xs text-[#838389] font-mono"
        >
          {charCount} chars
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {content.length === 0 && !isStreaming ? (
          <p className="text-[#838389] italic">
            Ask the agent to write something — its output will stream here token
            by token.
          </p>
        ) : (
          <div
            data-testid="document-content"
            className="whitespace-pre-wrap text-[#010507] leading-relaxed font-serif"
          >
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-[#010507] ml-0.5 align-text-bottom animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
// "use client";

// import React from "react";
// import { CopilotSidebar } from "@copilotkit/react-core/v2";
// import { AgentConfig } from "./use-agent-config";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card";
// import { Button } from "./components/button";

// export interface DemoLayoutProps {
//   config: AgentConfig;
//   onToneChange: (tone: string) => void;
//   onExpertiseChange: (expertise: string) => void;
//   onResponseLengthChange: (length: string) => void;
// }

// export function DemoLayout({
//   config,
//   onToneChange,
//   onExpertiseChange,
//   onResponseLengthChange,
// }: DemoLayoutProps) {
//   const tones = ["professional", "casual", "enthusiastic"];
//   const expertises = ["beginner", "intermediate", "expert"];
//   const lengths = ["concise", "detailed"];

//   return (
//     <main className="min-h-screen bg-radial from-[#F0F4F8] to-[#D9E2EC] dark:from-[#0B0F19] dark:to-[#10141D] flex flex-col items-center justify-center p-6 transition-colors duration-300">
//       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
//         {/* Left Side: Title and Controls */}
//         <div className="md:col-span-2 space-y-6">
//           <div className="space-y-2">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase">
//               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
//               Dynamic Context Relay
//             </div>
//             <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:to-neutral-400">
//               Agent Config Workspace
//             </h1>
//             <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
//               Toggle the knobs below. The selected preferences are dynamically injected into the agent's system directives on every turn.
//             </p>
//           </div>

//           <Card className="border border-neutral-200/80 dark:border-neutral-800 shadow-lg dark:bg-[#161B22]">
//             <CardHeader>
//               <CardTitle className="text-lg">Behavior Control Panel</CardTitle>
//               <CardDescription>Adjust the knobs to tune the model's persona.</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Tone Knob */}
//               <div className="space-y-2">
//                 <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
//                   Tone
//                 </label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {tones.map((t) => {
//                     const active = config.tone === t;
//                     return (
//                       <Button
//                         key={t}
//                         onClick={() => onToneChange(t)}
//                         variant={active ? "primary" : "secondary"}
//                         className={`capitalize transition-all duration-200 ${
//                           active ? "shadow-md scale-[1.02]" : "opacity-80 hover:opacity-100"
//                         }`}
//                       >
//                         {t}
//                       </Button>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Expertise Knob */}
//               <div className="space-y-2">
//                 <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
//                   Expertise Level
//                 </label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {expertises.map((exp) => {
//                     const active = config.expertise === exp;
//                     return (
//                       <Button
//                         key={exp}
//                         onClick={() => onExpertiseChange(exp)}
//                         variant={active ? "primary" : "secondary"}
//                         className={`capitalize transition-all duration-200 ${
//                           active ? "shadow-md scale-[1.02]" : "opacity-80 hover:opacity-100"
//                         }`}
//                       >
//                         {exp}
//                       </Button>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Response Length Knob */}
//               <div className="space-y-2">
//                 <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
//                   Response Depth
//                 </label>
//                 <div className="grid grid-cols-2 gap-2">
//                   {lengths.map((len) => {
//                     const active = config.responseLength === len;
//                     return (
//                       <Button
//                         key={len}
//                         onClick={() => onResponseLengthChange(len)}
//                         variant={active ? "primary" : "secondary"}
//                         className={`capitalize transition-all duration-200 ${
//                           active ? "shadow-md scale-[1.02]" : "opacity-80 hover:opacity-100"
//                         }`}
//                       >
//                         {len}
//                       </Button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Side: Live Summary */}
//         <div className="space-y-6">
//           <Card className="border border-neutral-200/80 dark:border-neutral-800 shadow-lg dark:bg-[#161B22] overflow-hidden relative group">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-5 blur group-hover:opacity-10 transition-opacity duration-300" />
//             <CardHeader className="relative">
//               <CardTitle className="text-sm font-semibold tracking-wider uppercase text-blue-500 dark:text-blue-400">
//                 Live State
//               </CardTitle>
//               <CardDescription>Directives sent to agent context</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4 relative">
//               <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 space-y-3 font-mono text-xs">
//                 <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800/60">
//                   <span className="text-neutral-400">tone:</span>
//                   <span className="text-blue-600 dark:text-blue-400 font-bold capitalize">
//                     {config.tone}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800/60">
//                   <span className="text-neutral-400">expertise:</span>
//                   <span className="text-purple-600 dark:text-purple-400 font-bold capitalize">
//                     {config.expertise}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-neutral-400">responseLength:</span>
//                   <span className="text-green-600 dark:text-green-400 font-bold capitalize">
//                     {config.responseLength}
//                   </span>
//                 </div>
//               </div>

//               <div className="text-center text-xs text-neutral-400 dark:text-neutral-500">
//                 Open the Copilot Sidebar to chat and verify the styles.
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       <CopilotSidebar />
//     </main>
//   );
// }