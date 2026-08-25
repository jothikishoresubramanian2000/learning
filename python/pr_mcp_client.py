"""
ProcIQ MCP Client — LangChain LLM picks tool automatically.

Flow:
  1. Connect to MCP server
  2. Ask server: what tools do you have? (list_tools)
  3. Server returns tool names + descriptions from server.py docstrings
  4. Feed those to LLM prompt dynamically — no hardcoding
  5. User types question -> LLM picks tool -> MCP executes

Run: python pr_mcp_client.py
"""

import asyncio
import os
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq

SERVER_SCRIPT = "pr_mcp_server.py"
GROQ_API_KEY  = os.environ["GROQ_API_KEY"]
GROQ_MODEL    = "llama-3.3-70b-versatile"


# ── LangChain tool selector ───────────────────────────────────────────────────

def llm_choose_tool(question: str, tools_description: str) -> str:
    """LangChain LLM reads question + live tool list from server -> picks tool."""
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a tool selector. Given a user question, reply with ONLY the tool name.\n\n"
         "Available tools (read from server):\n"
         "{tools_description}\n\n"
         "Reply with exactly one tool name. Nothing else."),
        ("human", "{question}"),
    ])
    llm   = ChatGroq(model=GROQ_MODEL, temperature=0, api_key=GROQ_API_KEY)
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"tools_description": tools_description, "question": question}).strip()


# ── MCP call helper ───────────────────────────────────────────────────────────

async def call(session, tool: str, args: dict):
    print(f"\n[CALLING MCP TOOL: {tool}]")
    print("-" * 60)
    result = await session.call_tool(tool, arguments=args)
    for block in result.content:
        text = block.text.encode("cp1252", errors="replace").decode("cp1252")
        print(text)
    print("=" * 60)


# ── Main ──────────────────────────────────────────────────────────────────────

async def main():
    print("=" * 60)
    print("ProcIQ MCP Client  (LangChain tool selector)")
    print("Type your question. Ctrl+C to quit.")
    print("=" * 60)

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[SERVER_SCRIPT],
        env=None,
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Ask server: what tools do you have?
            # Returns tool names + descriptions from pr_mcp_server.py docstrings
            tools_response = await session.list_tools()

            # Build tool description string dynamically from server response
            # first non-empty line of docstring = description
            def first_line(desc):
                for line in (desc or "").splitlines():
                    line = line.strip()
                    if line:
                        return line
                return ""

            tools_description = "\n".join(
                f"- {t.name}: {first_line(t.description)}"
                for t in tools_response.tools
            )

            print("\nTools fetched from server:")
            print(tools_description)
            print()

            while True:
                try:
                    loop = asyncio.get_event_loop()
                    question = (await loop.run_in_executor(None, input, "You: ")).strip()
                    if not question:
                        continue

                    # LangChain LLM picks tool using live descriptions from server
                    print("[LangChain] Choosing tool...")
                    chosen_tool = llm_choose_tool(question, tools_description)
                    print(f"[LangChain] LLM chose --> {chosen_tool}")

                    # Call that MCP tool
                    await call(session, chosen_tool, {"question": question})

                except KeyboardInterrupt:
                    print("\nBye.")
                    break


if __name__ == "__main__":
    asyncio.run(main())
