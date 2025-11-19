# Next.js LCP Reporting Bug Reproduction (App Router)

This repository provides a minimal, reproducible example demonstrating a performance-related bug where the **Largest Contentful Paint (LCP) metric is consistently missed** by `useReportWebVitals` when the user is idle, but successfully captured when the user interacts.

This issue highlights a concern regarding LCP Finalization being delayed by heavy synchronous work beyond our custom idle timer.

---

## ⚙️ Environment Setup

1.  **Clone the repository.**
2.  **Install dependencies** (using the stable OTel versions provided):
    ```bash
    npm install --legacy-peer-deps
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```

---

## 🔎 Reproduction Steps

The application runs on `http://localhost:3000`. You must observe the **browser console** for the logs.

### ❌ Scenario 1 (FAIL - Idle User)

This demonstrates the missing LCP report:

1.  Open DevTools console and clear it.
2.  **Reload the page.** You will immediately see **TTFB** and **FCP** metrics recorded.
3.  Wait **12 seconds** without moving or clicking the mouse.
4.  **Result:** The console will show the "10-second timer fired" message. The OTel flush runs, and the log will confirm **TTFB and FCP were sent, but LCP is missing.**

### ✅ Scenario 2 (SUCCESS - Interactive User)

This demonstrates the required workaround:

1.  Open DevTools console and clear it.
2.  **Reload the page.**
3.  Wait **5 seconds** (the blue LCP element is visible).
4.  **Click once anywhere on the white space.** The console will show the LCP metric recorded immediately after the click.
5.  Wait for the 10-second timer to fire (5 more seconds).
6.  **Result:** The console will successfully show **TTFB, FCP, and LCP** being sent.

---

## 💡 Diagnosis

The reproduction works quickly, but our production applications exhibit Scenario 1 (FAIL). We suspect that a long-running, synchronous initialization task (like `Sentry.init()`) in the `instrumentation-client.ts` file in our production apps delays the browser's LCP Finalization event past 10 seconds. The mouse click acts as a fallback to force the metric to finalize, confirming the metric is present but pending submission.
