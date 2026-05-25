"""
ProcIQ PR Embed Pipeline — loads Google Sheet PRs and stores vectors in Postgres.

Run once (or re-run to refresh data):
  python pr_vector_pipeline.py

LangChain concepts used:
  - Document            : wraps each PR row as text + metadata
  - RecursiveCharacterTextSplitter : splits docs into chunks
  - OllamaEmbeddings    : converts text to vectors (nomic-embed-text)
  - PGVector            : stores vectors in Aiven Postgres
"""

import os

import gspread
from google.oauth2.service_account import Credentials

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_postgres import PGVector

# ── Config ────────────────────────────────────────────────────────────────────

CREDS_PATH      = r"C:\Users\LENOVO USER\Downloads\wheelson-ai-demo-98df45a33192.json"
SHEET_ID        = "1au4j7IqhAhJNM14ifbmh5w6-TrV3iGPj1v6Bmx5VWmU"
EMBED_MODEL     = "nomic-embed-text"
COLLECTION_NAME = "pr_embeddings"

_PG_PASS = os.environ["PG_PASS"]
DB_URL = (
    f"postgresql+psycopg2://avnadmin:{_PG_PASS}"
    "@wheelson-postgres-hyperready-aiven-wheelson.h.aivencloud.com"
    ":10174/agent_tally?sslmode=require"
)

# ── Step 1: Google Sheet -> LangChain Documents ───────────────────────────────

def load_documents() -> list[Document]:
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
    ]
    creds  = Credentials.from_service_account_file(CREDS_PATH, scopes=scopes)
    client = gspread.authorize(creds)
    rows   = client.open_by_key(SHEET_ID).sheet1.get_all_records()

    docs = []
    for row in rows:
        content = (
            f"PR ID: {row['PR_ID']}. "
            f"Title: {row['Title']}. "
            f"Requester: {row['Requester']}. "
            f"Department: {row['Department']}. "
            f"Item: {row['Item']}. "
            f"Category: {row['Category']}. "
            f"Supplier: {row['Supplier']}. "
            f"Net Amount: {row['Net_Amount']}. "
            f"Status: {row['Status']}. "
            f"Approval Route: {row['Approval_Route']}. "
            f"Mode: {row['Mode']}. "
            f"Notes: {row['Notes']}."
        )
        docs.append(Document(
            page_content=content,
            metadata={
                "pr_id":      row["PR_ID"],
                "department": row["Department"],
                "status":     row["Status"],
                "net_amount": row["Net_Amount"],
                "supplier":   row["Supplier"],
            },
        ))
    return docs


# ── Step 2: Split -> Embed -> Store in Postgres ───────────────────────────────

def embed_and_store(docs: list[Document]) -> None:
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks   = splitter.split_documents(docs)
    print(f"  Split {len(docs)} documents -> {len(chunks)} chunks")

    print(f"  Embedding with {EMBED_MODEL} -> storing in Postgres...")
    PGVector.from_documents(
        documents=chunks,
        embedding=OllamaEmbeddings(model=EMBED_MODEL, keep_alive="0"),
        collection_name=COLLECTION_NAME,
        connection=DB_URL,
        pre_delete_collection=True,
    )
    print(f"  Done. Collection '{COLLECTION_NAME}' ready in Postgres.")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("ProcIQ PR Embed Pipeline")
    print("=" * 60)

    print("\nStep 1: Loading PR data from Google Sheets...")
    docs = load_documents()
    print(f"  Loaded {len(docs)} Documents.")

    print("\nStep 2: Embed -> Store in Postgres (PGVector)...")
    embed_and_store(docs)

    print("\nDone. Run MCP client to query:")
    print("  python pr_mcp_client.py")


if __name__ == "__main__":
    main()
