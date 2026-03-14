# 🖥️ Week 1 Tasks — UI & Workspace Team
**Team:** Morsy & Ezat
**Branch:** `feature/ui-skeleton`
**Phase:** 1 — The Skeleton
**Goal:** Scaffold the VS Code extension from zero and make a right-click command that captures highlighted Java code and structures it into the agreed API payload format.

---

## 📋 Pre-Requisites (Before You Write a Single Line)

- [ ] Both teammates have **Node.js** installed → `node -v` (should be v18+)
- [ ] Both have **VS Code** with the **Extension Development Host** available
- [ ] Install the Yeoman scaffolder globally: `npm install -g yo generator-code`
- [ ] Read `Notes/05 - API Contract.md` — you must know the **exact JSON fields** you are responsible for sending:
  ```json
  {
    "className": "OrderCalculator",
    "packageName": "com.store.billing",
    "targetFunction": "public double calculateTotal(double price) { ... }",
    "importsContext": "import java.util.List;"
  }
  ```
- [ ] Confirm the branch exists on remote: `git checkout -b feature/ui-skeleton`

---

## 🔨 Task 1 — Scaffold the Extension Project

**Why:** `yo code` generates the correct TypeScript boilerplate for a VS Code extension so you don't have to set up webpack, tsconfig, and launch.json manually.

**Steps:**
1. Open a terminal in the repo root folder.
2. Run: `yo code`
3. Choose the following options when prompted:
   - **Type:** `New Extension (TypeScript)`
   - **Name:** `qagent-zero`
   - **Identifier:** `qagent-zero`
   - **Description:** `AI-powered JUnit 5 test generator`
   - **Initialize git repo:** `No` (we already have one)
   - **Bundle with webpack:** `No` (keep it simple for now)
   - **Package manager:** `npm`
4. The scaffolder creates a folder called `qagent-zero/`. Your source lives in `qagent-zero/src/extension.ts`.
5. Open `qagent-zero/` in VS Code: `code qagent-zero/`

**Verify:**
- Press `F5` inside VS Code — a new **Extension Development Host** window opens.
- Open the Command Palette (`Ctrl+Shift+P`) and run `Hello World`.
- You should see an info popup: *"Hello World from qagent-zero!"*

- [ ] ✅ Extension scaffolds and F5 launches a working Extension Development Host

---

## 🔨 Task 2 — Register the "Generate QAgent Test" Command

**Why:** The default `Hello World` command is a placeholder. We need to register our own command that appears in the right-click context menu inside Java files.

**Steps:**

1. Open `qagent-zero/package.json`.
2. Find the `contributes` section and **replace** the default `helloworld` command with:
   ```json
   "contributes": {
     "commands": [
       {
         "command": "qagent-zero.generateTest",
         "title": "QAgent: Generate JUnit Test"
       }
     ],
     "menus": {
       "editor/context": [
         {
           "command": "qagent-zero.generateTest",
           "when": "editorHasSelection && resourceExtname == .java",
           "group": "navigation"
         }
       ]
     }
   }
   ```
   > The `when` clause ensures the menu item only appears when text is selected **inside a `.java` file**.

3. Open `qagent-zero/src/extension.ts`.
4. Replace the `helloworld` command handler with:
   ```typescript
   const disposable = vscode.commands.registerCommand('qagent-zero.generateTest', () => {
       vscode.window.showInformationMessage('QAgent: Command triggered!');
   });
   ```

**Verify:**
- Press `F5` to relaunch.
- Open any `.java` file in the Extension Development Host (create a dummy one if needed).
- Highlight any text, right-click → you should see **"QAgent: Generate JUnit Test"** in the context menu.
- Clicking it shows the info popup.

- [ ] ✅ Right-click menu shows "QAgent: Generate JUnit Test" on `.java` files when text is selected

---

## 🔨 Task 3 — Capture the Highlighted Text

**Why:** The user's selected Java function is the core input to the entire system. We must capture it accurately before doing anything else.

**Steps:**

