# 🧠 Week 1 Tasks — AI & Backend Team
**Team:** Neriman & Mariam
**Branch:** `feature/ai-backend`
**Phase:** 1 — The Skeleton
**Goal:** Build a production-ready Express.js server skeleton that accepts the agreed API contract payload and returns a hardcoded fake JUnit 5 test. No Ollama yet — just the wiring.

---

## 📋 Pre-Requisites (Before You Write a Single Line)

- [ ] Both teammates have **Node.js** installed → `node -v` (should be v18+)
- [ ] Both have **Postman** or **curl** installed for API testing
- [ ] Read `API_CONTRACT.md` thoroughly — you are the **middle layer** of the entire system:
  - You **receive** from Morsy & Ezat:
    ```json
    {
      "className": "OrderCalculator",
      "packageName": "com.store.billing",
      "targetFunction": "public double calculateTotal(double price) { ... }",
      "importsContext": "import java.util.List;"
    }
    ```
  - You **send back** to Habashy & Hossam:
    ```json
    {
      "status": "success",
      "generatedCode": "package com.store.billing;\nimport org.junit.jupiter.api.Test; ..."
    }
    ```
- [ ] Confirm the branch: `git checkout -b feature/ai-backend`

---

## 🔨 Task 1 — Initialize the Node.js Backend Project

**Why:** We need a clean, isolated Node.js project for the backend. It must live in a `/backend` folder inside the repo, separate from the VS Code extension code.

**Steps:**

1. Create the backend folder: `mkdir backend`
2. Navigate into it and initialize: `cd backend && npm init -y`
3. Install core dependencies:
   ```bash
   npm install express body-parser cors
   ```
4. Install dev dependencies for a better workflow:
   ```bash
   npm install --save-dev nodemon
   ```
5. Open `backend/package.json` and add a `dev` script:
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

**Verify:**
- `backend/package.json` exists and has `express`, `body-parser`, `cors` in `dependencies`.

- [ ] ✅ `backend/` folder initialized with correct `package.json`

---

## 🔨 Task 2 — Create the Express Server

**Why:** This is the core of the backend. The server must listen for POST requests on the `/generate` endpoint and return a properly structured response.

**Steps:**

1. Create `backend/server.js` with the following structure:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logger — log every incoming request
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'QAgent Backend is running.' });
});

// Main generation endpoint
app.post('/generate', (req, res) => {
    // TODO Week 2: Replace hardcoded response with real Ollama call
    const hardcodedTest = `package com.store.billing;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderCalculatorTest {

    @Test
    void testCalculateTotal_basicCase() {
        // HARDCODED DUMMY — Week 1 skeleton only
        OrderCalculator calc = new OrderCalculator();
        double result = calc.calculateTotal(100.0);
        assertEquals(100.0, result, 0.001);
    }
}`;

    res.status(200).json({
        status: 'success',
        generatedCode: hardcodedTest
    });
});

app.listen(PORT, () => {
    console.log(`QAgent Backend running on http://localhost:${PORT}`);
});
```

**Verify:**
- Run `npm run dev` inside `backend/`.
- Terminal shows: `QAgent Backend running on http://localhost:3000`

- [ ] ✅ Server starts without errors on port 3000

---

## 🔨 Task 3 — Add Input Validation

**Why:** The server must reject malformed requests immediately and with a clear error. This protects against the UI team sending bad payloads and makes debugging much easier.

**Steps:**

1. Inside the `POST /generate` route, **before** building the response, add validation:

```javascript
app.post('/generate', (req, res) => {
    const { className, packageName, targetFunction, importsContext } = req.body;

    // --- Validation ---
    const missingFields = [];
    if (!className)      missingFields.push('className');
    if (!packageName)    missingFields.push('packageName');
    if (!targetFunction) missingFields.push('targetFunction');

    if (missingFields.length > 0) {
        console.warn(`[WARN] Missing required fields: ${missingFields.join(', ')}`);
        return res.status(400).json({
            status: 'error',
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    // Log the incoming request (first 80 chars of function to avoid log spam)
    console.log(`[INFO] Generate request for class: ${className} | pkg: ${packageName}`);
    console.log(`[INFO] Function preview: ${targetFunction.substring(0, 80)}...`);

    // TODO: replace with Ollama call in Week 3
    // ... hardcoded response below
});
```

