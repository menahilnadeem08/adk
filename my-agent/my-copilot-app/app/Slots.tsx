<CopilotChat
  messageView={{
    className: "my-custom-messages",
    "data-testid": "message-view",
  }}
  input={{ autoFocus: true }}
/>
import { CopilotChat } from "@copilotkit/react-core/v2";

const CustomMessageView = ({ messages, isRunning }) => (
  <div className="space-y-4 p-6">
    {messages?.map((msg) => (
      <div
        key={msg.id}
        className={msg.role === "user" ? "text-right" : "text-left"}
      >
        {msg.content}
      </div>
    ))}
    {isRunning && <div className="animate-pulse">Thinking...</div>}
  </div>
);

export function Chat() {
  return (
    <CopilotChat messageView={CustomMessageView} />
  );
}
<CopilotChat
  labels={{
    chatInputPlaceholder: "Ask your agent anything...",
    welcomeMessageText: "How can I help you today?",
    chatDisclaimerText: "AI responses may be inaccurate.",
  }}
/>