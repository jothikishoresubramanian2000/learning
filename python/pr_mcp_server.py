"""
ProcIQ MCP Server — tools for searching, reading, adding, and updating PRs.

Tools:
  search_prs(question)          -> vector search + LLM answer (Postgres/LangChain)
  get_pr_details(pr_id)         -> read one PR row from Google Sheet
  add_pr(...)                   -> write new PR row to Google Sheet
  update_pr(pr_id, field, val)  -> edit Status / Notes / Approval_Route in sheet

Launched by client as subprocess (stdio transport).
"""

import os
import time
from datetime import datetime

import gspread
from google.oauth2.service_account import Credentials
from mcp.server.fastmcp import FastMCP

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_postgres import PGVector

# ── Config ────────────────────────────────────────────────────────────────────

CREDS_PATH      = r"C:\Users\LENOVO USER\Downloads\wheelson-ai-demo-98df45a33192.json"
SHEET_ID        = "1au4j7IqhAhJNM14ifbmh5w6-TrV3iGPj1v6Bmx5VWmU"
EMBED_MODEL     = "nomic-embed-text"
LLM_MODEL       = "llama3.2:1b"
COLLECTION_NAME = "pr_embeddings"

_PG_PASS = os.environ["PG_PASS"]
DB_URL = (
    f"postgresql+psycopg2://avnadmin:{_PG_PASS}"
    "@wheelson-postgres-hyperready-aiven-wheelson.h.aivencloud.com"
    ":10174/agent_tally?sslmode=require"
)

PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are Pico, a procurement assistant for ProcIQ. "
        "Answer using only the PR context provided. Be concise and factual.",
    ),
    ("human", "Context:\n{context}\n\nQuestion: {question}"),
])

# ── Google Sheet helper ───────────────────────────────────────────────────────

def _get_sheet():
    """Connect to Google Sheet with read+write scope."""
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds = Credentials.from_service_account_file(CREDS_PATH, scopes=scopes)
    client = gspread.authorize(creds)
    return client.open_by_key(SHEET_ID).sheet1


def _find_pr_row(sheet, pr_id: str):
    """Return (row_index, row_dict) for given PR_ID. row_index is 1-based."""
    records = sheet.get_all_records()
    headers = sheet.row_values(1)
    for i, row in enumerate(records, start=2):  # data starts at row 2
        if str(row.get("PR_ID", "")).strip() == pr_id.strip():
            return i, row, headers
    return None, None, headers


# ── MCP server ────────────────────────────────────────────────────────────────

mcp = FastMCP("ProcIQ PR Tools")


# ── Tool 1: Vector search + LLM answer ───────────────────────────────────────

