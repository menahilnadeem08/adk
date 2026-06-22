"use client";

import { useState } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

// Define the agent state type, should match the actual state of your agent
type AgentState = {
    question: string;
    answer: string;
}

/* Example usage in a pseudo React component */
export default function Page() {
    const [inputQuestion, setInputQuestion] = useState("What's the capital of France?");
    const [isLoading, setIsLoading] = useState(false);

    const { agent } = useAgent({
        agentId: "my_agent",
    });
    const { copilotkit } = useCopilotKit();

    const askQuestion = async (newQuestion: string) => {
        setIsLoading(true);

        // Update the state with the new question
        agent.setState({ ...agent.state, question: newQuestion, answer: "" });

        try {
            // Add a message and trigger the agent to run
            agent.addMessage({
                id: crypto.randomUUID(),
                role: "user",
                content: newQuestion,
            });
            await copilotkit.runAgent({ agent });
        } catch (error) {
            console.error("Error running agent:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
            <h1>Q&A Assistant</h1>

            <div style={{ marginBottom: "1rem" }}>
                <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    placeholder="Enter your question..."
                    style={{
                        padding: "0.5rem",
                        width: "300px",
                        marginRight: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                    }}
                />
                <button
                    onClick={() => askQuestion(inputQuestion)}
                    disabled={isLoading || !inputQuestion.trim()}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: isLoading ? "#ccc" : "#0070f3",
                        color: "white",
                        cursor: isLoading ? "not-allowed" : "pointer"
                    }}
                >
                    {isLoading ? "Thinking..." : "Ask Question"}
                </button>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
                <p><strong>Question:</strong> {agent.state?.question || "(none yet)"}</p>
                <p><strong>Answer:</strong> {agent.state?.answer || (isLoading ? "Thinking..." : "Waiting for question...")}</p>
            </div>
        </div>
    );
}