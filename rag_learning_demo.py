# Topics 5-12 and 16: local RAG demo with SQLite, chunks, vectors, Ollama, and streaming.

# Predefined library: math provides square root for cosine similarity.
import math

# Predefined library: json converts between JSON text and Python dictionaries.
import json

# Predefined library: sqlite3 stores demo PRs and chunk embeddings locally.
import sqlite3

# Predefined library: sys exits cleanly when local LLM errors happen.
import sys

# Predefined library: urllib.error handles HTTP errors from Ollama.
import urllib.error

# Predefined library: urllib.request calls the local Ollama HTTP API.
import urllib.request

# Predefined class: Counter stores simple word-count embeddings.
from collections import Counter


# Demo setting: local SQLite database file created when the script runs.
DB_NAME = "prociq_learning.db"

# Demo setting: local Ollama model used as the actual local LLM.
OLLAMA_MODEL = "llama3.2:1b"

# Topic 8: Vector similarity search - minimum score required to trust a chunk.
MIN_SIMILARITY = 0.10

# Topic 8: Vector similarity search - remove weak matches before sending context to LLM.
STOP_WORDS = {
    "a", "an", "and", "any", "are", "as", "at", "be", "because", "before",
    "can", "does", "for", "from", "has", "is", "it", "of", "on", "or",
    "the", "this", "to", "when", "why", "with",
}

# Topic 6: Embeddings concept - normalize similar/typo words before comparison.
WORD_NORMALIZATION = {
    "prerequicities": "prerequisites",
    "prerequisites": "requires",
    "prerequisite": "requires",
    "needed": "requires",
    "need": "requires",
    "needs": "requires",
}

# Demo source text: small policy document used for chunking and retrieval.
POLICY_TEXT = """
IT purchases above 100000 require Finance approval before the purchase request can move forward.
Office supplies below 5000 can be auto-approved when the supplier is already approved.
Supplier onboarding requires GST validation, bank validation, and risk review before PO creation.
PO cancellation requires a cancellation reason code and an audit entry.
"""


# Topic 5: Database basics - connect to local SQLite database.
def connect_db():
    return sqlite3.connect(DB_NAME)


# Topic 5: Database basics - create normal DB tables and a simple vector-table demo.
def setup_database(connection):
    connection.execute("""
        CREATE TABLE IF NOT EXISTS purchase_requests (
            pr_id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            department TEXT NOT NULL,
            item TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS policy_chunks (
            chunk_id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_name TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            text TEXT NOT NULL,
            embedding TEXT NOT NULL
        )
    """)

    connection.commit()


