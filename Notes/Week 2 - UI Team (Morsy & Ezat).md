# 🖥️ Week 2 Tasks — UI & Workspace Team
**Team:** Morsy & Ezat
**Branch:** `feature/ui-skeleton`
**Phase:** 1 — The Skeleton (cont.)
**Goal:** Wire the extension to make a real HTTP call to the live backend server and display the hardcoded response in the VS Code editor. Close the full loop from user highlight → server → VS Code popup.

---

## 📋 Pre-Requisites

- [ ] Week 1 tasks are 100% complete and the PR is merged (or at minimum, all tasks are working locally)
- [ ] You have the **server's public IP** from Habashy (check `Notes/04 - DevOps & Local Execution.md`)
- [ ] Confirm the server is reachable: `curl http://<SERVER_IP>:3000/health` returns `{"status":"ok"}`
- [ ] You are on the correct branch: `git checkout feature/ui-skeleton`

---

## 🔨 Task 1 — Install an HTTP Client in the Extension

**Why:** The VS Code extension runs in a Node.js environment, so we can use the built-in `https` module or a lightweight package. We'll use `node-fetch` for clean async/await syntax.

**Steps:**

1. Navigate into the extension folder: `cd qagent-zero/`
2. Install node-fetch (use v2 for CommonJS compatibility):
   ```bash
   npm install node-fetch@2
   ```
3. At the top of `extension.ts`, add the import:
   ```typescript
   const fetch = require('node-fetch');
   ```

> ⚠️ **Important:** If you use ESM-style imports (`import fetch from 'node-fetch'`), you'll get TypeScript errors because the extension uses CommonJS. Stick with `require`.

- [ ] ✅ `npm install` completes, `node-fetch` appears in `package.json` dependencies
- [ ] ✅ `npm run compile` still exits with 0 errors after adding the import

---

## 🔨 Task 2 — Read the File Metadata (Package & Class Name)

**Why:** In Week 1 we hardcoded `className` and `packageName`. This week we read them from the actual open Java file. This is important because Habashy & Hossam need accurate values to build the correct file path.

**Steps:**

1. Inside your command handler, after capturing `selectedText`, add this logic:

```typescript
const document = editor.document;
const fullText = document.getText();
const fileName = document.fileName; // e.g. "C:/project/src/main/java/com/store/billing/OrderCalculator.java"

// --- Extract className from filename ---
const fileNameWithExt = fileName.split(/[\\/]/).pop() || 'UnknownClass.java';
const className = fileNameWithExt.replace('.java', '');

// --- Extract packageName from file content ---
const packageMatch = fullText.match(/^\s*package\s+([\w.]+)\s*;/m);
const packageName = packageMatch ? packageMatch[1] : 'com.unknown';

// --- Extract imports block from file content ---
const importLines = fullText.match(/^import\s+[\w.]+\s*;/gm) || [];
const importsContext = importLines.join('\n');

console.log(`[QAgent] Class: ${className}, Package: ${packageName}`);
console.log(`[QAgent] Imports: ${importsContext}`);
```

**Verify:**
- Open a real `.java` file with a `package` declaration.
- Trigger the command — Debug Console should show the correct class name and package.

- [ ] ✅ `className` is extracted correctly from the filename
- [ ] ✅ `packageName` is extracted correctly using Regex on file content
- [ ] ✅ `importsContext` captures all import lines

---

## 🔨 Task 3 — Build the Full API Payload & Send the HTTP Request

**Why:** Now that we have all four required fields, we can build the real API contract payload and send it to the backend.

**Steps:**

1. Build the payload with the extracted values:
```typescript
const payload = {
    className:      className,
    packageName:    packageName,
    targetFunction: selectedText,
    importsContext: importsContext
};
```

2. Send the request inside an `async` function. Update your command handler to be async, or extract the HTTP call into a helper function:

