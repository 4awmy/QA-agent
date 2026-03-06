# ⚙️ DevOps & Execution: Week 1 Tasks

**Phase 1 Goal: "The Skeleton"** 
*Establish connections with dummy data. No real AI or complex code parsing yet.*

Welcome to Week 1! As the DevOps pair, our job this week is to lay the absolute foundation for both the cloud infrastructure and the local execution engine. We need to prove the plumbing works before we connect the AI.

## 🎯 Task 1: Server Infrastructure Skeleton
*Goal: Get a publicly reachable server running a basic Node.js API.*

- [ ] **Provision Oracle VM:** Claim the Oracle Cloud Free Tier ARM instance (VM.Standard.A1.Flex - 4 OCPUs, 24GB RAM).
- [ ] **Install Linux Essentials:** Install `git`, `curl`, `nano`, etc.
- [ ] **Install Node.js & PM2:** Setup the runtime environment and process manager.
- [ ] **Install Ollama:** Get the Ollama engine running in the background (we won't query it yet, just install it).
- [ ] **Networking / Firewall:** Open port `3000` on the Oracle VCN (Virtual Cloud Network) so the frontend can eventually reach it.
- [ ] **Test Ping:** Confirm the server IP is reachable from your local machine.

## 🎯 Task 2: Local Execution Skeleton
*Goal: Write a basic Node.js script that successfully runs a hardcoded Maven test and captures the output.*

- [ ] **Init Node Project:** Create a dummy Node.js script file (e.g., `runner.js`) outside of the VS Code extension for now just to test the logic.
- [ ] **Child Process Spawn:** Use `const { spawn } = require('child_process');` to programmatically run a hardcoded command like `mvn -Dtest=DummyTest test` against a dummy Java project on your local machine.
- [ ] **Capture stdout:** Listen to the output stream of the spawned Maven process.
- [ ] **Basic success/fail check:** Write simple logic to read the output and `console.log("SUCCESS")` or `console.log("FAIL")` based on if the tests passed. (Don't worry about complex regex parsing yet).

## 🎯 Task 3: API Contract Review & Setup
*Goal: Ensure our team understands the exact data structures we are expected to receive from the AI API and return to the UI extension.*

- [ ] **Review `API_CONTRACT.md`:** Read the API Contract document at the root of this branch (`feature/devops-execution`).
- [ ] **Mock the AI Input:** Create a `sample-input.json` file locally that perfectly matches the "AI -> DevOps Response" payload defined in the contract.
- [ ] **Mock the UI Output:** Create a script or function that takes our dummy Maven output (from Task 2) and formats it into the exact "DevOps -> UI Result" JSON structure defined in the contract.
