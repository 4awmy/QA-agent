# ⚙️ Week 2 Tasks — DevOps & Execution Team
**Team:** Omar Habashy & Omar Hossam
**Branch:** `feature/devops-runner`
**Phase:** 1 — The Skeleton (cont.)
**Goal:** Confirm the full server stack is stable, then expand `runner.js` to actually **save** the returned test code to disk and **execute** a real Maven command in the background — the first time anything actually compiles.

---

## 📋 Pre-Requisites

- [ ] Week 1 tasks are 100% complete
  - Oracle VM is online and SSH-accessible
  - Ollama and `deepseek-coder` are installed
  - Port 3000 is open in VCN and OS firewall
  - `runner.js` skeleton with `buildMavenCommand` and `resolveTestFilePath` is committed
  - All 3 Jest tests pass
- [ ] You have a local Java + Maven environment ready:
  - `java -version` → prints Java 11+ 
  - `mvn -version` → prints Maven 3.x
- [ ] You are on the correct branch: `git checkout feature/devops-runner`
- [ ] The AI team's server is running — confirm: `curl http://<SERVER_IP>:3000/health`

---

## 💻 Part A: Expand the Runner (Hossam — primary, Habashy reviews)

### 🔨 Task A1 — Add File System Save Functionality

**Why:** The runner needs to take the `generatedCode` string from the server response and write it to the correct path on the user's disk before Maven can compile it.

**Steps:**

1. Open `qagent-zero/src/runner.js`.
2. Add the `saveTestFile` function:

```javascript
const fs   = require('fs');
const path = require('path');

/**
 * Saves the generated Java test code to the correct Maven test directory.
 * @param {string} generatedCode - The full Java test class as a string
 * @param {string} packageName   - e.g. "com.store.billing"
 * @param {string} className     - e.g. "OrderCalculator" (NOT OrderCalculatorTest)
 * @param {string} projectRoot   - Absolute path to the user's Maven project root
 * @returns {string} - The absolute path where the file was saved
 */
function saveTestFile(generatedCode, packageName, className, projectRoot) {
    const testFilePath = resolveTestFilePath(packageName, className, projectRoot);
    const testDir = path.dirname(testFilePath);

    // Create all intermediate directories if they don't exist
    // e.g. creates: src/test/java/com/store/billing/
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
        console.log(`[Runner] Created directory: ${testDir}`);
    }

    fs.writeFileSync(testFilePath, generatedCode, 'utf-8');
    console.log(`[Runner] Test file saved to: ${testFilePath}`);

    return testFilePath;
}
```

3. Add this function to your module exports:
   ```javascript
   module.exports = { buildMavenCommand, resolveTestFilePath, saveTestFile };
   ```

**Verify manually:**
```javascript
// Add a manual test at the bottom of runner.js temporarily
const code = `package com.test;\npublic class HelloTest {}`;
const savedPath = saveTestFile(code, 'com.test', 'Hello', '/tmp/test-project');
console.log('Saved to:', savedPath);
// Then check: cat /tmp/test-project/src/test/java/com/test/HelloTest.java
```

- [ ] ✅ File is created at the correct path
- [ ] ✅ Intermediate directories are created automatically (no `ENOENT` errors)
- [ ] ✅ File content matches the input string exactly

---

### 🔨 Task A2 — Add Real Maven Execution with `child_process.spawn`

**Why:** This is the biggest step of Phase 1. We will now actually run Maven. The test will likely **fail** (because the generated code is a skeleton, not a real test for anything) — and that is **expected**. The goal is to confirm Maven runs and exits cleanly.

**Steps:**

1. Add `runMaven` to `runner.js`:

