# from __future__ import annotations

# from fastapi import FastAPI
# from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint, AGUIToolset
# from ag_ui_adk.config import PredictStateMapping
# from google.adk.agents import LlmAgent
# from google.adk.tools import ToolContext
# #from agents.shared_chat import get_model, stop_on_terminal_text

# from reasoning import get_model, stop_on_terminal_text


# # ---------------------------------------------------------------------------
# # before_model_callback – injects CopilotKit context into the system prompt
# # ---------------------------------------------------------------------------

# def _inject_context(callback_context, llm_request):
#     """
#     Reads context entries published by useAgentContext() on the frontend
#     and prepends them to the system instruction so the model sees them
#     on every turn.

#     The entries live at:
#         callback_context.state["copilotkit"]["context"]

#     Each entry is a dict with at least:
#         { "description": str, "value": <any JSON-serialisable value> }
#     """
#     try:
#         ck_state = callback_context.state.get("copilotkit", {})
#         context_entries = ck_state.get("context", [])
#     except (AttributeError, TypeError):
#         context_entries = []

#     if not context_entries:
#         return  # nothing to inject; leave the request unchanged

#     # Build a compact context block to prepend to the system instruction.
#     lines = ["<user_context>"]
#     for entry in context_entries:
#         description = entry.get("description", "")
#         value = entry.get("value", "")
#         lines.append(f"  {description}: {value!r}")
#     lines.append("</user_context>")
#     context_block = "\n".join(lines)

#     # Prepend to the existing system instruction.
#     # system_instruction may be a string or a types.Content object.
#     if llm_request.config and llm_request.config.system_instruction:
#         existing = llm_request.config.system_instruction
#         if hasattr(existing, "parts"):
#             # Content object – mutate the first text part in-place.
#             for part in existing.parts:
#                 if hasattr(part, "text"):
#                     part.text = context_block + "\n\n" + part.text
#                     break
#         else:
#             llm_request.config.system_instruction = (
#                 context_block + "\n\n" + str(existing)
#             )


# # ---------------------------------------------------------------------------
# # write_document tool
# # ---------------------------------------------------------------------------

# def write_document(tool_context: ToolContext, document: str) -> dict:
#     """Write a document into shared state.

#     Whenever the user asks you to write or draft anything (essay, poem,
#     email, summary, etc.), call this tool with the full content as a
#     single string. The UI renders state["document"] live as you type.

#     Argument name `document` mirrors langgraph-python's `write_document`
#     signature so the shared D5 fixture (`tool_argument="document"`) and
#     the LGP-aligned PredictStateMapping below stay in lock-step.
#     """
#     tool_context.state["document"] = document
#     return {"status": "ok", "length": len(document)}


# # ---------------------------------------------------------------------------
# # Agent instruction
# # ---------------------------------------------------------------------------

# _INSTRUCTION = (
#     "You are a collaborative writing assistant. Whenever the user asks "
#     "you to write, draft, or revise any piece of text, ALWAYS call the "
#     "`write_document` tool with the full content as a single string. "
#     "Never paste the document into a chat message directly — the document "
#     "belongs in shared state and the UI renders it live as you type."
# )

# # ---------------------------------------------------------------------------
# # Agent definition
# # ---------------------------------------------------------------------------

# shared_state_streaming_agent = LlmAgent(
#     name="SharedStateStreamingAgent",
#     model=get_model(),
#     instruction=_INSTRUCTION,
#     tools=[write_document, AGUIToolset()],
#     before_model_callback=_inject_context,
#     after_model_callback=stop_on_terminal_text,
# )

# # ---------------------------------------------------------------------------
# # Predict-state mapping
# # ---------------------------------------------------------------------------

# SHARED_STATE_STREAMING_PREDICT_STATE = [
#     PredictStateMapping(
#         state_key="document",
#         tool="write_document",
#         tool_argument="document",
#         emit_confirm_tool=False,
#         stream_tool_call=True,
#     ),
# ]

# # ---------------------------------------------------------------------------
# # ADK agent + FastAPI app
# # ---------------------------------------------------------------------------

# adk_agent = ADKAgent(
#     adk_agent=shared_state_streaming_agent,
#     app_name="demo_app",
#     user_id="demo_user",
#     session_timeout_seconds=3600,
#     use_in_memory_services=True,
#     predict_state=SHARED_STATE_STREAMING_PREDICT_STATE,
# )

# app = FastAPI()
# add_adk_fastapi_endpoint(app, adk_agent, path="/")

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="localhost", port=8000)

