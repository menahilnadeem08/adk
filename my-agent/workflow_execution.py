from typing import Dict, List
from fastapi import FastAPI
from pydantic import BaseModel
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from google.adk.agents import LlmAgent
from google.adk.tools import ToolContext


class AgentState(BaseModel):
    """State for the agent."""
    question: str = ""       # Input: received from frontend
    answer: str = ""         # Output: sent to frontend
    resources: List[str] = []  # Internal: not shared with frontend


def answer_question(tool_context: ToolContext, answer: str) -> Dict[str, str]:
    """Stores the answer to the user's question.

    Args:
        tool_context (ToolContext): The tool context for accessing state.
        answer (str): The answer to store in state.

    Returns:
        Dict[str, str]: A dictionary indicating success status.
    """
    tool_context.state["answer"] = answer
    return {"status": "success", "message": "Answer stored."}


def add_resource(tool_context: ToolContext, resource: str) -> Dict[str, str]:
    """Adds a resource to the internal resources list.

    Args:
        tool_context (ToolContext): The tool context for accessing state.
        resource (str): The resource URL or reference to add.

    Returns:
        Dict[str, str]: A dictionary indicating success status.
    """
    resources = tool_context.state.get("resources", [])
    resources.append(resource)
    tool_context.state["resources"] = resources
    return {"status": "success", "message": "Resource added."}


agent = LlmAgent(
    name="my_agent",
    model="gemini-2.5-flash",
    instruction="""
    You are a helpful assistant. When answering questions:
    1. Use add_resource to track any sources you reference (internal use)
    2. Use answer_question to provide your final answer to the user

    The question from the user is available in state as 'question'.
    """,
    tools=[answer_question, add_resource],
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