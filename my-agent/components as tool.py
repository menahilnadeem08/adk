from fastapi import FastAPI
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint, AGUIToolset
from google.adk.agents import LlmAgent
from reasoning import get_model, stop_on_terminal_text

from google.adk.tools import ToolContext

def get_weather(tool_context: ToolContext, location: str) -> dict:
    """Get the current weather for a given location."""
    return {
        "city": location,
        "temperature": 68,
        "humidity": 55,
        "wind_speed": 10,
        "conditions": "Sunny",
    }

_INSTRUCTION = (
    "You are a helpful assistant and a planning assistant. "
    "If the user asks you to change the background color, call the change_background tool. "
    "If the user asks you about the weather, call the get_weather tool. "
    "When the user asks you to plan something, "
    "always call generate_task_steps with the proposed list of steps (each "
    "with description + status='enabled'). The frontend will render the "
    "steps inline and the user will confirm or reject — your job is to plan "
    "and call the tool, then summarise the user's decision once they "
    "respond."
)
agent = LlmAgent(
    name="my_agent",
    model=get_model(),
    instruction=_INSTRUCTION,
    tools=[AGUIToolset(), get_weather],
    after_model_callback=stop_on_terminal_text,
)

adk_agent = ADKAgent(
    adk_agent=agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

app = FastAPI()
add_adk_fastapi_endpoint(app, adk_agent, path="/voice")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)