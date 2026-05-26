from typing import Dict, List
from fastapi import FastAPI
from pydantic import BaseModel
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from google.adk.agents import LlmAgent
from google.adk.tools import ToolContext


class AgentState(BaseModel):
    """State for the agent."""
    observed_steps: List[str] = []


def step_progress(tool_context: ToolContext, steps: List[str]) -> Dict[str, str]:
    """Reports the current progress steps.

    Args:
        tool_context (ToolContext): The tool context for accessing state.
        steps (List[str]): The list of steps completed so far.

    Returns:
        Dict[str, str]: A dictionary indicating the progress was received.
    """
    tool_context.state["observed_steps"] = steps
    return {"status": "success", "message": "Progress received."}


agent = LlmAgent(
    name="my_agent",
    model="gemini-2.5-flash",
    instruction="""
    You are a task performer. When given a task, break it down into steps
    and report your progress using the step_progress tool after completing each step.
    """,
    tools=[step_progress],
)

adk_agent = ADKAgent(
    adk_agent=agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

app = FastAPI()
add_adk_fastapi_endpoint(app, adk_agent, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)