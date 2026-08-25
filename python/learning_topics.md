# LangChain + MCP — Beginner Learning Roadmap

## Phase 1: Python Basics Needed First
- [ ] Functions, decorators (`@something`)
- [ ] `async` / `await` (MCP uses this heavily)
- [ ] `pip install`, virtual environments

---

## Phase 2: LangChain Core

- [x] **What is LangChain** — toolkit connecting AI to data, tools, memory
- [x] **LLM** — call AI model via LangChain
- [x] **Prompt Templates** — reusable prompt structure
- [x] **Chains** — pipe steps together (output of step N → input of step N+1)
- [ ] **Output Parsers** — extract clean text/JSON from response
- [ ] **Tools** — give AI a function it can call
- [ ] **Agents** — AI decides which tool to use, when
- [ ] **Memory** — AI remembers past messages

---

## Phase 3: MCP Core

- [ ] **What is MCP** — protocol for AI ↔ tools communication
- [ ] **MCP Server** — your code that exposes tools
- [ ] **MCP Client** — connects AI to your server
- [ ] **Transport types** — stdio vs SSE (how server/client talk)
- [ ] **MCP Tools** — expose functions via MCP
- [ ] **MCP Resources** — expose data/files via MCP

---

## Phase 4: LangChain + MCP Together

- [ ] **langchain-mcp-adapters** — bridge package
- [ ] Convert MCP tools → LangChain tools
- [ ] LangChain Agent using MCP server tools
- [ ] Multi-server setup (connect multiple MCP servers)

---

## Phase 5: Real App

- [ ] Build MCP server with your own tools
- [ ] Connect LangChain agent to that server
- [ ] Add memory to agent
- [ ] Test full conversation flow

---

## Progress

```
Phase 1 ████████░░  ~80% (need async/await)
Phase 2 ██░░░░░░░░  ~20% (What is LangChain + Chains done)
Phase 3 ░░░░░░░░░░   0%
Phase 4 ░░░░░░░░░░   0%
Phase 5 ░░░░░░░░░░   0%
```

---

## Recommended Order
`async/await` → `Output Parsers` → `Tools` → `Agents` → `Memory` → MCP topics → combine