**Verify using curl or Postman:**
- Missing `className` → HTTP 400 with descriptive error JSON
- All fields present → HTTP 200 with hardcoded test

```bash
# Test 1: Missing fields (expect 400)
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d "{\"packageName\": \"com.test\"}"

# Test 2: Valid payload (expect 200)
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d "{\"className\":\"Calc\",\"packageName\":\"com.test\",\"targetFunction\":\"public int add(int a, int b){return a+b;}\",\"importsContext\":\"\"}"
```

- [ ] ✅ Missing fields → `400` with `{ "status": "error", "message": "..." }`
- [ ] ✅ Valid payload → `200` with `{ "status": "success", "generatedCode": "..." }`

---

## 🔨 Task 4 — Health Check & Basic Error Handling

**Why:** The DevOps team needs a way to check if the server is alive on Oracle Cloud without triggering a generation.

**Steps:**

1. The `/health` endpoint is already included in Task 2's code. Verify it works:
   ```bash
   curl http://localhost:3000/health
   # Expected: { "status": "ok", "message": "QAgent Backend is running." }
   ```

2. Add a global error handler at the **bottom** of `server.js` (after all routes):
   ```javascript
   // Global error handler — catches any unhandled Express errors
   app.use((err, req, res, next) => {
       console.error('[ERROR] Unhandled server error:', err.message);
       res.status(500).json({
           status: 'error',
           message: 'Internal server error. Check server logs.'
       });
   });
   ```

- [ ] ✅ `GET /health` returns `200 OK` with status JSON
- [ ] ✅ Global error handler is in place

---

## 🔨 Task 5 — Create a `.env` File & Extract the Port

**Why:** Hardcoding `3000` directly in code is bad practice. When we deploy to Oracle Cloud, the DevOps team may need to change the port. Use an environment variable.

**Steps:**

1. Install `dotenv`: `npm install dotenv`
2. Create `backend/.env`:
   ```
   PORT=3000
   NODE_ENV=development
   ```
3. Add `backend/.env` to `.gitignore` (it should already be there, but double-check):
   ```
   # in root .gitignore
   backend/.env
   backend/node_modules/
   ```
4. At the top of `server.js`, load the env file:
   ```javascript
   require('dotenv').config();
   const PORT = process.env.PORT || 3000;
   ```

- [ ] ✅ Server reads `PORT` from `.env`, not hardcoded
- [ ] ✅ `.env` is in `.gitignore` and **not committed**

---

## 🔨 Task 6 — Push & Open Pull Request

**Steps:**

1. Make sure the server runs cleanly: `npm run dev` → no errors.
2. Commit:
   ```bash
   git add backend/
   git commit -m "feat(ai): scaffold Express server with /generate skeleton and input validation"
   ```
3. Push: `git push origin feature/ai-backend`
4. Open a Pull Request on GitHub:
   - **Title:** `feat(ai): Week 1 skeleton — Express server with hardcoded /generate endpoint`
   - **Description:** Include the two curl test results (400 and 200 responses) as screenshots or copied terminal output.
   - **Reviewer:** Assign someone from the **UI or DevOps team**.

- [ ] ✅ PR is open with curl test evidence attached

---

## 📅 Week 1 Definition of Done

You are done with Week 1 when **all of the following are true:**
1. `npm run dev` starts the server with no errors.
2. `GET /health` returns `200`.
3. `POST /generate` with missing fields returns `400` with a descriptive error.
4. `POST /generate` with a valid payload returns `200` with the hardcoded JUnit 5 test string.
5. Server logs every request with a timestamp and class name.
6. `.env` is gitignored. `node_modules/` is gitignored.
7. PR is open and reviewed by a cross-team member.
