from __future__ import annotations

import json
import logging
import uuid
import functools
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel

import os
from typing import Any, Optional, Union
from google.adk.models.google_llm import Gemini

from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint, AGUIToolset
from ag_ui_adk.config import PredictStateMapping
from google.adk.agents import LlmAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_request import LlmRequest
from google.adk.models.llm_response import LlmResponse
from google.adk.tools import ToolContext
from google.genai import types
from google import genai

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "gemini-2.5-flash"


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


def get_model(model: str = DEFAULT_MODEL) -> Union[str, Gemini]:
    """Return a model suitable for LlmAgent's `model=` parameter."""
    base_url = os.environ.get("GOOGLE_GEMINI_BASE_URL")
    if base_url:
        return Gemini(model=model, base_url=base_url)
    return model


CATALOG_ID = "copilotkit://flight-fixed-catalog"
SURFACE_ID = "flight-fixed-schema"

_SCHEMAS_DIR = Path(__file__).parent / "a2ui_schemas"


def _load_schema(name: str) -> list[dict[str, Any]]:
    with open(_SCHEMAS_DIR / name, "r", encoding="utf-8") as f:
        return json.load(f)


FLIGHT_SCHEMA = _load_schema("flight_schema.json")
BOOKED_SCHEMA = _load_schema("booked_schema.json")

def _build_flight_operations(
    *, origin: str, destination: str, airline: str, price: str
) -> dict[str, Any]:
    """Build the v0.9 a2ui_operations container the runtime detects.
    Each op uses the v0.9 nested shape (`createSurface` / `updateComponents` /
    `updateDataModel` keys with surfaceId inside) that
    `@ag-ui/a2ui-middleware`'s `getOperationSurfaceId` walks. The previous
    flat shape (`type: "create_surface"`, surfaceId at top level) silently
    grouped under the fallback `"default"` surface, so the renderer never
    saw the schema. Mirrors `copilotkit.a2ui.create_surface` /
    `update_components` / `update_data_model` from the langgraph-python
    north-star.
    """
    return {
        "a2ui_operations": [
            {
                "version": "v0.9",
                "createSurface": {
                    "surfaceId": SURFACE_ID,
                    "catalogId": CATALOG_ID,
                },
            },
            {
                "version": "v0.9",
                "updateComponents": {
                    "surfaceId": SURFACE_ID,
                    "components": FLIGHT_SCHEMA,
                },
            },
            {
                "version": "v0.9",
                "updateDataModel": {
                    "surfaceId": SURFACE_ID,
                    "path": "/",
                    "value": {
                        "origin": origin,
                        "destination": destination,
                        "airline": airline,
                        "price": price,
                    },
                },
            },
        ]
    }

# ===========================================================================
# Tool Definitions
# ===========================================================================

def display_flight(
    tool_context: ToolContext,
    origin: str,
    destination: str,
    airline: str,
    price: str,
) -> dict[str, Any]:
    """Show a flight card for the given trip.
    Use short airport codes (e.g. "SFO", "JFK") for origin/destination and a
    price string like "$289".
    After this tool returns, the flight card is already rendered to the user
    via the A2UI surface — the JSON returned here is the surface descriptor
    the renderer consumes, NOT a status code. Do NOT call this tool again
    for the same flight (the user already sees the card). Reply with one
    short confirmation sentence and stop.
    """
    return _build_flight_operations(
        origin=origin, destination=destination, airline=airline, price=price
    )



def write_document(tool_context: ToolContext, document: str) -> dict:
    """Write a document into shared state.

    Whenever the user asks you to write or draft anything (essay, poem,
    email, summary, etc.), call this tool with the full content as a
    single string. The UI renders state["document"] live as you type.
    """
    tool_context.state["document"] = document
    return {"status": "ok", "length": len(document)}


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


def update_canvas(
    tool_context: ToolContext,
    title: str = "",
    items_json: str = "",
) -> dict:
    """Update the canvas state with a new title and list of items.

    Args:
        tool_context: Context.
        title: The title of the canvas.
        items_json: A JSON string containing the list of items. Each item in the array should have 'id', 'label', and 'done' (boolean) keys. E.g., '[{"id": "1", "label": "Buy milk", "done": false}]'.
    """
    state = tool_context.state
    if title:
        state["title"] = title
    if items_json:
        try:
            state["items"] = json.loads(items_json)
        except Exception as e:
            return {"error": f"Failed to parse items_json: {e}"}
    return {"status": "success", "title": state.get("title"), "items": state.get("items")}


