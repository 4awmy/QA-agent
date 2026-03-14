# 🧠 Week 2 Tasks — AI & Backend Team
**Team:** Neriman & Mariam
**Branch:** `feature/ai-backend`
**Phase:** 1 — The Skeleton (cont.)
**Goal:** Deploy the Week 1 server to Oracle Cloud, confirm it's reachable from the internet, harden the server response to look like a real JUnit 5 test, and coordinate with both other teams to validate the end-to-end loop.

---

## 📋 Pre-Requisites

- [ ] Week 1 tasks are 100% complete — the server runs locally with all validations working
- [ ] You have SSH access to the Oracle Cloud VM (get credentials from Habashy if needed)
- [ ] Confirm Habashy has already installed Node.js on the server (check `Notes/04`)
- [ ] You are on the correct branch: `git checkout feature/ai-backend`

---

## 🔨 Task 1 — Deploy to the Oracle Cloud Server

**Why:** The extension runs on the user's laptop. The backend must be on a public server for the extension to reach it. Oracle Cloud is the host.

**Steps:**

1. SSH into the Oracle VM:
   ```bash
   ssh -i <key.pem> ubuntu@<SERVER_IP>
   ```
2. Navigate to the cloned repo and pull latest changes:
   ```bash
   cd ~/QA-agent
   git fetch --all
   git checkout feature/ai-backend
   git pull origin feature/ai-backend
   ```
3. Navigate to the backend folder and install dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Start the server manually to verify it runs:
   ```bash
   node server.js
   # Should print: QAgent Backend running on http://localhost:3000
   ```
5. From your **local machine**, test the live server:
   ```bash
   curl http://<SERVER_IP>:3000/health
   # Expected: { "status": "ok", "message": "QAgent Backend is running." }
   ```

- [ ] ✅ Server runs on the Oracle VM and responds to `/health` from the internet

---

## 🔨 Task 2 — Set Up PM2 for Persistent Process Management

**Why:** If you `Ctrl+C` out of the SSH session, the server dies. PM2 keeps it running in the background, restarts it if it crashes, and survives server reboots.

**Steps:**

1. On the Oracle VM, install PM2 globally:
   ```bash
   npm install -g pm2
   ```
2. Stop the manually-running server (`Ctrl+C`) and then start it under PM2:
   ```bash
   cd ~/QA-agent/backend
   pm2 start server.js --name "qagent-api"
   ```
3. Check it's running:
   ```bash
   pm2 status
   # Should show: qagent-api   online
   ```
4. Save the PM2 process list so it survives reboots:
   ```bash
   pm2 save
   pm2 startup    # Follow the printed instructions (will ask you to run a sudo command)
   ```
5. Test crash recovery:
   ```bash
   pm2 stop qagent-api
   pm2 start qagent-api
   pm2 logs qagent-api --lines 20   # Check logs
   ```

**Useful PM2 commands to document:**
```bash
pm2 status              # Show all running processes
pm2 logs qagent-api     # Tail live server logs
pm2 restart qagent-api  # Restart after a code update
pm2 stop qagent-api     # Stop cleanly
```

- [ ] ✅ `pm2 status` shows `qagent-api` as `online`
- [ ] ✅ Server responds to `/health` after an SSH session disconnect and reconnect
- [ ] ✅ PM2 startup hook is configured (survives VM reboot)

---

## 🔨 Task 3 — Harden the Hardcoded Response

**Why:** In Week 1 the fake test was barely valid Java. This week, it must look like a real, well-structured JUnit 5 test that the DevOps team can actually compile. This is important because in Week 2, Habashy & Hossam will start testing their file-save and Maven execution against this response.

**Steps:**

