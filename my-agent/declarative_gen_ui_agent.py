

from __future__ import annotations
import logging
import os
from typing import Optional, Union
from fastapi import FastAPI
import uvicorn

from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint, AGUIToolset
from google.adk.agents import LlmAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.google_llm import Gemini
from google.adk.models.llm_response import LlmResponse

logger = logging.getLogger(__name__)





def stop_on_terminal_text(
    callback_context: CallbackContext, llm_response: LlmResponse
) -> Optional[LlmResponse]:
    """Terminate the ADK agentic loop on a final text-only model turn."""
    content = llm_response.content
    if not content or not content.parts:
        if llm_response.error_message:
            logger.warning(
                "stop_on_terminal_text: Gemini returned error_message for agent=%s: %s",
                callback_context.agent_name,
                llm_response.error_message,
            )
        return None

    if getattr(llm_response, "partial", False):
        return None

    finish_reason = getattr(llm_response, "finish_reason", None)
    finish_reason_name = (
        getattr(finish_reason, "name", None) if finish_reason is not None else None
    )
    if finish_reason_name != "STOP" and finish_reason != "STOP":
        return None

    has_text = any(getattr(part, "text", None) for part in content.parts)
    has_function_call = any(
        getattr(part, "function_call", None) for part in content.parts
    )
    if content.role != "model" or not has_text or has_function_call:
        return None

    invocation_context = getattr(callback_context, "_invocation_context", None)
    if invocation_context is None:
        return None

    try:
        invocation_context.end_invocation = True
    except AttributeError:
        pass
    return None


_INSTRUCTION = (
    "You are the embedded sales analyst for Vantage Threads, the fictional "
    "B2B apparel company described in your context. Answer every business "
    "question by calling `generate_a2ui` to draw a rich visual surface, and "
    "keep the chat reply to one short sentence.\n"
    "\n"
    "Ground every number in the sales dataset from your context — never "
    "invent figures that contradict it. Follow the dashboard composition "
    "rules from your context when choosing components: pick the component "
    "by the shape of the question (snapshot → composed KPI dashboard with "
    "charts; team performance → DataTable; risk → StatusBadge cards; "
    "single account → InfoRow facts; part-of-whole → PieChart; "
    "trend/comparison → BarChart). Never ask the user which chart they "
    "want. `generate_a2ui` takes no arguments and handles the rendering "
    "automatically. Compose generously — a dashboard should feel like a "
    "real analytics product, not a single widget."
)

declarative_gen_ui_agent = LlmAgent(
    name="DeclarativeGenUiAgent",
    model="gemini-2.5-flash",
    instruction=_INSTRUCTION,
    tools=[
    ],
    after_model_callback=stop_on_terminal_text,
)

adk_agent = ADKAgent(
    adk_agent=declarative_gen_ui_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

app = FastAPI()
add_adk_fastapi_endpoint(app, adk_agent, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