def get_weather(tool_context: ToolContext, location: str) -> dict:
    """Get the current weather for a given location."""
    return {
        "city": location,
        "temperature": 68,
        "humidity": 55,
        "wind_speed": 10,
        "conditions": "Sunny",
    }


def answer_question(tool_context: ToolContext, answer: str) -> dict[str, str]:
    """Stores the answer to the user's question.

    Args:
        tool_context (ToolContext): The tool context for accessing state.
        answer (str): The answer to store in state.

    Returns:
        dict[str, str]: A dictionary indicating success status.
    """
    tool_context.state["answer"] = answer
    return {"status": "success", "message": "Answer stored."}


def add_resource(tool_context: ToolContext, resource: str) -> dict[str, str]:
    """Adds a resource to the internal resources list.

    Args:
        tool_context (ToolContext): The tool context for accessing state.
        resource (str): The resource URL or reference to add.

    Returns:
        dict[str, str]: A dictionary indicating success status.
    """
    resources = tool_context.state.get("resources", [])
    resources.append(resource)
    tool_context.state["resources"] = resources
    return {"status": "success", "message": "Resource added."}


def step_progress(tool_context: ToolContext, steps: list[str]) -> dict[str, str]:
    """Reports the current progress steps.

    Args:
        tool_context (ToolContext): The tool context for accessing state.
        steps (list[str]): The list of steps completed so far.

    Returns:
        dict[str, str]: A dictionary indicating the progress was received.
    """
    tool_context.state["observed_steps"] = steps
    return {"status": "success", "message": "Progress received."}


def set_language(tool_context: ToolContext, new_language: str) -> dict[str, str]:
    """Sets the language preference for the user.

    Args:
        tool_context (ToolContext): The tool context for accessing state.
        new_language (str): The language to save in state.

    Returns:
        dict[str, str]: A dictionary indicating success status and message.
    """
    tool_context.state["language"] = new_language
    return {"status": "success", "message": f"Language set to {new_language}"}


# ===========================================================================
# Sub-Agent Real Tools Implementation
# ===========================================================================

_SUB_MODEL = "gemini-3.1-flash-lite"

_RESEARCH_SYSTEM = (
    "You are a research sub-agent. Given a topic, produce a concise "
    "bulleted list of 3-5 key facts. No preamble, no closing."
)
_WRITING_SYSTEM = (
    "You are a writing sub-agent. Given a brief and optional source facts, "
    "produce a polished 1-paragraph draft. Be clear and concrete. No preamble."
)
_CRITIQUE_SYSTEM = (
    "You are an editorial critique sub-agent. Given a draft, give 2-3 crisp, "
    "actionable critiques. No preamble."
)


@functools.lru_cache(maxsize=1)
def _client() -> genai.Client:
    base_url = os.environ.get("GOOGLE_GEMINI_BASE_URL")
    if base_url:
        return genai.Client(http_options={"base_url": base_url})
    return genai.Client()


class _SubAgentError(Exception):
    """Raised by `_invoke_sub_agent` when the secondary Gemini call fails.

    Carries a user-facing message that's safe to surface to the supervisor
    LLM and the frontend delegation log. The original exception is chained
    via `__cause__` so the server-side traceback is preserved.
    """


def _invoke_sub_agent(system_prompt: str, task: str) -> str:
    """Run a single-shot Gemini call with a sub-agent system prompt.

    Catches the broad `Exception` rather than the narrow
    `(APIError, ValueError)` set so transport-layer failures (timeouts,
    `httpx.ConnectError`, `RuntimeError` from cancelled tasks) do not
    crash the supervisor's tool call. Failures are re-raised as
    `_SubAgentError` so callers can surface a useful error message in
    the delegation log without crashing the supervisor.
    """
    try:
        response = _client().models.generate_content(
            model=_SUB_MODEL,
            contents=[types.Content(role="user", parts=[types.Part(text=task)])],
            config=types.GenerateContentConfig(system_instruction=system_prompt),
        )
    except Exception as exc:
        logger.exception("subagent: Gemini call failed")
        raise _SubAgentError(
            f"sub-agent call failed: {exc.__class__.__name__} "
            "(see server logs for details)"
        ) from exc

    candidates = getattr(response, "candidates", None) or []
    if not candidates:
        raise _SubAgentError("sub-agent returned no candidates (safety blocked?)")

    content = getattr(candidates[0], "content", None)
    parts = getattr(content, "parts", None) or []
    text = "".join(getattr(p, "text", "") or "" for p in parts).strip()
    if not text:
        raise _SubAgentError("sub-agent returned empty text")
    return text