1. Update the hardcoded response in `POST /generate` to use the `className` and `packageName` from the **incoming request** (even though we're still not calling Ollama):

```javascript
app.post('/generate', (req, res) => {
    const { className, packageName, targetFunction, importsContext } = req.body;

    // --- Validation (from Week 1) ---
    const missingFields = [];
    if (!className)      missingFields.push('className');
    if (!packageName)    missingFields.push('packageName');
    if (!targetFunction) missingFields.push('targetFunction');

    if (missingFields.length > 0) {
        return res.status(400).json({ status: 'error', message: `Missing: ${missingFields.join(', ')}` });
    }

    console.log(`[${new Date().toISOString()}] Generate request | class: ${className} | pkg: ${packageName}`);
    console.log(`[INFO] Function preview: ${targetFunction.substring(0, 100)}`);

    // Build a realistic-looking hardcoded test using the real class/package name
    const generatedCode = `package ${packageName};

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Auto-generated test for ${className}.
 * NOTE: This is a SKELETON test generated in Phase 1.
 * Real AI-generated tests will be implemented in Phase 2.
 */
class ${className}Test {

    private ${className} instance;

    @BeforeEach
    void setUp() {
        // TODO: initialize ${className} with appropriate constructor
        // instance = new ${className}();
    }

    @Test
    void testSkeletonPlaceholder() {
        // SKELETON: Replace with real assertions in Phase 2
        assertTrue(true, "Skeleton test always passes");
    }
}`;

    return res.status(200).json({
        status: 'success',
        generatedCode: generatedCode
    });
});
```

**Why this matters:** The DevOps team's runner will save this code to disk and try to compile it. A valid Java class structure (even a trivial one) is far less likely to cause unexpected errors than the Week 1 placeholder.

- [ ] ✅ Response now uses `className` and `packageName` from the request dynamically
- [ ] ✅ Generated code is a valid Java class skeleton (compiles with standard JUnit 5)

---

## 🔨 Task 4 — Deploy the Updated Code to the Server

**Steps:**

1. Commit the updated `server.js`:
   ```bash
   git add backend/server.js
   git commit -m "feat(ai): harden hardcoded response with real class/package names from request"
   git push origin feature/ai-backend
   ```
2. On the Oracle VM, pull and restart:
   ```bash
   cd ~/QA-agent
   git pull origin feature/ai-backend
   cd backend
   pm2 restart qagent-api
   pm2 logs qagent-api --lines 10  # Confirm "QAgent Backend running" message
   ```
3. Re-test from your local machine with the full payload:
   ```bash
   curl -X POST http://<SERVER_IP>:3000/generate \
     -H "Content-Type: application/json" \
     -d "{\"className\":\"OrderCalculator\",\"packageName\":\"com.store.billing\",\"targetFunction\":\"public double calculateTotal(double price){\",\"importsContext\":\"\"}"
   ```
   The response should contain `package com.store.billing;` and `class OrderCalculatorTest {`.

- [ ] ✅ Live server returns dynamic `generatedCode` matching the request's `className` and `packageName`

---

## 🔨 Task 5 — Coordinate the End-to-End Loop Test

**Why:** This is the most important milestone of Phase 1. All three teams need to verify that the full chain works before moving to Phase 2.

**The Chain:**
```
VS Code Extension (Morsy/Ezat)
    → POST /generate to Oracle Server (Neriman/Mariam)
        → Response returned
            → DevOps runner receives it (Habashy/Hossam)
```

**Your role in this test:**

1. Make sure the live server is running (`pm2 status`).
2. Share the exact `curl` command in the Discord standup for the UI team to verify their HTTP call format.
3. Monitor `pm2 logs qagent-api` in real time during the test to see if requests arrive:
   ```bash
   pm2 logs qagent-api
   ```
4. If the UI team reports a CORS error, check that the `cors()` middleware is active.
5. If the DevOps team reports a malformed response, check the response JSON structure against `API_CONTRACT.md`.

- [ ] ✅ At least one successful end-to-end request is visible in PM2 logs
- [ ] ✅ The log shows the correct `className` and `packageName` from the UI team's real Java file

---

## 🔨 Task 6 — Write a Server Update Script

**Why:** Every time you push a code change, you currently need to manually SSH in, `git pull`, and `pm2 restart`. Automate this.

**Steps:**

1. Create `backend/deploy.sh`:
   ```bash
   #!/bin/bash
   echo "[$(date)] Pulling latest code..."
   git pull origin feature/ai-backend
   echo "[$(date)] Installing dependencies..."
   cd backend && npm install --production
   echo "[$(date)] Restarting PM2 process..."
   pm2 restart qagent-api
   pm2 status
   echo "[$(date)] Deployment complete."
   ```
2. Make it executable: `chmod +x backend/deploy.sh`
3. Test it: `cd ~/QA-agent && bash backend/deploy.sh`

Document the deploy command in `Notes/04` so the DevOps team can also run it.

- [ ] ✅ `deploy.sh` exists and works correctly on the server

---

## 🔨 Task 7 — Final PR Update

**Steps:**

1. Commit all remaining changes:
   ```bash
   git add backend/
   git commit -m "feat(ai): dynamic hardcoded response + deploy.sh + PM2 setup docs"
   git push origin feature/ai-backend
   ```
2. Update the PR with:
   - A screenshot of `pm2 status` showing the server `online`
   - A screenshot of the curl test showing the dynamic `className`/`packageName` in the response
   - A screenshot of `pm2 logs` showing a real request arriving from the UI team
   - **Reviewer:** Cross-team (DevOps or UI)

- [ ] ✅ All evidence attached to the PR

---

## 📅 Week 2 Definition of Done

You are done with Week 2 when **all of the following are true:**
1. The server runs persistently on Oracle Cloud under PM2.
2. PM2 is configured to survive VM reboots (`pm2 startup`).
3. `POST /generate` uses `className` and `packageName` from the real request to build the response.
4. At least one real end-to-end request from the UI team's extension appears in PM2 logs.
5. `deploy.sh` exists and successfully updates + restarts the server.
6. PR is updated with all evidence and reviewed.