# Topic 5: Database basics - insert fixed demo PR data.
def seed_purchase_request(connection):
    connection.execute("""
        INSERT OR REPLACE INTO purchase_requests
        (pr_id, title, department, item, amount, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        101,
        "Cisco Router Purchase",
        "IT",
        "Cisco Router",
        240000,
        "Draft",
    ))

    connection.commit()


# Topic 7: Text chunking strategies - split policy text into sentence chunks.
def chunk_text(text):
    sentences = [
        sentence.strip()
        for sentence in text.split(".")
        if sentence.strip()
    ]

    chunks = []
    for index, sentence in enumerate(sentences, start=1):
        chunks.append({
            "chunk_index": index,
            "text": sentence + ".",
        })

    return chunks


# Topic 6: Embeddings concept - create a simple word-count embedding for learning.
def create_embedding(text):
    cleaned_text = text.lower()
    for character in ".,?;:()":
        cleaned_text = cleaned_text.replace(character, " ")

    words = []
    for word in cleaned_text.split():
        normalized_word = WORD_NORMALIZATION.get(word, word)
        if normalized_word not in STOP_WORDS:
            words.append(normalized_word)

    return Counter(words)


# Topic 8: Vector similarity search - choose a clean retrieval query.
def build_retrieval_query(question, pr):
    policy_only_keywords = {"supplier", "onboarding", "policy", "prerequisites"}
    question_words = set(create_embedding(question))

    if question_words & policy_only_keywords:
        return question

    return (
        f"{question} "
        f"Department {pr['department']} "
        f"Item {pr['item']} "
        f"Amount {pr['amount']:.0f}"
    )


# Topic 9: Vector databases - convert embedding to text so SQLite can store it.
def serialize_embedding(embedding):
    return " ".join(
        f"{word}:{count}"
        for word, count in sorted(embedding.items())
    )


# Topic 9: Vector databases - convert stored text back into an embedding.
def deserialize_embedding(embedding_text):
    result = Counter()
    if not embedding_text:
        return result

    for item in embedding_text.split():
        word, count = item.split(":")
        result[word] = int(count)

    return result


# Topic 8: Vector similarity search - compare two simple embeddings.
def cosine_similarity(left, right):
    common_words = set(left) & set(right)
    dot_product = sum(left[word] * right[word] for word in common_words)

    left_length = math.sqrt(sum(value * value for value in left.values()))
    right_length = math.sqrt(sum(value * value for value in right.values()))

    if left_length == 0 or right_length == 0:
        return 0

    return dot_product / (left_length * right_length)


# Topics 7, 8, 9: chunk policy text, embed chunks, and store them.
def seed_policy_chunks(connection):
    connection.execute("DELETE FROM policy_chunks")

    chunks = chunk_text(POLICY_TEXT)
    for chunk in chunks:
        embedding = create_embedding(chunk["text"])
        connection.execute("""
            INSERT INTO policy_chunks
            (document_name, chunk_index, text, embedding)
            VALUES (?, ?, ?, ?)
        """, (
            "Procurement Policy Manual",
            chunk["chunk_index"],
            chunk["text"],
            serialize_embedding(embedding),
        ))

    connection.commit()


# Topic 5: Database basics - read structured PR data from SQL table.
def get_purchase_request(connection, pr_id):
    cursor = connection.execute("""
        SELECT pr_id, title, department, item, amount, status
        FROM purchase_requests
        WHERE pr_id = ?
    """, (pr_id,))

    row = cursor.fetchone()
    if row is None:
        return None

    return {
        "pr_id": row[0],
        "title": row[1],
        "department": row[2],
        "item": row[3],
        "amount": row[4],
        "status": row[5],
    }


# Topics 8, 9: search stored chunk embeddings and return closest chunks.
def search_policy_chunks(connection, question, top_k=2):
    question_embedding = create_embedding(question)

    cursor = connection.execute("""
        SELECT chunk_id, document_name, chunk_index, text, embedding
        FROM policy_chunks
    """)

    results = []
    for row in cursor.fetchall():
        chunk_embedding = deserialize_embedding(row[4])
        similarity = cosine_similarity(question_embedding, chunk_embedding)
        results.append({
            "chunk_id": row[0],
            "document_name": row[1],
            "chunk_index": row[2],
            "text": row[3],
            "similarity": similarity,
        })

    results.sort(key=lambda item: item["similarity"], reverse=True)
    return results[:top_k]


# Topics 10, 12, 16: use local LLM with RAG context and stream answer tokens.
def stream_answer_with_local_llm(pr, chunks, question, include_pr=True):
    context = "\n".join(
        f"- {chunk['text']} "
        f"(Source: {chunk['document_name']}, chunk {chunk['chunk_index']})"
        for chunk in chunks
    )

    pr_context = ""
    if include_pr:
        pr_context = f"""
Purchase request:
PR ID: {pr['pr_id']}
Title: {pr['title']}
Department: {pr['department']}
Item: {pr['item']}
Amount: {pr['amount']:.0f}
Status: {pr['status']}
"""

    prompt = f"""
You are Pico, a procurement assistant for ProcIQ.
Use only the given purchase request and policy context.
Answer in 1 short sentence.
Do not include source labels.

Question:
{question}
{pr_context}

Policy context:
{context}
"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
        "options": {
            "temperature": 0.1,
        },
    }

    request = urllib.request.Request(
        "http://127.0.0.1:11434/api/generate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            for line in response:
                if not line.strip():
                    continue

                event = json.loads(line.decode("utf-8"))
                if event.get("done"):
                    break

                token = event.get("response", "")
                if token:
                    yield token
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Ollama returned an error for model {OLLAMA_MODEL}: {details}\n"
            f"Install the model with: ollama pull {OLLAMA_MODEL}"
        ) from error
    except urllib.error.URLError as error:
        raise RuntimeError(
            "Could not connect to local Ollama at http://127.0.0.1:11434.\n"
            "Start Ollama first, then run this script again."
        ) from error
    except (TimeoutError, KeyError, json.JSONDecodeError) as error:
        raise RuntimeError("Local LLM response could not be read correctly.") from error


# Topic 12: RAG architecture - retrieve DB data, retrieve chunks, then call LLM.
def main():
    connection = connect_db()
    setup_database(connection)
    seed_purchase_request(connection)
    seed_policy_chunks(connection)

    pr = get_purchase_request(connection, 101)
    question = "Why does this Cisco router PR need Finance approval?"
    retrieval_query = build_retrieval_query(question, pr)
    include_pr_context = retrieval_query != question
    chunks = [
        chunk
        for chunk in search_policy_chunks(
            connection,
            retrieval_query,
            top_k=2 if include_pr_context else 1,
        )
        if chunk["similarity"] >= MIN_SIMILARITY
    ]
    print("Question:")
    print(question)

    print("\nPurchase request from SQL database:")
    print(pr)

    print("\nRetrieval query used for vector search:")
    print(retrieval_query)

    print("\nTop policy chunks from vector similarity search:")
    for chunk in chunks:
        print(f"- score={chunk['similarity']:.2f} | {chunk['text']}")

    if not chunks:
        print("\nNo relevant policy chunks found.")
        print("Try asking a procurement question, for example:")
        print("- Why does this Cisco router PR need Finance approval?")
        print("- Any prerequisites for supplier onboarding?")
        connection.close()
        return

    print(f"\nStreaming local LLM answer using {OLLAMA_MODEL}:")
    answer_parts = []
    try:
        for token in stream_answer_with_local_llm(
            pr,
            chunks,
            question,
            include_pr=include_pr_context,
        ):
            print(token, end="", flush=True)
            answer_parts.append(token)
    except RuntimeError as error:
        print("\n\nLocal LLM error:")
        print(error)
        connection.close()
        sys.exit(1)

    answer = "".join(answer_parts).strip()
    print()

    print("\nRetrieved source used for the answer:")
    best_chunk = chunks[0]
    print(f"{best_chunk['document_name']}, chunk {best_chunk['chunk_index']}")

    connection.close()


if __name__ == "__main__":
    main()
