# 04 - DevOps & Local Execution

As the DevOps pair, your job is split into two distinct areas: **Server Infrastructure** and **Local Execution**. You are the glue that turns this from a "chatbot" into a real "Agent."

## Part A: Server Infrastructure (Habashy's Domain)
You are responsible for keeping the "Brain" online.

1. **Provisioning:** Setup the Oracle ARM instance (4 OCPUs, 24GB RAM).
2. **Environment Setup:** Install Node.js, Git, and Ollama via the Linux terminal. Download the open-source LLM.
3. **Networking:** Open port `3000` on the Oracle Virtual Cloud Network (VCN) firewall.
4. **Process Management:** Use `PM2` to ensure the API automatically restarts if it crashes.

## Part B: Local Execution Engine (Hossam & Habashy)
You will write a specialized module *inside* the VS Code Extension codebase.

1. **File System (FS) Integration:** Safely save Java code to disk (e.g., mapping `com.myapp.Calc` to `/src/test/java/com/myapp/CalcTest.java`).
2. **Subprocess Spawning:** Use `child_process.spawn` to run `mvn -Dtest=ClassName test` in the background.
3. **Log Parsing (The Hardest Part):** Use Regular Expressions (Regex) to scan Maven output for `[ERROR]` and failed line numbers.
