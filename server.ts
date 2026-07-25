import express from "express";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const PYTHON_PORT = 8005;
const FASTAPI_URL = `http://127.0.0.1:${PYTHON_PORT}`;

let pythonProcess: ChildProcess | null = null;

function startPythonFastAPI() {
  const pythonCmds = process.platform === "win32" ? ["py", "python", "python3"] : ["python3", "python"];
  let cmdIndex = 0;
  let consecutiveFailures = 0;

  function attemptSpawn() {
    const cmd = pythonCmds[cmdIndex % pythonCmds.length];
    console.log(`🚀 Spawning Python FastAPI GCP Digital Twin backend using '${cmd}'...`);

    let proc: ChildProcess;
    try {
      proc = spawn(cmd, ["main.py"], {
        cwd: process.cwd(),
        env: { ...process.env, PYTHONUNBUFFERED: "1" },
      });
      pythonProcess = proc;
    } catch (err: any) {
      console.warn(`⚠️ Synchronous spawn failure for '${cmd}': ${err.message}`);
      handleSpawnFailure();
      return;
    }

    let hasOutput = false;

    // Attach error handler IMMEDIATELY to prevent unhandled 'error' event crash
    proc.on("error", (err) => {
      console.warn(`⚠️ Could not spawn '${cmd}': ${err.message}`);
    });

    proc.stdout?.on("data", (data) => {
      hasOutput = true;
      consecutiveFailures = 0;
      console.log(`[FastAPI stdout]: ${data.toString().trim()}`);
    });

    proc.stderr?.on("data", (data) => {
      console.error(`[FastAPI stderr]: ${data.toString().trim()}`);
    });

    proc.on("close", (code) => {
      if (!hasOutput && code !== 0) {
        consecutiveFailures++;
        cmdIndex++;
      }
      handleSpawnFailure();
    });
  }

  function handleSpawnFailure() {
    if (consecutiveFailures >= pythonCmds.length * 2) {
      console.error("\n==========================================================");
      console.error("❌ PYTHON INTERPRETER NOT FOUND OR NOT IN PATH");
      console.error("The web server is running, but the Python FastAPI backend is offline.");
      console.error("To fix this and enable full backend orchestration:");
      console.error("1. Download Python 3.10+ from https://www.python.org/downloads/");
      console.error("2. During setup, check 'Add python.exe to PATH'");
      console.error("3. On Windows, disable App execution aliases:");
      console.error("   Settings -> Apps -> Advanced app settings -> App execution aliases -> Turn OFF python.exe & python3.exe");
      console.error("==========================================================\n");
      // Retry less frequently once all options have failed
      setTimeout(attemptSpawn, 15000);
    } else {
      setTimeout(attemptSpawn, 2000);
    }
  }

  attemptSpawn();
}

// Start FastAPI background daemon
startPythonFastAPI();

async function startServer() {
  const app = express();

  app.use(express.json());

  // Helper to proxy request to FastAPI with retry fallback
  async function proxyToFastAPI(req: express.Request, res: express.Response, pathOverride?: string) {
    const targetUrl = `${FASTAPI_URL}${pathOverride || req.originalUrl}`;
    try {
      const options: RequestInit = {
        method: req.method,
        headers: { "Content-Type": "application/json" },
      };
      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        options.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, options);
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(response.status).send(text);
      }
    } catch (err) {
      console.warn(`FastAPI proxy attempt failed (${targetUrl}): ${err}. Retrying or returning standby status.`);
      res.status(503).json({
        error: "FastAPI backend starting up or unavailable",
        message: "Python FastAPI server is initializing. Please try again in a moment.",
      });
    }
  }

  // --- API ROUTE PROXIES FOR FASTAPI ---
  // Endpoints specified in prompt requirements:
  // GET /system-state (and /api/system-state)
  // POST /inject-incident (and /api/inject-incident)
  // POST /resolve-incident (and /api/resolve-incident)
  // GET /services
  // GET /topology
  // POST /reset-environment

  app.all("/system-state", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/system-state", (req, res) => proxyToFastAPI(req, res, "/system-state"));

  app.all("/inject-incident", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/inject-incident", (req, res) => proxyToFastAPI(req, res, "/inject-incident"));

  app.all("/resolve-incident", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/resolve-incident", (req, res) => proxyToFastAPI(req, res, "/resolve-incident"));

  app.all("/services*", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/services*", (req, res) => proxyToFastAPI(req, res, req.originalUrl.replace("/api/services", "/services")));

  app.all("/topology", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/topology", (req, res) => proxyToFastAPI(req, res, "/topology"));

  app.all("/reset-environment", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/reset-environment", (req, res) => proxyToFastAPI(req, res, "/reset-environment"));

  app.all("/handle-incident", (req, res) => proxyToFastAPI(req, res));
  app.all("/api/handle-incident", (req, res) => proxyToFastAPI(req, res, "/handle-incident"));

  app.get("/docs", (req, res) => proxyToFastAPI(req, res));
  app.get("/openapi.json", (req, res) => proxyToFastAPI(req, res));

  // Vite middleware for frontend development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n==========================================================`);
    console.log(`🌐 Application running successfully!`);
    console.log(`👉 Open http://localhost:${PORT} in your web browser`);
    console.log(`🔗 FastAPI backend proxied internally on http://127.0.0.1:${PYTHON_PORT}`);
    console.log(`==========================================================\n`);
  });
}

startServer();
