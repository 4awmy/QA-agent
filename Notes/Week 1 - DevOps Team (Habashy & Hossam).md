# ⚙️ Week 1 Tasks — DevOps & Execution Team
**Team:** Omar Habashy & Omar Hossam
**Branch:** `feature/devops-runner`
**Phase:** 1 — The Skeleton
**Goal:** Get the Oracle Cloud server online and verified, install the full dev stack (Node, Git, Ollama, LLM), and write the skeleton `runner.js` module that logs a hardcoded Maven command — no real execution yet.

---

## 📋 Who Does What This Week

| Area | Owner |
|------|-------|
| Oracle VM setup, SSH, Ollama install | **Habashy** (primary) |
| `runner.js` skeleton, Node.js local code | **Hossam** (primary) |
| Both review each other's work before PR | Both |

---

## 📋 Pre-Requisites

- [ ] Both have access to the **Oracle Cloud Console** (confirm login works for both)
- [ ] Both have an SSH key pair configured for the VM (or use the Oracle-provided one)
- [ ] Hossam has a local Java environment ready: `java -version` and `mvn -version` should both work
- [ ] Read `Notes/04 - DevOps & Local Execution.md` and `Notes/05 - API Contract.md`
- [ ] Confirm branches exist: `git checkout -b feature/devops-runner`

---

## ⚙️ Part A: Server Infrastructure (Habashy)

### 🔨 Task A1 — Verify Oracle VM is Online

**Steps:**