def _append_completed_delegation(
    tool_context: ToolContext,
    *,
    sub_agent: str,
    task: str,
    result: str,
) -> None:
    """Append a completed delegation entry to shared state.

    LP-parity: the LP frontend renders the delegation log on `status:
    "completed"` only. We never emit a "running" placeholder, so the log
    grows by exactly one entry per sub-agent call when it finishes.
    Failures still write a `"completed"` entry whose `result` is the
    user-facing error string — the renderer keeps a single visual treatment
    instead of needing a separate failed-state branch.
    """
    delegations = list(tool_context.state.get("delegations") or [])
    delegations.append(
        {
            "id": str(uuid.uuid4()),
            "sub_agent": sub_agent,
            "task": task,
            "status": "completed",
            "result": result,
        }
    )
    tool_context.state["delegations"] = delegations


_SUB_AGENT_ERROR_PREFIX = "[sub-agent error] "


def _delegate(
    tool_context: ToolContext, *, sub_agent: str, system_prompt: str, task: str
) -> str:
    """Common delegation flow: invoke sub-agent → append completed entry → return text.

    The frontend's delegation log subscribes to `state["delegations"]` and
    the supervisor LLM reads the returned string as the tool result. We
    only append AFTER the sub-agent returns so the log mirrors LP's
    completion-only behaviour. Sub-agent failures are surfaced as a plain
    error string prefixed with `[sub-agent error]` — the supervisor LLM
    can detect this and apologise instead of fabricating an answer, and
    the frontend renders the prefixed error inline alongside successful
    outputs.
    """
    try:
        result = _invoke_sub_agent(system_prompt, task)
    except _SubAgentError as exc:
        error_message = f"{_SUB_AGENT_ERROR_PREFIX}{exc}"
        _append_completed_delegation(
            tool_context,
            sub_agent=sub_agent,
            task=task,
            result=error_message,
        )
        return error_message

    _append_completed_delegation(
        tool_context,
        sub_agent=sub_agent,
        task=task,
        result=result,
    )
    return result


def research_agent(tool_context: ToolContext, task: str) -> str:
    """Delegate a research task to the research sub-agent.

    Use for: gathering facts, background, definitions, statistics. Returns
    the sub-agent's plain-text response, or an `[sub-agent error] …`
    string on failure — surface either to the user without rephrasing.
    """
    return _delegate(
        tool_context,
        sub_agent="research_agent",
        system_prompt=_RESEARCH_SYSTEM,
        task=task,
    )


def writing_agent(tool_context: ToolContext, task: str) -> str:
    """Delegate a drafting task to the writing sub-agent.

    Use for: producing a polished paragraph, draft, or summary. Pass the
    brief (and any relevant facts) through `task`. Same return shape as
    research_agent.
    """
    return _delegate(
        tool_context,
        sub_agent="writing_agent",
        system_prompt=_WRITING_SYSTEM,
        task=task,
    )


def critique_agent(tool_context: ToolContext, task: str) -> str:
    """Delegate a critique task to the critique sub-agent.

    Use for: reviewing a draft and suggesting concrete improvements. Pass
    the draft through `task`. Same return shape as research_agent.
    """
    return _delegate(
        tool_context,
        sub_agent="critique_agent",
        system_prompt=_CRITIQUE_SYSTEM,
        task=task,
    )


# ===========================================================================
# Callback Definitions
# ===========================================================================

CONTEXT_PREFIX_SIGNATURE = "[agent-context] frontend-supplied context:"
CONTEXT_END_MARKER = "Treat this context as read-only background information."
CONFIG_KEYS = ("tone", "expertise", "responseLength")