```javascript
const { spawn } = require('child_process');

/**
 * Runs Maven test for the specified test class.
 * Uses spawn (not exec) to stream output line-by-line.
 * @param {string} className   - e.g. "OrderCalculatorTest"
 * @param {string} projectRoot - Absolute path to the Maven project root (contains pom.xml)
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
function runMaven(className, projectRoot) {
    return new Promise((resolve, reject) => {
        const command = buildMavenCommand(className);
        console.log(`[Runner] Executing: ${command} in ${projectRoot}`);

        const mavenProcess = spawn('mvn', [`-Dtest=${className}Test`, 'test', '--no-transfer-progress'], {
            cwd: projectRoot,
            shell: true  // Required on Windows for 'mvn' to be found in PATH
        });

        let stdoutBuffer = '';
        let stderrBuffer = '';

        mavenProcess.stdout.on('data', (data) => {
            const line = data.toString();
            stdoutBuffer += line;
            process.stdout.write(`[Maven] ${line}`); // Stream to our console
        });

        mavenProcess.stderr.on('data', (data) => {
            const line = data.toString();
            stderrBuffer += line;
            process.stderr.write(`[Maven ERR] ${line}`);
        });

        mavenProcess.on('close', (exitCode) => {
            console.log(`[Runner] Maven process exited with code: ${exitCode}`);
            resolve({ exitCode, stdout: stdoutBuffer, stderr: stderrBuffer });
        });

        mavenProcess.on('error', (err) => {
            // This fires if 'mvn' command is not found in PATH
            reject(new Error(`[Runner] Failed to start Maven: ${err.message}. Is Maven installed and in PATH?`));
        });
    });
}
```

2. Export it: add `runMaven` to `module.exports`.

**Verify with a manual test (create a real Maven project first):**
```bash
# Create a minimal Maven test project
mvn archetype:generate -DgroupId=com.test -DartifactId=test-proj -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd test-proj
```
Then update `runner.js` manual test section to call `runMaven('App', '/path/to/test-proj')`.

- [ ] ✅ `runMaven` resolves with an object containing `exitCode`, `stdout`, `stderr`
- [ ] ✅ Maven output streams to console in real time (not buffered)
- [ ] ✅ If `mvn` is not found, a clear error is thrown (not a silent crash)

---

### 🔨 Task A3 — Parse Maven Output for Pass/Fail Status

**Why:** The raw Maven output is hundreds of lines. We need to extract only the signal: did the test pass or fail? This will eventually be sent back to the UI team.

**Steps:**

1. Add a `parseMavenOutput` function:

```javascript
/**
 * Parses Maven stdout to extract test result summary.
 * @param {string} stdout - Full Maven stdout string
 * @param {number} exitCode - Maven process exit code
 * @returns {{ executionStatus: string, compileError: boolean, failedLine: number|null, errorMessage: string|null }}
 */
function parseMavenOutput(stdout, exitCode) {
    // Check for compilation failure
    const isCompileError = stdout.includes('[ERROR] COMPILATION ERROR');

    // Check for test failures
    const isTestFailure = stdout.includes('BUILD FAILURE') && !isCompileError;

    // Try to extract failure line number
    // Pattern: "  OrderCalculatorTest.java:[42,10] error: ..."
    const lineMatch = stdout.match(/\.java:\[(\d+),\d+\]/);
    const failedLine = lineMatch ? parseInt(lineMatch[1]) : null;

    // Try to extract the specific failure message
    // Pattern: "expected: <100.0> but was: <90.0>"
    const errorMatch = stdout.match(/expected:.*but was:.*/i);
    const errorMessage = errorMatch ? errorMatch[0] : null;

    if (exitCode === 0) {
        return { executionStatus: 'PASSED', compileError: false, failedLine: null, errorMessage: null };
    } else if (isCompileError) {
        return { executionStatus: 'FAILED', compileError: true, failedLine: failedLine, errorMessage: 'Compilation error in generated test code.' };
    } else {
        return { executionStatus: 'FAILED', compileError: false, failedLine: failedLine, errorMessage: errorMessage };
    }
}
```

2. The full result object matches the API contract's **DevOps → UI** response format:
   ```json
   {
     "executionStatus": "FAILED",
     "compileError": false,
     "failedLine": 42,
     "errorMessage": "expected: <100.0> but was: <90.0>"
   }
   ```
3. Export `parseMavenOutput`.

- [ ] ✅ `parseMavenOutput` correctly identifies `PASSED` when `exitCode === 0`
- [ ] ✅ `parseMavenOutput` sets `compileError: true` when `COMPILATION ERROR` is in stdout

---

### 🔨 Task A4 — Write Unit Tests for New Functions

**Steps:**

1. Add new tests to `runner.test.js`:

