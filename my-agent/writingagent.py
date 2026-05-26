from typing import Dict
from fastapi import FastAPI
from pydantic import BaseModel
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from google.adk.agents import LlmAgent
from google.adk.tools import ToolContext


class AgentState(BaseModel):
    """State for the agent."""
    language: str = "english"


def set_language(tool_context: ToolContext, new_language: str) -> Dict[str, str]:
    """Sets the language preference for the user.

    Args:
        tool_context (ToolContext): The tool context for accessing state.
        new_language (str): The language to save in state.

    Returns:
        Dict[str, str]: A dictionary indicating success status and message.
    """
    tool_context.state["language"] = new_language
    return {"status": "success", "message": f"Language set to {new_language}"}


agent = LlmAgent(
    name="my_agent",
    model="gemini-2.5-flash",
    instruction="""
    You are a helpful assistant. Help users by answering their questions.
    Please use the language specified in state when responding to the user.
    You can set the language in state by using the set_language tool.
    """,
    tools=[set_language],
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