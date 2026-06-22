from __future__ import annotations

import json
from fastapi import FastAPI
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint, AGUIToolset
from google.adk.agents import LlmAgent
from google.adk.tools import ToolContext

from reasoning import get_model, stop_on_terminal_text


# 1. Give the agent a tool to mutate canvas state using ToolContext.
# We use simple string arguments to avoid complex nested schema parsing errors.
def update_canvas(
    tool_context: ToolContext,
    title: str = "",
    items_json: str = "",
) -> dict:
    """Update the canvas title and/or items shown in the UI.

    Args:
        tool_context: Context.
        title: The new title for the canvas (e.g., "My Weekend Plans"). Pass empty string if not updating.
        items_json: A JSON string representing a list of items, where each item has 'id' (string), 'label' (string), and 'done' (boolean). E.g., '[{"id": "1", "label": "Buy milk", "done": false}]'. Pass empty string if not updating.
    """
    state = tool_context.state

    if title:
        state["title"] = title
    if items_json:
        try:
            state["items"] = json.loads(items_json)
        except Exception as e:
            return {"error": f"Failed to parse items_json: {e}"}

    return {"ok": True, "title": state.get("title"), "items": state.get("items")}


# 2. Register the tool with your agent (using LlmAgent)
agent = LlmAgent(
    name="my_agent",
    model=get_model(),
    instruction="""
        You are a canvas assistant. You can:
        - Set a canvas title with update_canvas(title="...")
        - Add or replace items with update_canvas(items_json='[{"id": "1", "label": "item label", "done": false}]')
        - Change the page background with change_background(background="...")
        Always call update_canvas when the user asks to set, add, 
        update, or clear anything on the canvas.
    """,
    tools=[update_canvas, AGUIToolset()],
    after_model_callback=stop_on_terminal_text,
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
    uvicorn.run(app, host="localhost", port=8000)