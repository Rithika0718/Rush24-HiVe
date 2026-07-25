import React, { useState } from "react";
import {
  Activity,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  DollarSign,
  FileText,
  GitFork,
  Play,
  RotateCcw,
  Scale,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { IncidentState, AgentLog } from "../types";

interface Props {
  onRefreshSystem: () => void;
}

export const MultiAgentCommander: React.FC<Props> = ({ onRefreshSystem }) => {
  const [selectedService, setSelectedService] = useState<string>("orders-db");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"graph" | "logs" | "consensus" | "report">("graph");
  const [trace, setTrace] = useState<IncidentState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgentNode, setSelectedAgentNode] = useState<string | null>("Diagnosis Agent");

  const handleRunCommander = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/handle-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: selectedService,
          auto_inject: true,
          incident_type: "cpu_spike",
        }),
      });

      if (!res.ok) {
        throw new Error(`Orchestration failed with status ${res.status}`);
      }

      const data: IncidentState = await res.json();
      setTrace(data);
      onRefreshSystem(); // Refresh main dashboard Digital Twin state
    } catch (err: any) {
      setError(err.message || "Failed to run multi-agent commander.");
    } finally {
      setLoading(false);
    }
  };

  const agentNodes = [
    {
      id: "Monitor Agent",
      title: "1. Monitor",
      role: "Anomaly Detection",
      icon: Activity,
      color: "border-sky-500 text-sky-400 bg-sky-950/40",
      dataKey: "monitor_findings",
      writes: "monitor_findings, affected_service",
    },
    {
      id: "Diagnosis Agent",
      title: "2. Diagnosis",
      role: "Gemini 2.5 Root Cause",
      icon: Sparkles,
      color: "border-purple-500 text-purple-400 bg-purple-950/40",
      dataKey: "diagnosis_report",
      writes: "diagnosis_report, dependency_impact",
    },
    {
      id: "Resource Agent",
      title: "3. Resource",
      role: "Compute & Memory Fixes",
      icon: Cpu,
      color: "border-amber-500 text-amber-400 bg-amber-950/40",
      dataKey: "resource_options",
      writes: "resource_options",
    },
    {
      id: "Cost Agent",
      title: "4. Cost",
      role: "FinOps Billing ($)",
      icon: DollarSign,
      color: "border-emerald-500 text-emerald-400 bg-emerald-950/40",
      dataKey: "cost_estimates",
      writes: "cost_estimates",
    },
    {
      id: "Risk Agent",
      title: "5. Risk",
      role: "SRE Risk Assessment",
      icon: ShieldAlert,
      color: "border-rose-500 text-rose-400 bg-rose-950/40",
      dataKey: "risk_estimates",
      writes: "risk_estimates",
    },
    {
      id: "Traffic Agent",
      title: "6. Traffic",
      role: "Edge Rate Limiting",
      icon: GitFork,
      color: "border-cyan-500 text-cyan-400 bg-cyan-950/40",
      dataKey: "traffic_options",
      writes: "traffic_options",
    },
    {
      id: "Consensus & Recovery Agent",
      title: "7. Consensus",
      role: "Utility Ranking & Recovery",
      icon: Scale,
      color: "border-indigo-500 text-indigo-400 bg-indigo-950/40",
      dataKey: "consensus_decision",
      writes: "consensus_decision, recovery_action",
    },
    {
      id: "Reporter Agent",
      title: "8. Reporter",
      role: "SRE Post-Mortem",
      icon: FileText,
      color: "border-teal-500 text-teal-400 bg-teal-950/40",
      dataKey: "final_report",
      writes: "final_report",
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-md text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Multi-Agent Orchestration Layer
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                LangGraph Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              8 Autonomous agents coordinating analysis, FinOps cost, operational risk, consensus ranking, and automated GCP recovery.
            </p>
          </div>
        </div>

        {/* Trigger controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            disabled={loading}
            className="bg-slate-950 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="orders-db">orders-db (Cloud SQL Primary)</option>
            <option value="auth-service">auth-service (Cloud Run)</option>
            <option value="api-gateway">api-gateway (Cloud Load Balancer)</option>
            <option value="payments-service">payments-service (GKE Deployment)</option>
            <option value="redis-cache">redis-cache (Memorystore Redis)</option>
          </select>

          <button
            onClick={handleRunCommander}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 disabled:opacity-50 rounded-lg shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Zap className="w-4 h-4 animate-spin text-amber-300" />
                <span>Running LangGraph agents...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-indigo-200" />
                <span>Execute Multi-Agent Commander</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("graph")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "graph"
              ? "bg-indigo-600/30 border border-indigo-500/50 text-indigo-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          Agent Graph Topology (8 Nodes)
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "logs"
              ? "bg-indigo-600/30 border border-indigo-500/50 text-indigo-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          Execution Trace & Logs
          {trace?.agent_logs && (
            <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[10px] rounded-full">
              {trace.agent_logs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("consensus")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "consensus"
              ? "bg-indigo-600/30 border border-indigo-500/50 text-indigo-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          Consensus Utility Matrix
          {trace?.consensus_decision && (
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full">
              Selected
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "report"
              ? "bg-indigo-600/30 border border-indigo-500/50 text-indigo-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          SRE Post-Mortem Report
        </button>
      </div>

      {/* TAB 1: GRAPH VIEW */}
      {activeTab === "graph" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {agentNodes.map((node) => {
              const Icon = node.icon;
              const isSelected = selectedAgentNode === node.id;
              const isExecuted = trace && trace.agent_logs?.some((l) => l.agent.includes(node.id.split(" ")[0]));

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedAgentNode(node.id)}
                  className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                    isSelected
                      ? `${node.color} ring-2 ring-indigo-500 shadow-lg scale-105`
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  {isExecuted && (
                    <div className="absolute top-1.5 right-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <Icon className="w-5 h-5 mb-2 flex-shrink-0" />
                  <span className="text-xs font-bold text-white leading-tight">{node.title}</span>
                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{node.role}</span>
                </div>
              );
            })}
          </div>

          {/* Detailed Node Inspector */}
          {selectedAgentNode && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">{selectedAgentNode} State Inspector</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  State Write Field: {agentNodes.find((n) => n.id === selectedAgentNode)?.writes}
                </span>
              </div>

              {!trace ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Click <strong className="text-slate-300">"Execute Multi-Agent Commander"</strong> above to launch the 8-agent LangGraph orchestration pipeline and view live node execution outputs.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedAgentNode === "Monitor Agent" && trace.monitor_findings && (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-300">
                        <strong>Target:</strong> {trace.monitor_findings.target_service} ({trace.monitor_findings.gcp_resource})
                      </p>
                      <p className="text-slate-300">
                        <strong>Severity:</strong> <span className="text-rose-400 font-bold">{trace.monitor_findings.severity}</span>
                      </p>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
                        <pre className="text-sky-300">{JSON.stringify(trace.monitor_findings, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {selectedAgentNode === "Diagnosis Agent" && trace.diagnosis_report && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-purple-950/30 border border-purple-800/50 rounded-lg text-purple-200">
                        <strong className="block text-purple-300 mb-1">Gemini 2.5 Flash Diagnosis:</strong>
                        <p>{trace.diagnosis_report.root_cause_hypothesis}</p>
                      </div>
                      <p className="text-slate-300">
                        <strong>Downstream Impacted Services:</strong>{" "}
                        <span className="text-amber-300 font-mono">
                          {trace.diagnosis_report.downstream_impacted_services?.join(", ") || "None"}
                        </span>
                      </p>
                    </div>
                  )}

                  {selectedAgentNode === "Resource Agent" && trace.resource_options && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {trace.resource_options.map((opt) => (
                        <div key={opt.option_id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                          <span className="font-bold text-amber-300 block mb-1">{opt.label}</span>
                          <p className="text-slate-400 text-[11px] mb-2">{opt.mechanism}</p>
                          <span className="text-[10px] text-slate-500 font-mono">Est Time: {opt.expected_time_sec}s</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedAgentNode === "Cost Agent" && trace.cost_estimates && (
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                      <pre className="text-emerald-300">{JSON.stringify(trace.cost_estimates, null, 2)}</pre>
                    </div>
                  )}

                  {selectedAgentNode === "Risk Agent" && trace.risk_estimates && (
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                      <pre className="text-rose-300">{JSON.stringify(trace.risk_estimates, null, 2)}</pre>
                    </div>
                  )}

                  {selectedAgentNode === "Traffic Agent" && trace.traffic_options && (
                    <div className="space-y-2">
                      {trace.traffic_options.map((to) => (
                        <div key={to.option_id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-cyan-300 block">{to.label}</span>
                            <span className="text-slate-400 text-[11px]">{to.mechanism}</span>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {to.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedAgentNode === "Consensus & Recovery Agent" && trace.consensus_decision && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-lg">
                        <strong className="text-indigo-300 block mb-1">Consensus Decision Winner:</strong>
                        <span className="text-lg font-bold text-white block">
                          {trace.consensus_decision.selected_label}
                        </span>
                        <p className="text-slate-300 mt-1">{trace.consensus_decision.consensus_rationale}</p>
                      </div>
                    </div>
                  )}

                  {selectedAgentNode === "Reporter Agent" && trace.final_report && (
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                      <strong className="text-teal-300 block mb-2">{trace.final_report.title}</strong>
                      <p className="text-slate-300">{trace.final_report.executive_summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXECUTION LOGS */}
      {activeTab === "logs" && (
        <div className="mt-6 space-y-3">
          {!trace?.agent_logs || trace.agent_logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No execution trace available yet. Click "Execute Multi-Agent Commander" to run the workflow.
            </div>
          ) : (
            <div className="space-y-3">
              {trace.agent_logs.map((log: AgentLog, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded text-indigo-400 text-xs font-mono">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{log.agent}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                    <span className="text-xs text-indigo-300 font-medium block">{log.action}</span>
                    <p className="text-xs text-slate-400 mt-1">{log.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONSENSUS UTILITY MATRIX */}
      {activeTab === "consensus" && (
        <div className="mt-6 space-y-4">
          {!trace?.consensus_decision ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No consensus calculation executed yet. Launch commander to run the transparent Utility Ranking Engine.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/50 rounded-xl">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                  Weighted Utility Ranking Formula
                </h4>
                <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-2 rounded border border-slate-800">
                  Utility Score = (Resolution Confidence % × 0.50) - (Risk Score × 3.0) - (Cost Score × 2.0)
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Recovery Option</th>
                      <th className="p-3">Resolution Confidence</th>
                      <th className="p-3">Risk Score</th>
                      <th className="p-3">Est Cost ($)</th>
                      <th className="p-3">Calculated Utility</th>
                      <th className="p-3">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {trace.consensus_decision.ranking_matrix.map((item, i) => (
                      <tr key={item.option_id} className={i === 0 ? "bg-indigo-950/30 font-semibold" : ""}>
                        <td className="p-3 font-mono text-slate-400">#{i + 1}</td>
                        <td className="p-3 font-bold text-white">{item.label}</td>
                        <td className="p-3 text-emerald-400">{item.resolution_confidence}</td>
                        <td className="p-3 text-rose-400">{item.risk_score}</td>
                        <td className="p-3 font-mono">{item.cost_usd}</td>
                        <td className="p-3 font-mono text-indigo-300">{item.calculated_utility}</td>
                        <td className="p-3">
                          {i === 0 ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              WINNER (EXECUTED)
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SRE POST-MORTEM REPORT */}
      {activeTab === "report" && (
        <div className="mt-6">
          {!trace?.final_report ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No post-mortem report generated yet. Run the multi-agent commander to view Gemini 2.5 Flash SRE report.
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 font-sans">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{trace.final_report.title}</h3>
                  <p className="text-xs text-slate-400">
                    Generated by <span className="text-teal-400 font-medium">{trace.final_report.author}</span> at {trace.final_report.generated_at}
                  </p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(trace.final_report?.report_markdown || "")}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all cursor-pointer"
                >
                  Copy Markdown Report
                </button>
              </div>

              <div className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-4">
                <pre className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap">
                  {trace.final_report.report_markdown}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