1. Inside the command handler in `extension.ts`, replace the `showInformationMessage` with:
   ```typescript
   const editor = vscode.window.activeTextEditor;
   if (!editor) {
       vscode.window.showErrorMessage('QAgent: No active editor found.');
       return;
   }

   const selection = editor.selection;
   if (selection.isEmpty) {
       vscode.window.showErrorMessage('QAgent: Please highlight a Java function first.');
       return;
   }

   const selectedText = editor.document.getText(selection);
   console.log('--- QAgent: Captured Text ---');
   console.log(selectedText);
   ```

2. In the Extension Development Host, open the **Debug Console** (in the *original* VS Code window, the one running the extension, go to `View → Output` or check the `DEBUG CONSOLE` tab in the bottom panel).

**Verify:**
- Highlight a Java function in a `.java` file and trigger the command.
- The exact selected text should appear in the Debug Console.

- [ ] ✅ Selected Java text is correctly captured and printed to the Debug Console

---

## 🔨 Task 4 — Build the Dummy API Payload

**Why:** Even though the AI server isn't ready yet, we must build the payload in the **exact format** defined in `API_CONTRACT.md`. This lets the AI team write their server against the same schema from day one.

**Steps:**

1. After capturing `selectedText`, build the payload object. For Week 1, use hardcoded dummy values for fields we can't extract yet (`className`, `packageName`, `importsContext`):
   ```typescript
   const payload = {
       className: "DummyClass",          // Week 2: will extract from file
       packageName: "com.dummy.pkg",     // Week 2: will extract from file
       targetFunction: selectedText,     // ✅ Real captured text
       importsContext: ""                // Week 2: will extract from file
   };

   console.log('--- QAgent: API Payload ---');
   console.log(JSON.stringify(payload, null, 2));
   ```

2. Add a VS Code info message to give user feedback: `vscode.window.showInformationMessage('QAgent: Payload built. Check Debug Console.');`

**Verify:**
- Trigger the command with highlighted text.
- Debug Console should show a clean, properly structured JSON object with the selected text in the `targetFunction` field.

- [ ] ✅ Debug Console shows a valid JSON payload matching the API contract structure

---

## 🔨 Task 5 — Error Handling & Edge Cases

**Why:** The extension should never crash silently. Every failure must give the user a clear, actionable message.

**Steps:**

1. Wrap the entire command body in a `try/catch`:
   ```typescript
   try {
       // all the code from Tasks 3 & 4
   } catch (error) {
       vscode.window.showErrorMessage(`QAgent: Unexpected error — ${error}`);
       console.error('QAgent Error:', error);
   }
   ```

2. Add a guard for when the command is triggered on a non-Java file (extra safety beyond the `when` clause):
   ```typescript
   const fileExtension = editor.document.fileName.split('.').pop();
   if (fileExtension !== 'java') {
       vscode.window.showWarningMessage('QAgent: This command only works on .java files.');
       return;
   }
   ```

- [ ] ✅ Triggering command with no selection shows an error message
- [ ] ✅ Triggering command on a non-Java file shows a warning message
- [ ] ✅ No unhandled exception crashes the Extension Development Host

---

## 🔨 Task 6 — Push & Open Pull Request

**Steps:**

1. Make sure all changes compile without TypeScript errors: `npm run compile` inside `qagent-zero/`.
2. Stage and commit:
   ```bash
   git add qagent-zero/
   git commit -m "feat(ui): scaffold extension, add generateTest command with payload capture"
   ```
3. Push the branch: `git push origin feature/ui-skeleton`
4. Open a Pull Request on GitHub:
   - **Title:** `feat(ui): Week 1 skeleton — command capture & dummy payload`
   - **Description:** Explain what the command does, include a screenshot of the Debug Console output and the right-click menu.
   - **Reviewer:** Assign someone from the **AI or DevOps team** (cross-team review required).

- [ ] ✅ `npm run compile` exits with 0 errors
- [ ] ✅ PR is open with a Debug Console screenshot attached

---

## 📅 Week 1 Definition of Done

You are done with Week 1 when **all of the following are true:**
1. Pressing `F5` launches the extension without errors.
2. Right-clicking highlighted text in a `.java` file shows **"QAgent: Generate JUnit Test"**.
3. Triggering the command logs a valid JSON payload to the Debug Console.
4. Empty selection and wrong file type both show appropriate user-facing error messages.
5. The PR is open and has received at least one review comment.
