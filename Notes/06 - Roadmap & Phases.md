# 06 - Roadmap & Phases

## Phase 1: The Skeleton (Weeks 1 - 2)
* **Goal:** Establish connections with dummy data. No real AI or code parsing.
* **Morsy & Ezat:** VS Code extension skeleton, dummy JSON payload.
* **Neriman & Mariam:** Express.js server, hardcoded fake Java test string.
* **Habashy & Hossam:** Setup Oracle Server, local Node function for hardcoded `mvn test`.

## Phase 2: Building the Brain (Weeks 3 - 4)
* **Goal:** The MVP. Generates and runs test for a simple, isolated function.
* **Morsy & Ezat:** Add "Loading" UI, read package name from Java file.
* **Neriman & Mariam:** Connect Express to Ollama with specialized prompt.
* **Habashy & Hossam:** Real Maven runner, Regex for Maven `stdout` stream.

## Phase 3: Context & Edge Cases (Weeks 5 - 6)
* **Goal:** Handle complex code and user errors.
* **Morsy & Ezat:** Extract class variables and methods for context.
* **Neriman & Mariam:** Prompt tuning for Mockito support.
* **Habashy & Hossam:** Error handling for missing Maven or broken `pom.xml`.

## Phase 4: Self-Healing & Polish (Weeks 7 - 8)
* **Goal:** Create the "Agentic Loop."
* **Team Swarm:** Automatic AI repair of compilation syntax errors detected by DevOps.
* **Week 8:** Code Freeze, Manual testing, Final documentation.