```typescript
// Add a helper function above activate()
async function callGenerateAPI(payload: object, serverIP: string): Promise<string> {
    const url = `http://${serverIP}:3000/generate`;
    console.log(`[QAgent] Sending request to ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 30000  // 30 second timeout
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Server error (${response.status}): ${errorBody.message}`);
    }

    const data = await response.json();

    if (data.status !== 'success' || !data.generatedCode) {
        throw new Error('Server returned an unexpected response format.');
    }

    return data.generatedCode;
}
```

3. In your command handler, call this function:
```typescript
const SERVER_IP = '<SERVER_IP>'; // Replace with actual IP from Notes/04
const generatedCode = await callGenerateAPI(payload, SERVER_IP);
console.log('[QAgent] Received generated code from server:');
console.log(generatedCode);
```

> ⚠️ **Note:** Hardcoding the IP is fine for Week 1-2. Week 3 will move this to a VS Code setting.

- [ ] ✅ HTTP POST is sent to the live server with the correct payload
- [ ] ✅ `generatedCode` string is received and logged to Debug Console

---

## 🔨 Task 4 — Display the Result in VS Code

**Why:** The user should see the generated test code, not just a console log.

**Steps:**

1. After receiving `generatedCode`, show it in a VS Code **WebView panel** (better than a popup for long code):

```typescript
// Create a WebView panel to display the generated test
const panel = vscode.window.createWebviewPanel(
    'qagentResult',
    'QAgent: Generated Test',
    vscode.ViewColumn.Beside,  // Opens in a split pane next to the editor
    {}
);

panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
        pre  { white-space: pre-wrap; word-wrap: break-word; }
        h2   { color: #4ec9b0; }
    </style>
</head>
<body>
    <h2>✅ QAgent Zero — Generated JUnit Test</h2>
    <pre>${generatedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <p><em>(Week 1 Skeleton: This is a hardcoded test. Real AI integration starts Week 3.)</em></p>
</body>
</html>
`;
```

> ℹ️ The `vscode.ViewColumn.Beside` opens the result panel next to the current editor — a much better UX than a modal popup.

- [ ] ✅ A split panel opens next to the editor showing the generated test code

---

## 🔨 Task 5 — Add a "Loading" State

**Why:** The HTTP request can take several seconds. The user shouldn't wonder if the extension froze.

**Steps:**

1. Wrap the API call inside `vscode.window.withProgress`:

```typescript
await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'QAgent: Generating test...',
    cancellable: false
}, async (progress) => {
    progress.report({ message: 'Sending code to AI server...' });
    const generatedCode = await callGenerateAPI(payload, SERVER_IP);
    progress.report({ message: 'Done! Opening result panel...' });
    // ... display logic here
});
```

- [ ] ✅ A "QAgent: Generating test..." notification appears in the bottom-right while waiting
- [ ] ✅ Notification disappears automatically once the result panel opens

---

## 🔨 Task 6 — Full Error Handling

**Why:** The server might be down, the user's network might block port 3000, or the payload might be rejected. All cases must give clear feedback.

**Steps:**

1. Wrap the full `withProgress` block in a `try/catch`:

```typescript
try {
    await vscode.window.withProgress({ ... }, async (progress) => {
        // API call here
    });
} catch (error: any) {
    const message = error.message || String(error);
    if (message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
        vscode.window.showErrorMessage(`QAgent: Cannot reach server at ${SERVER_IP}:3000. Is it online?`);
    } else if (message.includes('400')) {
        vscode.window.showErrorMessage(`QAgent: Bad request — check that you highlighted a full Java function.`);
    } else {
        vscode.window.showErrorMessage(`QAgent Error: ${message}`);
    }
    console.error('[QAgent] Error:', error);
}
```

- [ ] ✅ If the server is offline → user sees "Cannot reach server" error (not a crash)
- [ ] ✅ Any other error → user sees a descriptive error message

---

## 🔨 Task 7 — Final Compile & PR Update

**Steps:**

1. Run `npm run compile` inside `qagent-zero/` — should be 0 errors.
2. Press `F5` and do a full end-to-end test:
   - Open a `.java` file → highlight a function → right-click → "QAgent: Generate JUnit Test"
   - Loading notification appears → result panel opens with the hardcoded test code
3. Commit the changes:
   ```bash
   git add qagent-zero/
   git commit -m "feat(ui): wire HTTP call to live server, add WebView result panel and loading state"
   ```
4. Push: `git push origin feature/ui-skeleton`
5. Update your PR or open a new one — attach a **screen recording or GIF** of the full flow working end-to-end.

- [ ] ✅ Full end-to-end demo works locally
- [ ] ✅ PR updated with screen evidence

---

## 📅 Week 2 Definition of Done

You are done with Week 2 when **all of the following are true:**
1. The command extracts `className`, `packageName`, and `importsContext` from the actual open Java file.
2. The extension sends a properly structured HTTP POST to the live Oracle server.
3. A loading notification appears while waiting for the server.
4. A split WebView panel opens displaying the returned test code.
5. Network errors (server offline, timeout) show a readable error message — no crashes.
6. PR is updated with a screen recording of the full flow.
