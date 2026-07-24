import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with server-side API Key
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in process.env');
  }
  return new GoogleGenAI({
    apiKey: apiKey || 'dummy-key',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. Multi-Agent Collaborative Analysis API Endpoint
app.post('/api/agent/collaborate', async (req, res) => {
  try {
    const { title, cloudProvider, service, region, rawLogs, metrics } = req.body;

    const ai = getAiClient();
    const prompt = `
You are the Orchestrator for a collaborative swarm of 4 Specialized AI Cloud Engineering Agents:
1. Sentinel Agent (Health & Anomaly Detector)
2. Log Investigator Agent (Root Cause Analyzer)
3. Remediation Agent (Self-Healing Playbook Architect)
4. Post-Mortem Auditor (Compliance & Preventative Advisor)

Analyze the following active incident in a major cloud infrastructure setup:
Title: ${title || 'Unspecified Incident'}
Provider: ${cloudProvider || 'Kubernetes / AWS'}
Service: ${service || 'microservice'}
Region: ${region || 'us-east-1'}
Telemetry Metrics: ${JSON.stringify(metrics || {})}
Raw Incident Logs:
${(rawLogs || []).join('\n')}

Provide a structured collaborative breakdown in JSON format containing:
1. "rootCause": Summary, primary Cause, affectedComponents (array), confidenceScore (0-100).
2. "agentTraces": Array of 3-4 agent actions taken during diagnosis. Each trace has "agentRole" ('sentinel'|'log_investigator'|'remediation_agent'|'post_mortem'), "agentName", "action", "details", "codeSnippet" (optional code/log snippet).
3. "playbook": "title", "summary", "requiresHumanApproval" (boolean), "steps" (array of steps with "id", "title", "command", "type" ('kubectl'|'aws_cli'|'gcloud'|'terraform'), "riskLevel" ('LOW'|'MEDIUM'|'HIGH')).
4. "postMortem": "executiveSummary", "mttrMinutes" (number), "impactDescription", "preventionSteps" (array of strings).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCause: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                primaryCause: { type: Type.STRING },
                affectedComponents: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                confidenceScore: { type: Type.NUMBER },
              },
            },
            agentTraces: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agentRole: { type: Type.STRING },
                  agentName: { type: Type.STRING },
                  action: { type: Type.STRING },
                  details: { type: Type.STRING },
                  codeSnippet: { type: Type.STRING },
                },
              },
            },
            playbook: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                requiresHumanApproval: { type: Type.BOOLEAN },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      command: { type: Type.STRING },
                      type: { type: Type.STRING },
                      riskLevel: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            postMortem: {
              type: Type.OBJECT,
              properties: {
                executiveSummary: { type: Type.STRING },
                mttrMinutes: { type: Type.NUMBER },
                impactDescription: { type: Type.STRING },
                preventionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in agent collaboration:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete agent analysis',
    });
  }
});

// 2. Interactive Agent Swarm Chat
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { userPrompt, incidentContext } = req.body;
    const ai = getAiClient();

    const prompt = `
You are AetherOps AI Command Agent - an autonomous collaborative AI for cloud infrastructure (AWS, GCP, Azure, Kubernetes).
The user is giving an instruction or query regarding infrastructure or an active incident.

Context:
Incident: ${incidentContext?.title || 'None selected'}
Service: ${incidentContext?.service || 'Global Cluster'}
Current Status: ${incidentContext?.status || 'Active Monitoring'}

User Query / Command: "${userPrompt}"

Respond as a lead Site Reliability Engineering (SRE) AI Agent. Keep responses concise, clear, and actionable. If the user commands an action (e.g. scale pods, inspect logs, run sanity check), outline the exact command or action executed and the agent's assessment. Format code or commands in markdown blocks.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      message: response.text || 'Command processed.',
      timestamp: new Date().toLocaleTimeString(),
    });
  } catch (error: any) {
    console.error('Error in agent chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error processing command',
    });
  }
});

// 3. Simulate Playbook Step Execution with Live Terminal Stream Output
app.post('/api/agent/execute-step', (req, res) => {
  const { command, stepTitle, type } = req.body;

  const timestamp = new Date().toISOString();
  let simulatedLogs: string[] = [];

  if (type === 'kubectl' || command.includes('kubectl')) {
    simulatedLogs = [
      `[${timestamp}] $ ${command}`,
      `[${timestamp}] Connecting to k8s API server (k8s-prod-cluster-01.us-east-1.eks.amazonaws.com)...`,
      `[${timestamp}] Authenticating with IAM token service... OK`,
      `[${timestamp}] Applying patch to deployment/order-processor-v3...`,
      `[${timestamp}] deployment.apps/order-processor-v3 configured`,
      `[${timestamp}] Waiting for rollout to finish: 1 of 3 updated replicas are available...`,
      `[${timestamp}] deployment "order-processor-v3" successfully rolled out`,
      `[${timestamp}] Status: SUCCESS (0 errors, memory request updated)`
    ];
  } else if (type === 'aws_cli' || command.includes('aws')) {
    simulatedLogs = [
      `[${timestamp}] $ ${command}`,
      `[${timestamp}] Validating AWS IAM Role arn:aws:iam::206438983038:role/AetherOpsRemediationRole...`,
      `[${timestamp}] Executing AWS SDK action on region us-east-1...`,
      `[${timestamp}] DBInstanceIdentifier: "rds-pg-orders-primary" state -> MODIFYING`,
      `[${timestamp}] Connection pool flush signal transmitted successfully.`,
      `[${timestamp}] Status: SUCCESS`
    ];
  } else {
    simulatedLogs = [
      `[${timestamp}] $ ${command}`,
      `[${timestamp}] Initiating automated script execution...`,
      `[${timestamp}] Executing step: ${stepTitle}...`,
      `[${timestamp}] Target system responded with HTTP 200 OK`,
      `[${timestamp}] Health check metric restored to baseline threshold.`,
      `[${timestamp}] Status: SUCCESS`
    ];
  }

  res.json({
    success: true,
    stepTitle,
    command,
    stdout: simulatedLogs.join('\n'),
    executedAt: new Date().toISOString(),
  });
});

// Vite Setup for Development & Static Serve for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AetherOps Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