```javascript
const { buildMavenCommand, resolveTestFilePath, parseMavenOutput } = require('./runner');

// ... existing tests ...

test('parseMavenOutput reports PASSED on exitCode 0', () => {
    const result = parseMavenOutput('BUILD SUCCESS', 0);
    expect(result.executionStatus).toBe('PASSED');
    expect(result.compileError).toBe(false);
});

test('parseMavenOutput detects compile error', () => {
    const stdout = '[ERROR] COMPILATION ERROR\n[ERROR] OrderCalculatorTest.java:[15,10] error: ';
    const result = parseMavenOutput(stdout, 1);
    expect(result.executionStatus).toBe('FAILED');
    expect(result.compileError).toBe(true);
});

test('parseMavenOutput detects test failure with exit code 1', () => {
    const stdout = 'BUILD FAILURE\nexpected: <100.0> but was: <90.0>';
    const result = parseMavenOutput(stdout, 1);
    expect(result.executionStatus).toBe('FAILED');
    expect(result.compileError).toBe(false);
    expect(result.errorMessage).toContain('expected');
});
```

2. Run: `npm test` — all tests must pass.

- [ ] ✅ All Jest tests pass (original 3 + new 3 = 6 total)

---

## ⚙️ Part B: Server Infrastructure (Habashy)

### 🔨 Task B1 — Server Stability & Monitoring

**Steps:**

1. Run the server for 24 hours under PM2 and then check:
   ```bash
   pm2 show qagent-api
   # Check: 'restarts' counter should be 0 or very low
   # Check: 'uptime' should be ~24h
   ```
2. Check log file sizes don't grow unbounded:
   ```bash
   pm2 logs qagent-api --lines 50
   ls -lh ~/.pm2/logs/
   ```
3. If logs are very large, configure PM2 log rotation:
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 5
   ```

- [ ] ✅ Server has 0 unplanned restarts after 24 hours of running
- [ ] ✅ Log rotation is configured

---

### 🔨 Task B2 — End-to-End Integration Test with All Three Teams

**This is the most important test of Phase 1.**

**The goal:** Trigger the VS Code extension on a real `.java` file, watch the request arrive at the server, receive the response, have `runner.js` save it, and run Maven.

**Coordination steps:**

1. Set up a shared Maven test project locally (ask Ezat/Morsy what project they're testing with, or create one with `mvn archetype:generate`).
2. Have Morsy/Ezat trigger the extension against a Java function in that project.
3. Watch PM2 logs in real time:
   ```bash
   pm2 logs qagent-api
   ```
4. The extension will receive the hardcoded test code → your job is to manually call `saveTestFile` and `runMaven` with that code against the actual project.
5. Capture the Maven output and run `parseMavenOutput` on it — note what status comes back.

**Document the result in `Notes/04`:**
- What was the exit code?
- Was it a compile error or test failure?
- What did `parseMavenOutput` return?

- [ ] ✅ `saveTestFile` writes the returned code to the correct Maven project path
- [ ] ✅ `runMaven` executes without crashing
- [ ] ✅ `parseMavenOutput` returns a meaningful result object

---

## 🔨 Task C — Push & Open Pull Request

**Steps:**

1. Commit everything:
   ```bash
   git add qagent-zero/src/runner.js qagent-zero/src/runner.test.js Notes/
   git commit -m "feat(devops): add saveTestFile, runMaven, parseMavenOutput to runner + 6 passing tests"
   git push origin feature/devops-runner
   ```
2. Open a Pull Request:
   - **Title:** `feat(devops): Week 2 — real file save, Maven execution, and output parsing`
   - **Description:** Include:
     - Screenshot of `npm test` showing all 6 tests passing
     - Screenshot of `pm2 status` showing server `online`
     - Terminal output of a real Maven run (even if it shows BUILD FAILURE — that's fine!)
     - The `parseMavenOutput` result object from the integration test
   - **Reviewer:** Cross-team (UI or AI)

- [ ] ✅ All evidence attached to the PR

---

## 📅 Week 2 Definition of Done

You are done with Week 2 when **all of the following are true:**
1. `saveTestFile` creates a `.java` file at the correct Maven directory path.
2. `runMaven` executes Maven and streams output to the console — no crashes.
3. `parseMavenOutput` correctly categorizes the result as `PASSED`, `FAILED`, or compile error.
4. All 6 Jest unit tests pass.
5. Server is stable on Oracle Cloud with 0 unplanned restarts and log rotation configured.
6. At least one real end-to-end test (save → Maven) has been completed against a real Maven project.
7. PR is open with all evidence and reviewed by a cross-team member.
