# 08 - Week 1 Tasks
**Phase 1: The Skeleton** | Goal: Get all three systems talking to each other with dummy data. No real AI, no real Maven execution — just wiring the pipes.

---

## 🖥️ UI & Workspace Team — Morsy & Ezat

| # | Task | Done? |
|---|------|-------|
| 1 | Run `yo code` to scaffold a new VS Code extension project (TypeScript template). | ☐ |
| 2 | Add a right-click context menu command: **"Generate QAgent Test"**. | ☐ |
| 3 | On command trigger, capture the highlighted text from the active editor (`vscode.window.activeTextEditor.document.getText(selection)`). | ☐ |
| 4 | `console.log` the captured text to the Debug Console to confirm capture works. | ☐ |
| 5 | Hard-code a dummy JSON payload `{ "code": "<captured text>" }` and log it. | ☐ |
| 6 | Push skeleton to `feature/ui-skeleton` and open a PR for review. | ☐ |

**Definition of Done:** Right-clicking highlighted Java code triggers the command and logs a valid JSON object to the Debug Console.

---

## 🧠 AI & Backend Team — Neriman & Mariam

| # | Task | Done? |
|---|------|-------|
| 1 | Initialize a new Node.js project: `npm init -y` in a `/backend` folder. | ☐ |
| 2 | Install Express.js: `npm install express`. | ☐ |
| 3 | Create `server.js` with a single `POST /generate` route. | ☐ |
| 4 | The route accepts `{ "code": "..." }` in the request body (`npm install body-parser`). | ☐ |
| 5 | Hard-code a fake JUnit 5 test string as the response — **no Ollama yet**. | ☐ |
| 6 | Test the endpoint manually with Postman or `curl`. | ☐ |
| 7 | Push to `feature/ai-server-skeleton` and open a PR for review. | ☐ |

**Definition of Done:** A `POST` to `http://localhost:3000/generate` with any body returns a hardcoded fake Java test string with HTTP 200.

---

## ⚙️ DevOps & Execution Team — Habashy & Hossam

| # | Task | Done? |
|---|------|-------|
| 1 | Log in to Oracle Cloud and confirm the ARM VM instance is online (check CPU/RAM). | ☐ |
| 2 | SSH into the server and verify Node.js is installed (`node -v`). If not, install it. | ☐ |
| 3 | Verify Git is installed (`git -v`). Clone the repo onto the server. | ☐ |
| 4 | Verify Ollama is installed (`ollama -v`). If not, install it. | ☐ |
| 5 | Pull the LLM model: `ollama pull deepseek-coder` (or `llama3`). Let it run. | ☐ |
| 6 | On your **local machine**, create a `runner.js` file inside the extension codebase. | ☐ |
| 7 | Write a Node.js function that hard-codes and logs the string `mvn -Dtest=CalcTest test` — **no real execution yet**. | ☐ |
| 8 | Document the server's public IP and open port in `Notes/04`. | ☐ |

**Definition of Done:** Server is confirmed online with Ollama + LLM installed. `runner.js` exists and logs a hardcoded Maven command string.

---

## 📅 Week 1 Standup Checkpoints

- **Mid-week sync (Discord):** Each team confirms their skeleton compiles/runs without errors.
- **End-of-week:** All three PRs are open and cross-reviewed. No merge required yet.
