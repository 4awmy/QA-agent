# UI & Workspace Team API Contract

This document outlines the exact data structures your UI extension code needs to send and receive.

## 1. You Send: UI -> AI Request
When the user highlights code and right-clicks "Generate Test", you must capture and send this payload to the AI API (Neriman/Mariam):

```json
{
  "className": "OrderCalculator",
  "packageName": "com.store.billing",
  "targetFunction": "public double calculateTotal(double price) { ... }",
  "importsContext": "import java.util.List;"
}
```

## 2. You Receive: DevOps -> UI Result
After the AI generates the code and the DevOps team (Habashy/Hossam) executes the Maven test locally, they will return this payload for your UI to display (e.g., showing a green checkmark or a red error message):

```json
{
  "executionStatus": "FAILED",
  "compileError": false,
  "failedLine": 42,
  "errorMessage": "Expected <100.0> but was <90.0>"
}
```
