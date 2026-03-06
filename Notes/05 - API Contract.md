# 05 - API Contract

Before anyone writes code, this is the data structure everyone must agree to use.

## 1. UI -> AI Request
(Sent from Morsy/Ezat to Neriman/Mariam)

```json
{
  "className": "OrderCalculator",
  "packageName": "com.store.billing",
  "targetFunction": "public double calculateTotal(double price) { ... }",
  "importsContext": "import java.util.List;"
}
```

## 2. AI -> DevOps Response
(Returned from Neriman/Mariam)

```json
{
  "status": "success",
  "generatedCode": "package com.store.billing;\nimport org.junit.jupiter.api.Test; ..."
}
```

## 3. DevOps -> UI Result
(Given back from Habashy/Hossam to display in UI)

```json
{
  "executionStatus": "FAILED",
  "compileError": false,
  "failedLine": 42,
  "errorMessage": "Expected <100.0> but was <90.0>"
}
```