@mcp.tool()
def search_prs(question: str) -> str:
    """
    Use for questions like: which PRs need approval, show IT department PRs, PRs above budget. No specific PR ID in question.

    Use for natural language questions about PRs:
    - Which PRs need approval?
    - Show IT department PRs
    - PRs above budget threshold?

    Args:
        question: Natural language question about PRs

    Returns:
        Matched PRs and LLM-generated answer
    """
    vectorstore = PGVector(
        embeddings=OllamaEmbeddings(model=EMBED_MODEL, keep_alive="0"),
        collection_name=COLLECTION_NAME,
        connection=DB_URL,
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    retrieved_docs = retriever.invoke(question)
    time.sleep(5)

    context = "\n\n".join(doc.page_content for doc in retrieved_docs)
    llm = OllamaLLM(model=LLM_MODEL, temperature=0.1, num_ctx=512, keep_alive=0)
    chain = PROMPT | llm | StrOutputParser()
    answer = chain.invoke({"context": context, "question": question})
    time.sleep(5)

    lines = [f"Question: {question}", "", "Matched PRs:"]
    for doc in retrieved_docs:
        m = doc.metadata
        lines.append(
            f"  {m.get('pr_id','?')} | {m.get('department','?')} | "
            f"Status: {m.get('status','?')} | Amount: {m.get('net_amount','?')}"
        )
    lines += ["", f"Answer: {answer}"]
    return "\n".join(lines)


# ── Tool 2: Read one PR from sheet ────────────────────────────────────────────

@mcp.tool()
def get_pr_details(pr_id: str) -> str:
    """
    Use when question contains a specific PR ID (like PR-1003, PR-1006) and user wants to see details of that PR.

    Use when user asks for details of a specific PR by ID.
    Example: "give me PR-1006 details", "what is PR-1003?"

    Args:
        pr_id: PR ID like PR-1001, PR-1006

    Returns:
        All fields of the PR row
    """
    sheet = _get_sheet()
    _, row, _ = _find_pr_row(sheet, pr_id)

    if row is None:
        return f"PR '{pr_id}' not found in sheet."

    lines = [f"PR Details: {pr_id}", "-" * 40]
    for key, val in row.items():
        lines.append(f"  {key}: {val}")
    return "\n".join(lines)


# ── Tool 3: Add new PR to sheet ───────────────────────────────────────────────

@mcp.tool()
def add_pr(
    title: str,
    requester: str,
    department: str,
    item: str,
    category: str,
    supplier: str,
    quantity: int,
    unit_price: float,
    need_by_date: str,
    approval_route: str,
    mode: str,
    notes: str = "",
) -> str:
    """
    Use when user wants to create or raise a new PR that does not exist yet. Example: add new PR, create purchase request.

    Use when user wants to create / raise a new PR.
    Example: "add a new PR for 5 laptops from Dell for HR department"

    Args:
        title: Short title of the PR
        requester: Name of person raising the PR
        department: Department name (IT, HR, Admin, Finance, etc.)
        item: Item or service being purchased
        category: Category (IT Hardware, Office Supplies, etc.)
        supplier: Supplier name
        quantity: Number of units
        unit_price: Price per unit in INR
        need_by_date: Required date (YYYY-MM-DD)
        approval_route: Approval chain (e.g. Manager > Finance Controller)
        mode: Agent Only / Human Only / Hybrid
        notes: Any additional notes

    Returns:
        Confirmation with new PR ID
    """
    sheet = _get_sheet()
    records = sheet.get_all_records()

    # Generate next PR ID
    existing_ids = [r.get("PR_ID", "") for r in records]
    nums = [int(x.replace("PR-", "")) for x in existing_ids if x.startswith("PR-")]
    next_num = max(nums) + 1 if nums else 1001
    pr_id = f"PR-{next_num}"

    net_amount = quantity * unit_price
    tax = round(net_amount * 0.18, 2)
    gross_amount = net_amount + tax

    new_row = [
        pr_id, title, requester, department, item, category, supplier,
        quantity, unit_price, net_amount, tax, gross_amount,
        f"{department[:3].upper()}-GEN", "5000", need_by_date,
        "Submitted", approval_route, mode, "Standard", notes,
    ]

    sheet.append_row(new_row)
    return (
        f"PR created: {pr_id}\n"
        f"  Title   : {title}\n"
        f"  Item    : {item} x {quantity} @ {unit_price}\n"
        f"  Amount  : {net_amount} + tax {tax} = {gross_amount}\n"
        f"  Status  : Submitted\n"
        f"  Sheet   : row added successfully"
    )


# ── Tool 4: Update PR field in sheet ─────────────────────────────────────────

@mcp.tool()
def update_pr(pr_id: str, field: str, new_value: str) -> str:
    """
    Use when user says approve, reject, or update a specific PR ID. Example: approve PR-1003, reject PR-1006.

    Editable fields: Status, Notes, Approval_Route

    Use when user wants to change PR status or add notes.
    Example: "approve PR-1003", "update PR-1006 notes to clarification resolved"

    Args:
        pr_id: PR ID to update (e.g. PR-1003)
        field: Field to update — Status, Notes, or Approval_Route
        new_value: New value to set

    Returns:
        Confirmation of what was updated
    """
    allowed = {"Status", "Notes", "Approval_Route"}
    if field not in allowed:
        return f"Cannot edit '{field}'. Allowed fields: {', '.join(allowed)}"

    sheet = _get_sheet()
    row_idx, row, headers = _find_pr_row(sheet, pr_id)

    if row is None:
        return f"PR '{pr_id}' not found in sheet."

    col_idx = headers.index(field) + 1  # gspread is 1-based
    old_value = row.get(field, "")
    sheet.update_cell(row_idx, col_idx, new_value)

    return (
        f"Updated PR: {pr_id}\n"
        f"  Field    : {field}\n"
        f"  Old value: {old_value}\n"
        f"  New value: {new_value}"
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
