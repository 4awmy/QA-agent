# AI & Backend Team API Contract

This document outlines the exact data structures your Express.js API needs to receive and send.

## 1. You Receive: UI -> AI Request
When the UI team (Morsy/Ezat) triggers a code generation, they will send this payload to your API. You need to parse this into a prompt for Ollama:

```json
{
  "className": "OrderCalculator",
  "packageName": "com.store.billing",
  "targetFunction": "public double calculateTotal(double price) { ... }",
  "importsContext": "import java.util.List;"
}
```

## 2. You Send: AI -> DevOps Response
After your API queries Ollama and formats the response, you must return this payload back to the DevOps/Execution team (Habashy/Hossam) so they can save and run it:

```json
{
  "status": "success",
  "generatedCode": "package com.store.billing;\nimport org.junit.jupiter.api.Test; ..."
}
```