def _read_config_value(entry: dict) -> Optional[dict]:
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



def _format_context(context_entries: list[dict]) -> str | None:
    if not context_entries:
        return None
    lines = [CONTEXT_PREFIX_SIGNATURE]
    for entry in context_entries:
        if not isinstance(entry, dict):
            continue
        desc = entry.get("description") or ""
        value = entry.get("value")
        if value is None:
            continue
        if desc:
            lines.append(f"- {desc}: {value}")
        else:
            lines.append(f"- {value}")
    if len(lines) == 1:
        return None
    lines.append(CONTEXT_END_MARKER)
    return "\n".join(lines)


def _inject_context(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> Optional[LlmResponse]:
    copilotkit_state = callback_context.state.get("copilotkit")
    # Coerce malformed state to empty rather than early-return; a stale
    # context block from a prior turn would otherwise stay embedded in
    # `system_instruction` indefinitely (the strip path runs unconditionally
    # below). Log when shape drifts so the regression surfaces server-side.
    if copilotkit_state is None:
        raw_entries: list = []
    elif not isinstance(copilotkit_state, dict):
        logger.warning(
            "agent-context: state['copilotkit'] is %s, expected dict; "
            "treating as empty",
            type(copilotkit_state).__name__,
        )
        raw_entries = []
    else:
        raw_entries_candidate = copilotkit_state.get("context")
        if raw_entries_candidate is None:
            raw_entries = []
        elif not isinstance(raw_entries_candidate, list):
            logger.warning(
                "agent-context: state['copilotkit']['context'] is %s, "
                "expected list; treating as empty",
                type(raw_entries_candidate).__name__,
            )
            raw_entries = []
        else:
            raw_entries = raw_entries_candidate
    block = _format_context(raw_entries)
    original = llm_request.config.system_instruction
    if original is None:
        original_text = ""
    elif isinstance(original, types.Content):
        parts = original.parts or []
        original_text = (parts[0].text or "") if parts else ""
    else:
        original_text = str(original)
    sig_idx = original_text.find(CONTEXT_PREFIX_SIGNATURE)
    stripped_prior_block = False
    if sig_idx != -1:
        end_idx = original_text.find(CONTEXT_END_MARKER, sig_idx)
        if end_idx != -1:
            stripped_prior_block = True
            # Splice out only the prior block (preserve head + tail).
            # See agent_config_agent.py for the full rationale.
            original_text = (
                original_text[:sig_idx]
                + original_text[end_idx + len(CONTEXT_END_MARKER) :]
            ).lstrip("\n")
        else:
            logger.warning(
                "agent-context: prior context block has signature but no "
                "end marker; leaving original_text untouched to avoid "
                "losing user content"
            )
    if block:
        new_text = (block + "\n\n" + original_text) if original_text else block
    else:
        new_text = original_text
    if not new_text and not stripped_prior_block:
        # Nothing to inject AND we didn't strip anything. Leave
        # system_instruction as-is — writing Content(text="") would
        # clobber the LlmAgent's static `instruction=`. If we DID
        # strip a prior block we must fall through and write the
        # result so the stale block doesn't stay embedded in the
        # existing Content. See agent_config_agent.py for full
        # rationale.
        return None
    llm_request.config.system_instruction = types.Content(
        role="system", parts=[types.Part(text=new_text)]
    )
    return None

# ===========================================================================
# Instruction & Agent Initialization
# ===========================================================================

_UNIFIED_INSTRUCTION = (
    "You are a highly capable unified assistant with multiple specialized skills:\n\n"
    "1. Flight Booking: When asked to search, find, or book flights, call `display_flight` "
    "with the origin and destination codes. Confirm that the user can review/book via the interactive card.\n"
    "2. Collaborative Writing: When asked to draft, write, or revise text (essays, summaries, emails), "
    "ALWAYS call the `write_document` tool. Never output the draft text in the chat bubble directly.\n"
    "3. Task Delegation (Supervisor): When given a complex writing/critique/research workflow, delegate tasks "
    "to your sub-agents in sequence: research_agent -> writing_agent -> critique_agent. "
    "IMPORTANT: call EACH sub-agent EXACTLY ONCE per user request. "
    "After critique_agent returns, do NOT call any sub-agent again — return a concise final answer to the user that incorporates the critique. "
    "Pass the relevant facts/draft through the `task` argument of each tool. Each tool returns the sub-agent's plain-text output. "
    "If the result is prefixed with `[sub-agent error]`, surface the failure briefly to the user.\n"
    "4. Canvas Management: When asked to set a title or manage items on the canvas, call `update_canvas`. "
    "To add or replace items, ALWAYS pass a JSON string to `items_json` in the format: "
    "'[{\"id\": \"1\", \"label\": \"item label\", \"done\": false}]'. Never pass a Python list directly.\n"
    "5. Environment & Utilities: You can check the weather using `get_weather` or change the page background color via the "
    "frontend-supplied tool `change_background` (using your AGUIToolset).\n"
    "6. Resource & Answer Tracking: When asked to answer a factual question, call `add_resource` to track sources you referenced "
    "(internal use), and ALWAYS use `answer_question` to save the final answer to the user in state. The user's question is "
    "available in state as 'question'.\n"
    "7. Task Progress tracking: When performing a multi-step task, break it down into steps and report your progress using "
    "the `step_progress` tool after completing each step.\n"
    "8. Language Preference: Help users by answering their questions. Please use the language specified in state (key: 'language') "
    "when responding to the user. You can set/change the language preference in state by using the `set_language` tool.\n\n"
    "Adopt the user preferences (tone, expertise, response length) specified in your context when answering."
)

my_agent = LlmAgent(
    name="my_agent",
    model=get_model(_SUB_MODEL),
    instruction=_UNIFIED_INSTRUCTION,
    tools=[
        display_flight,
        write_document,
        delegate_research,
        delegate_writing,
        delegate_critic,
        update_canvas,
        research_agent,
        writing_agent,
        critique_agent,
        get_weather,
        answer_question,
        add_resource,
        step_progress,
        set_language,
        AGUIToolset(),
    ],
    generate_content_config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            include_thoughts=True,
            thinking_budget=-1,
        )
    ),
    before_model_callback=_inject_context,
    after_model_callback=stop_on_terminal_text,
)

