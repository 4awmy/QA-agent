# 09 - Week 2 Tasks
**Phase 1: The Skeleton (cont.)** | Goal: Connect the three systems end-to-end with dummy data. By the end of Week 2, clicking the extension command should call the backend and show a placeholder response — the full loop, zero real AI.

---

## 🖥️ UI & Workspace Team — Morsy & Ezat

| # | Task | Done? |
|---|------|-------|
| 1 | Install `node-fetch` (or use the built-in `https` module) inside the extension to make HTTP requests. | ☐ |
| 2 | Wire the command to send the dummy JSON payload via `POST` to `http://<SERVER_IP>:3000/generate`. | ☐ |
| 3 | Receive the hardcoded test string response from the backend. | ☐ |
| 4 | Display the received string inside a VS Code **Information Message** (`vscode.window.showInformationMessage`). | ☐ |
| 5 | Handle the request with a basic `try/catch` — show an **Error Message** if the server is unreachable. | ☐ |
| 6 | Open a PR on `feature/ui-skeleton` with the HTTP integration added. | ☐ |

**Definition of Done:** Triggering the extension command results in a VS Code popup showing the fake test string returned from the backend.

---

## 🧠 AI & Backend Team — Neriman & Mariam

| # | Task | Done? |
|---|------|-------|
| 1 | Add `cors` middleware (`npm install cors`) so the extension can call the server without browser-policy errors. | ☐ |
| 2 | Add basic request validation: return HTTP 400 if `code` field is missing from the request body. | ☐ |
| 3 | Improve the hardcoded response to look like a realistic JUnit 5 class (proper imports, `@Test`, assertions). | ☐ |
| 4 | Add console logging for every incoming request (timestamp + first 50 chars of `code`). | ☐ |
| 5 | Deploy the updated `server.js` to the Oracle Cloud VM (`git pull` on the server). | ☐ |
| 6 | Confirm the live server responds correctly by testing with Postman against the public IP. | ☐ |
| 7 | Open a PR on `feature/ai-server-skeleton` with all changes. | ☐ |

**Definition of Done:** The live server at `http://<SERVER_IP>:3000/generate` validates input and returns a well-formed fake JUnit 5 test class.

---

## ⚙️ DevOps & Execution Team — Habashy & Hossam

| # | Task | Done? |
|---|------|-------|
| 1 | Install `PM2` on the Oracle server: `npm install -g pm2`. | ☐ |
| 2 | Start the backend with PM2: `pm2 start server.js --name qagent-api`. | ☐ |
| 3 | Save the PM2 process list: `pm2 save` and run `pm2 startup` to survive reboots. | ☐ |
| 4 | Expand `runner.js`: write a function that accepts a `className` string and **constructs** (but does not yet execute) the correct Maven command string. | ☐ |
| 5 | Write a basic integration test: call the live backend from a local Node.js script and log the response. | ☐ |
| 6 | Verify port `3000` is open on the Oracle VCN firewall. Test with `curl http://<SERVER_IP>:3000/generate`. | ☐ |
| 7 | Document PM2 commands and the curl test result in `Notes/04`. | ☐ |

**Definition of Done:** The backend runs persistently on the server under PM2, survives a manual restart, and port 3000 is confirmed reachable from outside.

---

## 🔗 End-of-Week 2: Full Loop Verification

All three teams should be able to demonstrate the following sequence together:

```
User highlights code in VS Code
        ↓
Extension sends POST /generate to Oracle server
        ↓  
Express server returns hardcoded JUnit 5 string
        ↓
VS Code popup shows the response
        ↓
PM2 shows server still running → ✅
```

- **PR Merges:** All three Week 1–2 PRs are reviewed and merged to `main` before Phase 2 begins.
- **Standup:** Final 15-min sync to agree on the Phase 2 kickoff plan.
