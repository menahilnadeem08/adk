// "use client"
// import { useCallback, useState } from "react";
// import { useAgent, useCopilotKit, useAttachmentsConfig, useAutoScroll, buildContent } from "@copilotkit/react-core/v2";

// export default function AgentDashboard() {
//   const { agent } = useAgent({ agentId:"my_agent" });
//   const { copilotkit } = useCopilotKit();

//   const {
//     attachments,
//     fileInputRef,
//     containerRef,
//     handleFileUpload,
//     handleDragOver,
//     handleDragLeave,
//     handleDrop,
//     dragOver,
//     removeAttachment,
//     consumeAttachments,
//   } = useAttachmentsConfig();

//   const [input, setInput] = useState("");
//   const messages = agent.messages;
//   const { listRef, bottomRef, stickRef } = useAutoScroll(
//     messages,
//     agent.isRunning,
//   );

//   // Send pipeline: consume any ready attachments at submit time, build
//   // the multimodal `content` array if needed, then dispatch the run.
//   const sendText = useCallback(
//     (text: string) => {
//       const trimmed = text.trim();
//       // Consume queued uploads first so they get sent even if the user
//       // didn't type any text alongside them.
//       const ready = consumeAttachments();
//       if (!trimmed && ready.length === 0) return;
//       if (agent.isRunning) return;

//       stickRef.current = true;

//       const content = buildContent(trimmed, ready);
//       agent.addMessage({
//         id: crypto.randomUUID(),
//         role: "user",
//         content,
//       });
//       void copilotkit
//         .runAgent({ agent })
//         .catch((err) =>
//           console.error("[headless-complete] runAgent failed", err),
//         );
//     },
//     [agent, copilotkit, consumeAttachments, stickRef],
//   );

//   const handleSend = useCallback(() => {
//     sendText(input);
//     setInput("");
//   }, [input, sendText]);

//   const handleSuggestion = useCallback(
//     (text: string) => {
//       sendText(text);
//     },
//     [sendText],
//   );

//   const handleReset = useCallback(() => {
//     if (agent.isRunning) {
//       try {
//         agent.abortRun();
//       } catch {
//         // no-op: some transports don't support abort
//       }
//     }
//     agent.setMessages([]);
//     setInput("");
//     stickRef.current = true;
//   }, [agent, stickRef]);

//   return null;
// }

