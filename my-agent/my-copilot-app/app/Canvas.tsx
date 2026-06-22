import { useAgent } from "@copilotkit/react-core/v2";

type CanvasState = {
  title: string;
  items: { id: string; label: string; done: boolean }[];
};

export function Canvas() {
  // No agentId means the "default" agent. Pass { agentId } to target another.
  const { agent } = useAgent({ agentId: "my_agent" });
  const state = (agent.state ?? {}) as Partial<CanvasState>;

  return (
    <main className="canvas">
      <h1>{state.title ?? "Untitled"}</h1>
      <ul>
        {(state.items ?? []).map((item) => (
          <li key={item.id} data-done={item.done}>
            {item.label}
          </li>
        ))}
      </ul>
    </main>
  );
}