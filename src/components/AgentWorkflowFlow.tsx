import React, { useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "motion/react";
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
  ChevronRight,
  Info,
  Clock,
  Check,
} from "lucide-react";
import { IncidentState } from "../types";

interface CustomAgentNodeData extends Record<string, unknown> {
  title: string;
  agentId: string;
  role: string;
  model: string;
  icon: any;
  status: "idle" | "running" | "completed";
  summary?: string;
  details?: any;
  color: string;
  accentBorder: string;
  onClickNode: (agentId: string) => void;
  isSelected: boolean;
}

type AgentNode = Node<CustomAgentNodeData, "agentNode">;

// Custom React Flow Node Component
const AgentCustomNode: React.FC<NodeProps<AgentNode>> = ({ data }) => {
  const Icon = data.icon;
  const isRunning = data.status === "running";
  const isCompleted = data.status === "completed";

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0.8 }}
      animate={{
        scale: isRunning ? 1.05 : data.isSelected ? 1.02 : 1,
        opacity: 1,
      }}
      transition={{ duration: 0.3 }}
      onClick={() => data.onClickNode(data.agentId)}
      className={`relative min-w-[210px] p-3.5 rounded-xl border-2 transition-all cursor-pointer shadow-xl backdrop-blur-md ${
        isRunning
          ? `${data.accentBorder} bg-slate-900 ring-4 ring-indigo-500/30 animate-pulse`
          : isCompleted
          ? "border-emerald-500/70 bg-slate-900/95 shadow-emerald-950/40"
          : data.isSelected
          ? `${data.accentBorder} bg-slate-900`
          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500 !w-3 !h-3 !-left-2.5 !border-2 !border-slate-900"
      />

      {/* Glow effect for running/active */}
      {isRunning && (
        <span className="absolute -top-2 -right-2 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
        </span>
      )}

      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 rounded-full p-0.5 border-2 border-slate-900">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}

      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={`p-2 rounded-lg border ${data.color} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-white truncate leading-tight">{data.title}</h4>
          <span className="text-[10px] text-slate-400 block font-mono mt-0.5 truncate">
            {data.model}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-slate-300 font-medium mb-1 line-clamp-1">{data.role}</div>

      {data.summary ? (
        <div className="text-[10px] text-slate-400 bg-slate-950/90 p-1.5 rounded border border-slate-800/80 line-clamp-2 mt-1">
          {data.summary}
        </div>
      ) : (
        <div className="text-[10px] text-slate-500 italic mt-1">
          {isRunning ? "Executing agent logic..." : "Waiting for trigger..."}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500 !w-3 !h-3 !-right-2.5 !border-2 !border-slate-900"
      />
    </motion.div>
  );
};

const nodeTypes = {
  agentNode: AgentCustomNode,
};

interface WorkflowProps {
  trace: IncidentState | null;
  onExecuteCommander: (serviceId: string) => Promise<void>;
  loading: boolean;
}

export const AgentWorkflowFlow: React.FC<WorkflowProps> = ({
  trace,
  onExecuteCommander,
  loading,
}) => {
  const [selectedService, setSelectedService] = useState<string>("orders-db");
  const [activeAgentId, setActiveAgentId] = useState<string>("diagnosis");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Define 8 Agent Definitions
  const agentDefs = [
    {
      id: "monitor",
      title: "1. Monitor Agent",
      role: "Metric & Anomaly Detection",
      model: "GCP Telemetry Engine",
      icon: Activity,
      color: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      accentBorder: "border-sky-500",
      x: 30,
      y: 200,
    },
    {
      id: "diagnosis",
      title: "2. Diagnosis Agent",
      role: "Gemini 2.5 Root Cause & Ripple",
      model: "gemini-2.5-flash",
      icon: Sparkles,
      color: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      accentBorder: "border-purple-500",
      x: 290,
      y: 200,
    },
    {
      id: "resource",
      title: "3. Resource Agent",
      role: "Compute & Memory Fixes",
      model: "SRE Options Engine",
      icon: Cpu,
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      accentBorder: "border-amber-500",
      x: 560,
      y: 40,
    },
    {
      id: "cost",
      title: "4. Cost Agent",
      role: "FinOps USD Cost ($)",
      model: "gemini-2.5-flash FinOps",
      icon: DollarSign,
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      accentBorder: "border-emerald-500",
      x: 560,
      y: 150,
    },
    {
      id: "risk",
      title: "5. Risk Agent",
      role: "Operational Downtime Risk",
      model: "gemini-2.5-flash SRE",
      icon: ShieldAlert,
      color: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      accentBorder: "border-rose-500",
      x: 560,
      y: 260,
    },
    {
      id: "traffic",
      title: "6. Traffic Agent",
      role: "Edge Rate Limiting & Circuit",
      model: "GCP API Gateway",
      icon: GitFork,
      color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      accentBorder: "border-cyan-500",
      x: 560,
      y: 370,
    },
    {
      id: "consensus",
      title: "7. Consensus Agent",
      role: "Transparent Utility Ranking",
      model: "Multi-Attribute Utility",
      icon: Scale,
      color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      accentBorder: "border-indigo-500",
      x: 830,
      y: 200,
    },
    {
      id: "reporter",
      title: "8. Reporter Agent",
      role: "SRE Post-Mortem Generation",
      model: "gemini-2.5-flash Lead",
      icon: FileText,
      color: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      accentBorder: "border-teal-500",
      x: 1090,
      y: 200,
    },
  ];

  // Map state to node status
  const getAgentStatus = (agentId: string) => {
    if (!trace) return "idle";
    if (activeStepIndex >= 0) {
      const stepAgent = agentDefs[activeStepIndex]?.id;
      if (agentId === stepAgent && isSimulating) return "running";
      const stepIdx = agentDefs.findIndex((a) => a.id === agentId);
      if (stepIdx < activeStepIndex) return "completed";
      if (stepIdx === activeStepIndex && !isSimulating) return "completed";
      return "idle";
    }
    // Default when trace exists
    return "completed";
  };

  const getAgentSummary = (agentId: string) => {
    if (!trace) return undefined;
    switch (agentId) {
      case "monitor":
        return trace.monitor_findings
          ? `Detected ${trace.monitor_findings.anomalies_detected?.length || 1} anomalies on ${trace.affected_service}`
          : undefined;
      case "diagnosis":
        return trace.diagnosis_report?.root_cause_hypothesis || undefined;
      case "resource":
        return trace.resource_options
          ? `${trace.resource_options.length} fix options proposed`
          : undefined;
      case "cost":
        return "FinOps: Restart ($0.00) vs ScaleUp (+$45/mo)";
      case "risk":
        return "SRE Risk: Restart (98% confidence, low risk)";
      case "traffic":
        return "Edge rate limit complement prepared";
      case "consensus":
        return trace.consensus_decision
          ? `Selected ${trace.consensus_decision.selected_label} (Utility ${trace.consensus_decision.winning_utility_score})`
          : undefined;
      case "reporter":
        return trace.final_report ? "SRE Post-Mortem generated" : undefined;
      default:
        return undefined;
    }
  };

  // React Flow Nodes
  const nodes: Node[] = agentDefs.map((def) => ({
    id: def.id,
    type: "agentNode",
    position: { x: def.x, y: def.y },
    data: {
      agentId: def.id,
      title: def.title,
      role: def.role,
      model: def.model,
      icon: def.icon,
      color: def.color,
      accentBorder: def.accentBorder,
      status: getAgentStatus(def.id),
      summary: getAgentSummary(def.id),
      isSelected: activeAgentId === def.id,
      onClickNode: (id: string) => setActiveAgentId(id),
    },
  }));

  // React Flow Edges
  const edges: Edge[] = [
    { id: "e1-2", source: "monitor", target: "diagnosis" },
    { id: "e2-3", source: "diagnosis", target: "resource" },
    { id: "e2-4", source: "diagnosis", target: "cost" },
    { id: "e2-5", source: "diagnosis", target: "risk" },
    { id: "e2-6", source: "diagnosis", target: "traffic" },
    { id: "e3-7", source: "resource", target: "consensus" },
    { id: "e4-7", source: "cost", target: "consensus" },
    { id: "e5-7", source: "risk", target: "consensus" },
    { id: "e6-7", source: "traffic", target: "consensus" },
    { id: "e7-8", source: "consensus", target: "reporter" },
  ].map((edge) => {
    const isCompleted =
      trace &&
      getAgentStatus(edge.source) === "completed" &&
      getAgentStatus(edge.target) === "completed";
    return {
      ...edge,
      animated: isSimulating || (trace && getAgentStatus(edge.source) === "completed"),
      style: {
        stroke: isCompleted ? "#10b981" : "#6366f1",
        strokeWidth: isCompleted ? 2.5 : 1.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isCompleted ? "#10b981" : "#6366f1",
      },
    };
  });

  // Replay sequential lighting up animation for judges
  const handleReplayAnimation = async () => {
    if (!trace) {
      await onExecuteCommander(selectedService);
    }
    setIsSimulating(true);
    for (let i = 0; i < agentDefs.length; i++) {
      setActiveStepIndex(i);
      setActiveAgentId(agentDefs[i].id);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    setIsSimulating(false);
  };

  const currentSelectedDef = agentDefs.find((a) => a.id === activeAgentId) || agentDefs[1];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-md text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                LangGraph Multi-Agent Workflow
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Consensus Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              8 Autonomous agents collaborating sequentially & in parallel (Monitor → Diagnosis → [Resource, Cost, Risk, Traffic] → Consensus → Reporter).
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            disabled={loading || isSimulating}
            className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="orders-db">orders-db (Cloud SQL Primary)</option>
            <option value="auth-service">auth-service (Cloud Run)</option>
            <option value="api-gateway">api-gateway (Cloud Load Balancer)</option>
            <option value="payments-service">payments-service (GKE)</option>
            <option value="redis-cache">redis-cache (Memorystore Redis)</option>
          </select>

          <button
            onClick={() => onExecuteCommander(selectedService)}
            disabled={loading || isSimulating}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-lg shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Zap className="w-4 h-4 animate-spin text-amber-300" />
                <span>Running Agents...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-indigo-200" />
                <span>Trigger Incident & Launch Graph</span>
              </>
            )}
          </button>

          {trace && (
            <button
              onClick={handleReplayAnimation}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Lighting Sequence</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Layout: React Flow Canvas (Left/Top) + Expandable Inspector Side Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* React Flow Container */}
        <div className="lg:col-span-8 bg-slate-950/90 border border-slate-800 rounded-xl h-[480px] relative overflow-hidden shadow-inner">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            className="bg-slate-950"
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200" />
          </ReactFlow>

          {/* Canvas Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg backdrop-blur-md text-[10px] text-slate-300 space-y-1">
            <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">
              Agent Flow Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Completed Step</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span>Active Agent Step</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>Idle / Queued</span>
            </div>
          </div>
        </div>

        {/* Expandable Inspector Side Panel */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">{currentSelectedDef.title}</h3>
              </div>
              <span className="text-[10px] text-indigo-300 font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800">
                {currentSelectedDef.model}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">{currentSelectedDef.role}</p>

            {!trace ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                Click <strong className="text-slate-300">"Trigger Incident & Launch Graph"</strong> above to see full multi-agent consensus outputs in action.
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAgentId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* Monitor Agent Inspection */}
                  {activeAgentId === "monitor" && trace.monitor_findings && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-sky-950/30 border border-sky-800/50 rounded-lg">
                        <strong className="text-sky-300 block mb-1">Target Service Metrics:</strong>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-300">
                          <div>CPU: {trace.monitor_findings.metrics?.cpu_percent}%</div>
                          <div>RAM: {trace.monitor_findings.metrics?.memory_percent}%</div>
                          <div>Latency: {trace.monitor_findings.metrics?.latency_ms}ms</div>
                          <div>Errors: {trace.monitor_findings.metrics?.error_rate_percent}%</div>
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                        <strong className="text-rose-400 block mb-1">Detected Anomalies:</strong>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                          {trace.monitor_findings.anomalies_detected?.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Diagnosis Agent Inspection */}
                  {activeAgentId === "diagnosis" && trace.diagnosis_report && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-lg">
                        <strong className="text-purple-300 block mb-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Gemini 2.5 Flash Root Cause:
                        </strong>
                        <p className="text-purple-100 leading-relaxed mt-1">
                          {trace.diagnosis_report.root_cause_hypothesis}
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded border border-slate-800 font-mono text-[11px]">
                        <span className="text-slate-400 block">Downstream Impacted Cascade:</span>
                        <span className="text-amber-400 font-bold">
                          {trace.diagnosis_report.downstream_impacted_services?.join(", ") || "None"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Resource Agent Inspection */}
                  {activeAgentId === "resource" && trace.resource_options && (
                    <div className="space-y-2 text-xs">
                      <strong className="text-amber-300 block">Proposed Fix Options:</strong>
                      {trace.resource_options.map((opt) => (
                        <div key={opt.option_id} className="p-2.5 bg-slate-900 rounded border border-slate-800">
                          <span className="font-bold text-white block">{opt.label}</span>
                          <span className="text-slate-400 text-[11px] block mt-0.5">{opt.mechanism}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cost Agent Inspection */}
                  {activeAgentId === "cost" && trace.cost_estimates && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg text-xs space-y-2">
                      <strong className="text-emerald-300 block flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> FinOps Cost Analysis:
                      </strong>
                      <div className="text-slate-200 font-mono text-[11px] space-y-1">
                        <div>Restart: $0.00 (Included in uptime)</div>
                        <div>Scale Up: +$45.00/mo recurring capacity</div>
                        <div>Flush Cache: $0.00</div>
                      </div>
                    </div>
                  )}

                  {/* Risk Agent Inspection */}
                  {activeAgentId === "risk" && trace.risk_estimates && (
                    <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-lg text-xs space-y-2">
                      <strong className="text-rose-300 block flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> SRE Operational Risk:
                      </strong>
                      <div className="text-slate-200 text-[11px] space-y-1">
                        <div>
                          <strong>Restart:</strong> 98% resolution confidence, 12s downtime window.
                        </div>
                        <div>
                          <strong>Scale Up:</strong> 82% confidence, zero downtime, high cost.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Traffic Agent Inspection */}
                  {activeAgentId === "traffic" && trace.traffic_options && (
                    <div className="space-y-2 text-xs">
                      <strong className="text-cyan-300 block">Edge Traffic Mitigations:</strong>
                      {trace.traffic_options.map((to) => (
                        <div key={to.option_id} className="p-2 bg-slate-900 rounded border border-slate-800">
                          <span className="font-bold text-white">{to.label}</span>
                          <p className="text-slate-400 text-[11px]">{to.mechanism}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Consensus Agent Inspection */}
                  {activeAgentId === "consensus" && trace.consensus_decision && (
                    <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-lg text-xs space-y-2">
                      <strong className="text-indigo-300 block flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5" /> Winner Utility Decision:
                      </strong>
                      <div className="text-lg font-bold text-white">
                        {trace.consensus_decision.selected_label}
                      </div>
                      <p className="text-slate-300">{trace.consensus_decision.consensus_rationale}</p>
                    </div>
                  )}

                  {/* Reporter Agent Inspection */}
                  {activeAgentId === "reporter" && trace.final_report && (
                    <div className="p-3 bg-teal-950/30 border border-teal-800/50 rounded-lg text-xs space-y-2">
                      <strong className="text-teal-300 block">{trace.final_report.title}</strong>
                      <p className="text-slate-300">{trace.final_report.executive_summary}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Side panel footer */}
          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
            <span>LangGraph Execution Graph</span>
            <span>Shared IncidentState</span>
          </div>
        </div>
      </div>
    </div>
  );
};
