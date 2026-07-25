import React, { useState } from "react";
import { SystemState } from "../types";
import { Terminal, Copy, Check, Code, ExternalLink } from "lucide-react";

interface ApiTesterPanelProps {
  systemState: SystemState | null;
  onOpenDocs: () => void;
}

export const ApiTesterPanel: React.FC<ApiTesterPanelProps> = ({ systemState, onOpenDocs }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"json" | "curl">("curl");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:8000";

  const curlExamples = [
    {
      title: "Trigger Multi-Agent Incident Commander (POST /handle-incident)",
      cmd: `curl -X POST "${baseUrl}/handle-incident" \\\n  -H "Content-Type: application/json" \\\n  -d '{"service": "orders-db", "auto_inject": true}'`,
    },
    {
      title: "Query System State (GET /system-state)",
      cmd: `curl -X GET "${baseUrl}/system-state"`,
    },
    {
      title: "Inject CPU Spike Incident (POST /inject-incident)",
      cmd: `curl -X POST "${baseUrl}/inject-incident" \\\n  -H "Content-Type: application/json" \\\n  -d '{"service": "orders-db", "type": "cpu_spike", "details": "SQL lock"}'`,
    },
    {
      title: "Resolve Incident & Restore Service (POST /resolve-incident)",
      cmd: `curl -X POST "${baseUrl}/resolve-incident" \\\n  -H "Content-Type: application/json" \\\n  -d '{"service": "orders-db", "action": "restart"}'`,
    },
    {
      title: "Get Service Topology Graph (GET /topology)",
      cmd: `curl -X GET "${baseUrl}/topology"`,
    },
    {
      title: "Reset Digital Twin Environment (POST /reset-environment)",
      cmd: `curl -X POST "${baseUrl}/reset-environment"`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">API Testing & cURL Generator</h2>
            <p className="text-xs text-slate-400">
              Run commands locally or in Postman to hit the Python FastAPI endpoints directly.
            </p>
          </div>
        </div>

        {/* Tab Switcher & Swagger Link */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab("curl")}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === "curl" ? "bg-cyan-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              cURL Commands
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === "json" ? "bg-cyan-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Live JSON Response
            </button>
          </div>

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Swagger UI</span>
          </button>
        </div>
      </div>

      {activeTab === "curl" ? (
        <div className="space-y-4">
          {curlExamples.map((item, idx) => (
            <div key={idx} className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs">
              <div className="flex justify-between items-center mb-1 text-slate-300 font-semibold text-[11px]">
                <span>{item.title}</span>
                <button
                  onClick={() => handleCopy(item.cmd, idx)}
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition"
                >
                  {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === idx ? "Copied!" : "Copy cURL"}</span>
                </button>
              </div>
              <pre className="text-cyan-300/90 whitespace-pre-wrap overflow-x-auto p-2 bg-slate-900/60 rounded border border-slate-800/80">
                {item.cmd}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
            <span className="text-emerald-400 font-bold">200 OK — GET /system-state</span>
            <span className="text-slate-500 text-[10px]">Updated: {systemState?.timestamp}</span>
          </div>
          <pre className="text-slate-300 text-[11px] whitespace-pre-wrap">
            {systemState ? JSON.stringify(systemState, null, 2) : "// Loading system state..."}
          </pre>
        </div>
      )}
    </div>
  );
};
