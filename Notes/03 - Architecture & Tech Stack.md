# 03 - Architecture & Tech Stack

The system operates on a hybrid architecture to keep costs at zero while maintaining high performance:

## 1. The Frontend (User's Laptop)
* **Tech:** TypeScript, Node.js, VS Code Extension API.
* **Action:** UI Team captures the function.

## 2. The Backend (Oracle Cloud Free Tier - VM.Standard.A1.Flex)
* **Tech:** Ubuntu Linux (ARM), Node.js (Express.js), Ollama, LLM (`deepseek-coder` or `llama3`).
* **Action:** AI Team's API processes the request, asks Ollama for test code, and sends it back.

## 3. The Execution Engine (User's Laptop)
* **Tech:** Node.js (`child_process`, `fs`, `path`), Regex, Java, Maven.
* **Action:** DevOps Team takes AI response, saves to disk, and runs local Maven compiler.