from fastapi import FastAPI
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint, AGUIToolset
from google.adk.agents import LlmAgent
from google.genai import types
from reasoning import get_model, stop_on_terminal_text

import json

CONFIG_KEYS = ("tone", "expertise", "responseLength")

def read_config_value(entry):
    value = entry.get("value")
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError:
            return None
    if not isinstance(value, dict):
        return None
    if any(key in value for key in CONFIG_KEYS):
        return value
    return None

import uuid
from google.adk.tools import ToolContext

def delegate_research(tool_context: ToolContext, task: str) -> str:
    """Delegate a research task to the researcher sub-agent.
    
    Args:
        task: The details of the research to perform.
    """
    delegations = tool_context.state.setdefault("delegations", [])
    dlg_id = str(uuid.uuid4())
    dlg = {
        "id": dlg_id,
        "sub_agent": "research_agent",
        "status": "completed",
        "task": task,
        "result": f"Research results for '{task}': Analyzed current trends and compiled background data."
    }
    delegations.append(dlg)
    tool_context.state["delegations"] = list(delegations)
    return dlg["result"]

def delegate_writing(tool_context: ToolContext, task: str) -> str:
    """Delegate a writing/drafting task to the writer sub-agent.
    
    Args:
        task: The details of the writing task.
    """
    delegations = tool_context.state.setdefault("delegations", [])
    dlg_id = str(uuid.uuid4())
    dlg = {
        "id": dlg_id,
        "sub_agent": "writing_agent",
        "status": "completed",
        "task": task,
        "result": f"Written draft for '{task}': Crafted a structured draft covering all target points."
    }
    delegations.append(dlg)
    tool_context.state["delegations"] = list(delegations)
    return dlg["result"]

def delegate_critic(tool_context: ToolContext, task: str) -> str:
    """Delegate a critique/review task to the critique_agent sub-agent.
    
    Args:
        task: The details of the critique or review task.
    """
    delegations = tool_context.state.setdefault("delegations", [])
    dlg_id = str(uuid.uuid4())
    dlg = {
        "id": dlg_id,
        "sub_agent": "critique_agent",
        "status": "completed",
        "task": task,
        "result": f"Critique feedback for '{task}': Reviewed draft. Identified areas of improvement for readability."
    }
    delegations.append(dlg)
    tool_context.state["delegations"] = list(delegations)
    return dlg["result"]

def build_system_prompt(tone: str, expertise: str, response_length: str) -> str:
    return (
        f"You are a supervisor writing assistant. You can delegate tasks to your sub-agents:\n"
        f"- Use `delegate_research` to research a topic.\n"
        f"- Use `delegate_writing` to draft a response.\n"
        f"- Use `delegate_critic` to critique/review a draft.\n"
        f"When a user asks you to write, research, or review, ALWAYS delegate tasks to the appropriate sub-agents instead of answering directly.\n\n"
        f"Please respond with the following preferences:\n"
        f"- Tone: {tone}\n"
        f"- Expertise: {expertise}\n"
        f"- Response Length: {response_length}"
    )

def before_model_callback(callback_context, llm_request):
    try:
        context_entries = callback_context.state.get("copilotkit", {}).get("context", [])
    except (AttributeError, TypeError):
        context_entries = []

    cfg = next(
        (
            value
            for entry in reversed(context_entries)
            if (value := read_config_value(entry)) is not None
        ),
        {},
    )
    tone = cfg.get("tone", "professional")
    expertise = cfg.get("expertise", "intermediate")
    response_length = cfg.get("responseLength", "concise")
    
    system_prompt = build_system_prompt(tone, expertise, response_length)
    
    if not llm_request.config:
        llm_request.config = types.GenerateContentConfig()
        
    llm_request.config.system_instruction = system_prompt

# agent = LlmAgent(
#     name="my_agent",
#     model=get_model(),
#     instruction="Be helpful and fun!",
#     tools=[AGUIToolset()],
#     generate_content_config=types.GenerateContentConfig(
#         thinking_config=types.ThinkingConfig(
#             include_thoughts=True,
#             thinking_budget=-1,
#         )
#     ),
#     before_model_callback=before_model_callback,
#     after_model_callback=stop_on_terminal_text,
# )

agent = LlmAgent(
    name="my_agent",
    model=get_model(),
    instruction="Be helpful and fun!",
    tools=[AGUIToolset(), delegate_research, delegate_writing, delegate_critic],
    generate_content_config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            include_thoughts=True,
            thinking_budget=-1,
        )
    ),
    before_model_callback=before_model_callback,
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