SHARED_STATE_STREAMING_PREDICT_STATE = [
    PredictStateMapping(
        state_key="document",
        tool="write_document",
        tool_argument="document",
    ),
    PredictStateMapping(
        state_key="observed_steps",
        tool="step_progress",
        tool_argument="steps",
    ),
]

# ===========================================================================
# Readonly State Agent Context Demo Implementation
# ===========================================================================

_READONLY_STATE_INSTRUCTION = (
    "You are an assistant that uses frontend-supplied context to give "
    "more relevant answers. The frontend passes read-only context entries "
    "via useAgentContext; they are added to your system prompt every "
    "turn. Use them when relevant."
)

# def _inject_readonly_context(
#     callback_context: CallbackContext, llm_request: LlmRequest
# ) -> Optional[LlmResponse]:
#     print("DEBUG READONLY CALLBACK: _inject_readonly_context invoked!")
#     raw_entries = callback_context.state.get("_ag_ui_context")
#     if raw_entries is None:
#         copilotkit_state = callback_context.state.get("copilotkit")
#         if isinstance(copilotkit_state, dict):
#             raw_entries = copilotkit_state.get("context")

#     if not isinstance(raw_entries, list):
#         raw_entries = []

#     block = _format_context(raw_entries)

#     original = llm_request.config.system_instruction
#     if original is None:
#         original_text = ""
#     elif isinstance(original, types.Content):
#         parts = original.parts or []
#         original_text = (parts[0].text or "") if parts else ""
#     else:
#         original_text = str(original)

#     sig_idx = original_text.find(CONTEXT_PREFIX_SIGNATURE)
#     stripped_prior_block = False
#     if sig_idx != -1:
#         end_idx = original_text.find(CONTEXT_END_MARKER, sig_idx)
#         if end_idx != -1:
#             stripped_prior_block = True
#             original_text = (
#                 original_text[:sig_idx]
#                 + original_text[end_idx + len(CONTEXT_END_MARKER) :]
#             ).lstrip("\n")
#         else:
#             logger.warning(
#                 "agent-context: prior context block has signature but no "
#                 "end marker; leaving original_text untouched to avoid "
#                 "losing user content"
#             )

