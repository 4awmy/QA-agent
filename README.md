# 🚀 QAgent Zero: Project Master Document

## 1. Project Overview & The "Grand Compromise"

**QAgent Zero** is a 2-month sprint to build an AI-driven VS Code Extension for Java developers. It automatically generates, saves, and executes JUnit 5 unit tests for highlighted code using a self-hosted Large Language Model (LLM).

**The Team Goal:** This project serves as our proving ground for next year’s graduation project. It will test our ability to integrate different systems (IDE, AI, Compilers) and write clean, maintainable code.

**The "Grand Compromise" (How we work):** To ensure this project actually gets finished, we are working in **fixed, specialized pairs**. If all 6 of us try to build the UI at the same time, we will drown in Git merge conflicts.
*However, to guarantee everyone gets full-stack experience, we have agreed to a strict rotation policy:* **For the next project (or the actual graduation project), every pair will rotate to a completely different tech stack.** If you do UI today, you will do AI or DevOps next time.

---

## 2. Team Structure & Responsibilities

* 🖥️ **UI & Workspace Team:** **Morsy & Ezat**
* *Job:* Build the frontend of the VS Code extension. Capture user highlights, display loading states, and show Pass/Fail visual feedback in the editor.


* 🧠 **AI & Backend Team:** **Neriman & Mariam**
* *Job:* Build the "Brain." They will create an Express.js API that receives code, packages it into a strict prompt, and queries the LLM to return perfect JUnit 5 Java code.


* ⚙️ **DevOps & Execution Team:** **Omar Habashy & Omar Hossam**
* *Job:* The Infrastructure and the "Runner." You manage the Oracle Cloud server hosting the AI, *and* you write the Node.js code inside the extension that safely executes Maven on the user's laptop.



---

## 3. System Architecture & Tech Stack

The system operates on a hybrid architecture to keep costs at zero while maintaining high performance:

* **The Frontend (User's Laptop):**
* **Tech:** TypeScript, Node.js, VS Code Extension API.
* **Action:** Morsy & Ezat's code captures the function.


* **The Backend (Oracle Cloud Free Tier - VM.Standard.A1.Flex):**
* **Tech:** Ubuntu Linux (ARM), Node.js (Express.js), Ollama, LLM (`deepseek-coder` or `llama3`).
* **Action:** Neriman & Mariam's API lives here. It processes the request, asks Ollama for the test code, and sends it back.


* **The Execution Engine (User's Laptop):**
* **Tech:** Node.js (`child_process`, `fs`, `path`), Regex, Java, Maven.
* **Action:** Habashy & Hossam's code takes the AI's response, saves it to the local hard drive, and runs the local Maven compiler invisibly.



---



## 6. The Detailed 8-Week Plan

### Phase 1: The Skeleton (Weeks 1 - 2)

* **Goal:** Establish connections with dummy data. No real AI or code parsing yet.
* **Morsy & Ezat:** Initialize the VS Code extension. Make a button that highlights text and sends a dummy JSON payload.
* **Neriman & Mariam:** Build an Express.js server that accepts the JSON and returns a hardcoded fake Java test string.
* **Habashy & Hossam:** Setup Oracle Server. Write a local Node function that runs a hardcoded `mvn test` command and prints "Success" or "Fail".

### Phase 2: Building the Brain (Weeks 3 - 4)

* **Goal:** The MVP. It generates and runs a test for a simple, isolated function.
* **Morsy & Ezat:** Add a "Loading" UI. Read the actual package name from the open Java file.
* **Neriman & Mariam:** Hook up Express to Ollama. Write the prompt: *"You are an expert Java developer. Write a JUnit 5 test for this code. Return ONLY valid Java code, no markdown."*
* **Habashy & Hossam:** Connect your Maven runner to the real VS Code file path. Write the Regex to parse Maven's `stdout` stream.
* **Milestone:** A video showing a working generation and execution loop.

### Phase 3: Context & Edge Cases (Weeks 5 - 6)

* **Goal:** Handle complex code and user errors.
* **Morsy & Ezat:** Extract class variables and other methods in the file so the AI has context.
* **Neriman & Mariam:** Tweak the prompt to mock external dependencies using Mockito.
* **Habashy & Hossam:** What if the user doesn't have Maven installed? What if their `pom.xml` is broken? Write the error handling to return clean, human-readable errors back to the UI.

### Phase 4: Self-Healing & Polish (Weeks 7 - 8)

* **Goal:** Create the "Agentic Loop."
* **The Team Swarm:** If Habashy & Hossam's runner detects a *compilation syntax error* (e.g., missing semicolon), they programmatically send the error log *back* to Neriman & Mariam's API. The AI fixes its own code, sends it back to DevOps, and DevOps runs it again, completely silently. Morsy & Ezat just update the UI to say "Syntax error detected, AI is repairing..."
* **Week 8:** Code Freeze. Manual testing. Write the final documentation.

---

## 7. Rules of Engagement (Zero Chaos Policy)

1. **Branching:** We use Feature Branches (e.g., `feature/ui-button`, `feature/maven-runner`).
2. **Pull Requests:** No one pushes directly to `main`. Every PR requires at least ONE review from a person in a *different* pair. This guarantees cross-team learning.
3. **Standups:** Two 15-minute syncs per week on Discord. State what you did, what you are doing, and if you are blocked.
