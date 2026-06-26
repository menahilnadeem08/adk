
//=====================Predictive =======================
"use client";

import {
  CopilotKit,
  CopilotSidebar,
  useAgent,
} from "@copilotkit/react-core/v2";

// ...
type AgentState = {
    observed_steps: string[];
};

const Page = () => {
    // Get access to both predicted and final states
    const { agent } = useAgent({ agentId: "my_agent" });

    // Add a state renderer to observe predictions
    useAgent({
        agentId: "my_agent",
        render: ({ state }) => {
            if (!state.observed_steps?.length) return null;
            return (
                <div>
                    <h3>Current Progress:</h3>
                    <ul>
                        {state.observed_steps.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ul>
                </div>
            );
        },
    });

    return (
        <div>
            <h1>Agent Progress</h1>
            {agent.state?.observed_steps?.length > 0 && (
                <div>
                    <h3>Final Steps:</h3>
                    <ul>
                        {agent.state.observed_steps.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ul>
                </div>
            )}
        <CopilotSidebar/>
        </div>
        
    )
}
export default Page;