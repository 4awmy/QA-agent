# 🚀 Future Improvements & Scaling Strategy

While the current roadmap focuses on building the MVP (a VS Code extension that generates and runs Java/Maven tests via an Ollama backend), the following enhancements are recommended for long-term scalability, security, and usability.

## 1. Security & Environment Isolation
*   **Dockerized Test Execution:** Currently, the local runner executes `mvn test` directly on the host machine. This poses a security risk if the AI generates malicious code. **Improvement:** Execute all generated tests inside ephemeral Docker containers. This ensures a clean, isolated environment for every run and protects the host system.
*   **API Authentication:** The Express API currently has no authentication. **Improvement:** Implement API keys or token-based authentication (e.g., JWT) to secure the endpoint, especially when deployed to the Oracle Cloud instance.

## 2. Expanding Context & Intelligence
*   **Retrieval-Augmented Generation (RAG):** Passing the whole file or relying on basic regex for context is limited. **Improvement:** Implement a local vector database (e.g., ChromaDB) to index the user's codebase. When generating a test, the AI can query the DB to pull relevant interfaces, parent classes, and existing test patterns to generate highly accurate tests.
*   **Support for Multiple Languages & Frameworks:** Abstract the execution layer so the agent can support Python (PyTest), TypeScript (Jest/Mocha), and others, rather than being hardcoded to Java/Maven.

## 3. UI/UX Enhancements
*   **Interactive Chat Interface:** Instead of a one-shot "Generate Test" context menu, embed a Webview panel in VS Code where users can chat with the agent, ask it to modify the generated test (e.g., "add a test for null inputs"), and approve changes before saving.
*   **Inline Code Lenses:** Display the test results (Pass/Fail/Coverage) directly above the target function in the editor using VS Code Code Lenses.

## 4. CI/CD Integration
*   **Automated PR Reviewer:** Package the core AI and Execution logic into a GitHub Action or GitLab CI pipeline. When a developer opens a PR, the agent automatically reviews the code, generates missing tests, and comments them on the PR.