#     if block:
#         new_text = (block + "\n\n" + original_text) if original_text else block
#     else:
#         new_text = original_text

#     if not new_text and not stripped_prior_block:
#         return None

#     llm_request.config.system_instruction = types.Content(
#         role="system", parts=[types.Part(text=new_text)]
#     )
#     return None

# readonly_state_agent_context_agent = LlmAgent(
#     name="my_agent",  # Named "my_agent" to match frontend agentId
#     model=get_model(),
#     instruction=_READONLY_STATE_INSTRUCTION,
#     tools=[AGUIToolset()],
#     before_model_callback=_inject_readonly_context,
#     after_model_callback=stop_on_terminal_text,
# )

def _inject_context(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> Optional[LlmResponse]:
    copilotkit_state = callback_context.state.get("copilotkit")
    # Coerce malformed state to empty rather than early-return; a stale
    # context block from a prior turn would otherwise stay embedded in
    # `system_instruction` indefinitely (the strip path runs unconditionally
    # below). Log when shape drifts so the regression surfaces server-side.
    if copilotkit_state is None:
        raw_entries: list = []
    elif not isinstance(copilotkit_state, dict):
        logger.warning(
            "agent-context: state['copilotkit'] is %s, expected dict; "
            "treating as empty",
            type(copilotkit_state).__name__,
        )
        raw_entries = []
    else:
        raw_entries_candidate = copilotkit_state.get("context")
        if raw_entries_candidate is None:
            raw_entries = []
        elif not isinstance(raw_entries_candidate, list):
            logger.warning(
                "agent-context: state['copilotkit']['context'] is %s, "
                "expected list; treating as empty",
                type(raw_entries_candidate).__name__,
            )
            raw_entries = []
        else:
            raw_entries = raw_entries_candidate
    block = _format_context(raw_entries)
    original = llm_request.config.system_instruction
    if original is None:
        original_text = ""
    elif isinstance(original, types.Content):
        parts = original.parts or []
        original_text = (parts[0].text or "") if parts else ""
    else:
        original_text = str(original)
    sig_idx = original_text.find(CONTEXT_PREFIX_SIGNATURE)
    stripped_prior_block = False
    if sig_idx != -1:
        end_idx = original_text.find(CONTEXT_END_MARKER, sig_idx)
        if end_idx != -1:
            stripped_prior_block = True
            # Splice out only the prior block (preserve head + tail).
            # See agent_config_agent.py for the full rationale.
            original_text = (
                original_text[:sig_idx]
                + original_text[end_idx + len(CONTEXT_END_MARKER) :]
            ).lstrip("\n")
        else:
            logger.warning(
                "agent-context: prior context block has signature but no "
                "end marker; leaving original_text untouched to avoid "
                "losing user content"
            )
    if block:
        new_text = (block + "\n\n" + original_text) if original_text else block
    else:
        new_text = original_text
    if not new_text and not stripped_prior_block:
        # Nothing to inject AND we didn't strip anything. Leave
        # system_instruction as-is — writing Content(text="") would
        # clobber the LlmAgent's static `instruction=`. If we DID
        # strip a prior block we must fall through and write the
        # result so the stale block doesn't stay embedded in the
        # existing Content. See agent_config_agent.py for full
        # rationale.
        return None
    llm_request.config.system_instruction = types.Content(
        role="system", parts=[types.Part(text=new_text)]
    )
    return None
_INSTRUCTION = (
    "You are an assistant that uses frontend-supplied context to give "
    "more relevant answers. The frontend passes read-only context entries "
    "via useAgentContext; they are added to your system prompt every "
    "turn. Use them when relevant."
)
readonly_state_agent_context_agent = LlmAgent(
    name="ReadonlyStateAgentContextAgent",
    model=get_model(),
    instruction=_INSTRUCTION,
    tools=[AGUIToolset()],
    before_model_callback=_inject_context,
    after_model_callback=stop_on_terminal_text,
)

# Re-assign my_agent to this context agent so it gets picked up by ADKAgent
# my_agent = readonly_state_agent_context_agent

adk_agent = ADKAgent(
    adk_agent=my_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
    predict_state=SHARED_STATE_STREAMING_PREDICT_STATE,
)

app = FastAPI()
add_adk_fastapi_endpoint(app, adk_agent, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)