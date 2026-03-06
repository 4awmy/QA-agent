# DevOps & Execution Team API Contract

This document outlines the exact data structures your background VS Code runner needs to receive and send.

## 1. You Receive: AI -> DevOps Response
After the AI Team (Neriman/Mariam) generates the test using Ollama, they will return this payload. Your script needs to safely save the `generatedCode` to the local file system (e.g. `src/test/java/...`) and then run Maven.

```json
{
  "status": "success",
  "generatedCode": "package com.store.billing;\nimport org.junit.jupiter.api.Test; ..."
}
```

## 2. You Send: DevOps -> UI Result
After you run `mvn test` in a child process and parse the stdout with Regex, you must return this structured format back to the UI Team (Morsy/Ezat) so they can update the editor interface.

```json
{
  "executionStatus": "FAILED",
  "compileError": false,
  "failedLine": 42,
  "errorMessage": "Expected <100.0> but was <90.0>"
}
```
