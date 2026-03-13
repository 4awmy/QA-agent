# ⚙️ DevOps & Execution: Week 2 Tasks

**Phase 1 Goal: "The Skeleton"**
*Establish connections with dummy data. No real AI or complex code parsing yet.*

Week 2 is about **wiring everything together**. By the end of this week, we should have a working end-to-end skeleton: a request comes in, our server receives it, triggers the local runner, and hands back a formatted result — all with dummy data.

---

## 🎯 Task 1: Stand Up the Express API on the Oracle Server

*Goal: Deploy a real (but simple) Express.js server to our provisioned Oracle VM so the team can hit it over the network.*

- [ ] **Clone the repo** on the Oracle server via SSH (`git clone ...`).
- [ ] **Install dependencies:** Run `npm install` inside the server project directory.
- [ ] **Create a `POST /run-tests` route:** Accept the `AI -> DevOps` JSON payload (defined in `05 - API Contract.md`). For now, just log the body and return a hardcoded success response.
- [ ] **Start with PM2:** Run `pm2 start index.js --name qa-agent-api` and confirm it auto-restarts on crash (`pm2 startup`).
- [ ] **Smoke test from local machine:** Use `curl` or Postman to hit `http://<SERVER_IP>:3000/run-tests` with your `sample-input.json` (from Week 1, Task 3) and verify a 200 response.

---

## 🎯 Task 2: Integrate the Local Runner into the Express Route

*Goal: When the API receives a request, it triggers the local Maven runner script from Week 1 and returns a real (but still mocked) result.*

- [ ] **Import the runner script:** Move / refactor `runner.js` (from Week 1) into the server project as a module, e.g., `lib/runner.js`, and `module.exports` its core function.
- [ ] **Wire it to the route:** In the `POST /run-tests` handler, call the runner function, passing the `generatedCode` from the request body.
- [ ] **Write the generated code to a temp file:** Save `generatedCode` to a temporary `.java` file on disk before invoking Maven (use `fs.writeFileSync` for now).
- [ ] **Return a structured result:** After Maven finishes, format the output into the **`DevOps -> UI Result`** JSON schema and send it back as the response body.

---

## 🎯 Task 3: End-to-End Skeleton Test

*Goal: Run a full dummy request through the entire pipeline and confirm every layer responds correctly.*

- [ ] **Create a full test payload:** Write a `test-full-flow.json` file that contains a fake `generatedCode` block (a simple, valid Java test class that you know will pass or fail predictably).
- [ ] **Send the request:** POST `test-full-flow.json` to the live server endpoint.
- [ ] **Verify the response shape:** Confirm the JSON response matches the `DevOps -> UI Result` contract exactly (correct keys: `executionStatus`, `compileError`, `failedLine`, `errorMessage`).
- [ ] **Test the failure case:** Intentionally send a broken Java snippet and confirm `compileError: true` is returned (or an appropriate error structure).

---

## 🎯 Task 4: Handoff & Team Sync

*Goal: Make sure the other pairs can depend on our work going into Phase 2.*

- [ ] **Update `WEEK_2_TASKS.md`** checkboxes as you complete each item.
- [ ] **Document the live server URL** and any auth / firewall notes in `Notes/04 - DevOps & Local Execution.md` so Morsy/Ezat and Neriman/Mariam know where to point requests.
- [ ] **Share `test-full-flow.json`** with the team as a reference for what a valid request looks like in practice.
- [ ] **Team sync:** Confirm with Neriman/Mariam that the Express route path (`POST /run-tests`) matches what they plan to call from the AI layer.