1. Log in to [Oracle Cloud Console](https://cloud.oracle.com).
2. Navigate to `Compute → Instances`.
3. Confirm the instance is in **"Running"** state.
4. Note down: the **Public IP address** (you'll need it for every other task).
5. SSH into the server:
   ```bash
   ssh -i <your-key.pem> ubuntu@<PUBLIC_IP>
   ```
6. Run a system health check:
   ```bash
   uname -a          # Should show: Linux ... aarch64 (ARM)
   free -h           # Should show ~24GB RAM
   nproc             # Should show 4 CPUs
   df -h /           # Check disk space — should have 40GB+
   ```
7. Update the system packages:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

- [ ] ✅ SSH connection works without errors
- [ ] ✅ System shows ARM architecture, 4 CPUs, ~24GB RAM
- [ ] ✅ System packages are updated

---

### 🔨 Task A2 — Install Node.js on the Server

**Why:** Node.js is needed to run Neriman & Mariam's Express.js backend on this server.

**Steps:**

1. Install Node.js via `nvm` (Node Version Manager) — this is the cleanest approach on Linux:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   nvm install 20
   nvm use 20
   nvm alias default 20
   ```
2. Verify:
   ```bash
   node -v   # Should print v20.x.x
   npm -v    # Should print 10.x.x
   ```

- [ ] ✅ `node -v` returns v20.x.x on the server

---

### 🔨 Task A3 — Install Git & Clone the Repo

**Steps:**

1. Verify Git:
   ```bash
   git --version   # Should print git version 2.x.x
   ```
   If missing: `sudo apt install git -y`

2. Configure Git identity on the server:
   ```bash
   git config --global user.name "Habashy-Server"
   git config --global user.email "your@email.com"
   ```

3. Clone the repo into a clean directory:
   ```bash
   cd ~
   git clone https://github.com/YOUR_ORG/QA-agent.git
   cd QA-agent
   ```

4. Verify the `feature/ai-backend` branch is accessible:
   ```bash
   git fetch --all
   git branch -r
   ```

- [ ] ✅ Repo is cloned on the server in `~/QA-agent/`

---

### 🔨 Task A4 — Install Ollama & Download the LLM

**Why:** Ollama is the local LLM host. It must be installed and have the model pulled **before** the AI team can use it in Week 3.

**Steps:**

1. Install Ollama:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
2. Verify it installed:
   ```bash
   ollama --version
   ```
3. Start Ollama in the background:
   ```bash
   ollama serve &
   ```
4. Pull the LLM model (this will take several minutes on first run):
   ```bash
   ollama pull deepseek-coder
   ```
   > ℹ️ If storage is tight, try `ollama pull deepseek-coder:1.3b` for the smaller variant first.

5. Verify the model is available:
   ```bash
   ollama list
   # Should show: deepseek-coder  <size>
   ```

6. Do a quick sanity test to make sure inference works:
   ```bash
   ollama run deepseek-coder "Write a one-line Java hello world method."
   ```
   If you get coherent Java code back, Ollama is working.

- [ ] ✅ `ollama list` shows `deepseek-coder`
- [ ] ✅ Sanity test returns valid Java output

---

### 🔨 Task A5 — Open Port 3000 on the Oracle Firewall

**Why:** By default, Oracle Cloud blocks all inbound traffic except port 22 (SSH). Port 3000 must be opened so the VS Code extension can reach the Express server.

**Steps:**

1. Go to Oracle Cloud Console → `Networking → Virtual Cloud Networks`.
2. Click your VCN → `Security Lists` → `Default Security List`.
3. Click **"Add Ingress Rules"** and set:
   - **Source CIDR:** `0.0.0.0/0`
   - **IP Protocol:** `TCP`
   - **Destination Port Range:** `3000`
   - **Description:** `QAgent Express Backend`
4. Save the rule.
5. Also open the **OS-level firewall** on the Ubuntu VM itself:
   ```bash
   sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
   sudo netfilter-persistent save   # May need: apt install iptables-persistent
   ```
6. Test from your local machine:
   ```bash
   curl http://<PUBLIC_IP>:3000/health
   # Expected: connection refused (server not running yet — that's fine, just not "timed out")
   ```

- [ ] ✅ Oracle VCN Ingress Rule for port 3000 exists
- [ ] ✅ OS firewall updated

---

### 🔨 Task A6 — Document the Server Details

Update `Notes/04 - DevOps & Local Execution.md` with:
- [ ] Public IP address of the server
- [ ] SSH command to connect
- [ ] Confirmed installed versions (Node, Git, Ollama, LLM model name)
- [ ] Port 3000 open confirmation

---

## 💻 Part B: Local Execution Engine (Hossam)

### 🔨 Task B1 — Create the `runner.js` Module

**Why:** The runner is the module inside the VS Code extension that will eventually save files and execute Maven. Week 1 is just the skeleton — log the command string, don't actually run Maven yet.

**Steps:**

1. Inside the `qagent-zero/src/` folder (the extension codebase), create a new file: `runner.js`
2. Write the skeleton:

```javascript
// runner.js — QAgent Zero: Execution Engine
// Week 1: Skeleton only. No real Maven execution yet.
// Week 3: This module will use child_process.spawn to run mvn.

const path = require('path');

/**
 * Builds the Maven test command for a given test class.
 * @param {string} className - e.g. "OrderCalculatorTest"
 * @returns {string} - The full Maven command string
 */
function buildMavenCommand(className) {
    if (!className || typeof className !== 'string') {
        throw new Error('buildMavenCommand: className must be a non-empty string.');
    }
    const command = `mvn -Dtest=${className} test`;
    console.log(`[Runner] Built Maven command: ${command}`);
    return command;
}

/**
 * Resolves the file path where a generated test should be saved.
 * @param {string} packageName - e.g. "com.store.billing"
 * @param {string} className   - e.g. "OrderCalculator"
 * @param {string} projectRoot - The root of the user's Maven project
 * @returns {string} - Full absolute path for the test file
 */
function resolveTestFilePath(packageName, className, projectRoot) {
    // Convert "com.store.billing" -> "com/store/billing"
    const packagePath = packageName.replace(/\./g, path.sep);
    const testFileName = `${className}Test.java`;
    const fullPath = path.join(projectRoot, 'src', 'test', 'java', packagePath, testFileName);
    console.log(`[Runner] Resolved test file path: ${fullPath}`);
    return fullPath;
}

// --- Week 1 Manual Test ---
// Run this file directly with: node runner.js
if (require.main === module) {
    console.log('--- QAgent Runner: Week 1 Skeleton Test ---');
    const cmd = buildMavenCommand('OrderCalculatorTest');
    console.log(`Command: ${cmd}`);

    const filePath = resolveTestFilePath('com.store.billing', 'OrderCalculator', '/home/user/my-java-project');
    console.log(`File Path: ${filePath}`);
}

module.exports = { buildMavenCommand, resolveTestFilePath };
```

**Verify:**
```bash
node runner.js
# Expected output:
# --- QAgent Runner: Week 1 Skeleton Test ---
# [Runner] Built Maven command: mvn -Dtest=OrderCalculatorTest test
# Command: mvn -Dtest=OrderCalculatorTest test
# [Runner] Resolved test file path: /home/user/my-java-project/src/test/java/com/store/billing/OrderCalculatorTest.java
```

- [ ] ✅ `node runner.js` runs without errors and prints the correct command and file path

---

### 🔨 Task B2 — Write Unit Tests for the Runner

**Why:** The runner utility functions are pure logic (no side effects yet). We should test them now while they're simple.

**Steps:**

1. Install a lightweight test runner:
   ```bash
   cd qagent-zero
   npm install --save-dev jest
   ```
2. Add test script to `qagent-zero/package.json`:
   ```json
   "scripts": {
     "test": "jest"
   }
   ```
3. Create `qagent-zero/src/runner.test.js`:
   ```javascript
   const { buildMavenCommand, resolveTestFilePath } = require('./runner');
   const path = require('path');

   test('buildMavenCommand returns correct command string', () => {
       expect(buildMavenCommand('OrderCalculatorTest'))
           .toBe('mvn -Dtest=OrderCalculatorTest test');
   });

   test('buildMavenCommand throws on empty input', () => {
       expect(() => buildMavenCommand('')).toThrow();
       expect(() => buildMavenCommand(null)).toThrow();
   });

   test('resolveTestFilePath returns correct path structure', () => {
       const result = resolveTestFilePath('com.store.billing', 'OrderCalculator', '/project');
       expect(result).toContain('src');
       expect(result).toContain('test');
       expect(result).toContain('OrderCalculatorTest.java');
       expect(result).toContain(`com${path.sep}store${path.sep}billing`);
   });
   ```
4. Run: `npm test`

- [ ] ✅ All 3 tests pass

---

## 🔨 Task C — Push & Open Pull Request

**Steps:**

1. Commit everything:
   ```bash
   git add Notes/ qagent-zero/src/runner.js qagent-zero/src/runner.test.js
   git commit -m "feat(devops): runner.js skeleton with command builder and path resolver + tests"
   ```
2. Push: `git push origin feature/devops-runner`
3. Open a Pull Request:
   - **Title:** `feat(devops): Week 1 — server provisioned, runner.js skeleton with unit tests`
   - **Description:** Include the `ollama list` output and `node runner.js` terminal output as evidence.
   - **Reviewer:** Assign someone from the **UI or AI team**.

- [ ] ✅ PR is open with server evidence and runner test output attached

---

## 📅 Week 1 Definition of Done

You are done with Week 1 when **all of the following are true:**
1. Oracle VM is SSH-accessible, running, and has Node.js v20, Git, and Ollama installed.
2. `deepseek-coder` model is downloaded and responds to a sanity test.
3. Port 3000 is open in the Oracle VCN and the OS firewall.
4. Server details (IP, SSH command, versions) are documented in `Notes/04`.
5. `node runner.js` prints the correct Maven command and file path.
6. All 3 Jest unit tests pass.
7. PR is open and reviewed by a cross-team member.
