import { useAgent } from "@copilotkit/react-core/v2";
import { useCopilotKit } from "@copilotkit/react-core/v2";
import { renderToolCall } from "@copilotkit/react-ui";
import { useState } from "react";

function UserBubble({ content }: { content: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
            <div
                style={{
                    maxWidth: "72%",
                    background: "#0070f3",
                    color: "#fff",
                    borderRadius: "18px 18px 4px 18px",
                    padding: "10px 16px",
                    fontSize: "14px",
                    lineHeight: "1.55",
                    wordBreak: "break-word",
                }}
            >
                {content}
            </div>
        </div>
    );
}

function AssistantBubble({ content }: { content: string }) {
    const msg = content as any;
    const toolCalls = msg?.toolCalls ?? [];
    const text: string = typeof content === "string" ? content : msg?.text ?? "";

    return (
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px" }}>
            <div style={{ maxWidth: "78%" }}>
                {toolCalls.map((tc: any) =>
                    renderToolCall({ toolCall: tc })
                )}
                {text && (
                    <div
                        style={{
                            background: "#f1f1f1",
                            borderRadius: "4px 18px 18px 18px",
                            padding: "10px 16px",
                            fontSize: "14px",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Chat() {
    const { agent } = useAgent({ agentId: "headless-simple" });
    const { copilotkit } = useCopilotKit();
    const [input, setInput] = useState("");

    const send = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || agent.isRunning) return;
        agent.addMessage({
            id: crypto.randomUUID(),
            role: "user",
            content: trimmed,
        });
        setInput("");
        void copilotkit.runAgent({ agent }).catch((err) => {
            // The Headless Simple demo is the canonical "two hooks, your
            // design system" example users copy-paste as a starting point.
            // Silently swallowing errors here would model broken practice;
            // log so a network failure / runtime error / transport disconnect
            // surfaces in the console for the developer.
            console.error("[google-adk:headless-simple] runAgent failed", err);
        });
    };

    const visible = (agent.messages ?? []).filter(
        (m) => m.role === "user" || m.role === "assistant"
    );

    return (
        <div>
            <div>
                {visible.map((m) =>
                    m.role === "user" ? (
                        <UserBubble key={m.id} content={m.content} />
                    ) : (
                        <AssistantBubble key={m.id} content={m.content} />
                    ),
                )}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); send(input); }
                    }}
                    disabled={agent.isRunning}
                    placeholder="Message…"
                    style={{ flex: 1, padding: "8px 12px", fontSize: "14px", borderRadius: "8px", border: "1px solid #ddd" }}
                />
                <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || agent.isRunning}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", cursor: "pointer" }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}