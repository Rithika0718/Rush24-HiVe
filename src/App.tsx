import React, { useEffect, useState, useCallback } from "react";
import { SystemState, IncidentType, ServiceState, IncidentState } from "./types";
import { Header } from "./components/Header";
import { ServiceCard } from "./components/ServiceCard";
import { TopologyGraph } from "./components/TopologyGraph";
import { IncidentControlPanel } from "./components/IncidentControlPanel";
import { ApiTesterPanel } from "./components/ApiTesterPanel";
import { ReadmeDocs } from "./components/ReadmeDocs";
import { AgentWorkflowFlow } from "./components/AgentWorkflowFlow";
import { ConsensusPanel } from "./components/ConsensusPanel";
import { RootCauseReportPanel } from "./components/RootCauseReportPanel";
import {
  Server,
  Activity,
  ShieldAlert,
  Check,
  RefreshCw,
  AlertCircle,
  BrainCircuit,
  Scale,
  FileText,
  Play,
  Terminal,
} from "lucide-react";

export default function App() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [trace, setTrace] = useState<IncidentState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commanderLoading, setCommanderLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "warning";
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "agent-flow" | "consensus" | "report" | "api">(
    "overview"
  );

  const showToast = (text: string, type: "success" | "error" | "warning" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch /system-state from FastAPI backend
  const fetchSystemState = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/system-state");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: SystemState = await res.json();
      setSystemState(data);
    } catch (err) {
      console.error("Failed to fetch system state:", err);
      showToast("Connecting to Python FastAPI backend...", "warning");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Poll system state every 4 seconds
  useEffect(() => {
    fetchSystemState();
    const interval = setInterval(fetchSystemState, 4000);
    return () => clearInterval(interval);
  }, [fetchSystemState]);

  // Execute 8-Agent LangGraph Orchestration (/handle-incident)
  const handleExecuteCommander = async (serviceId: string = "orders-db") => {
    setCommanderLoading(true);
    try {
      const res = await fetch("/api/handle-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: serviceId,
          auto_inject: true,
          incident_type: "cpu_spike",
        }),
      });

      if (!res.ok) {
        throw new Error(`Orchestration failed with status ${res.status}`);
      }

      const data: IncidentState = await res.json();
      setTrace(data);
      showToast(`Multi-Agent LangGraph Commander resolved ${serviceId}!`, "success");
      await fetchSystemState();
    } catch (err: any) {
      showToast(err.message || "Failed to execute multi-agent commander.", "error");
    } finally {
      setCommanderLoading(false);
    }
  };

  // Handle Failure Injection
  const handleInjectIncident = async (serviceId: string, type: IncidentType, details?: string) => {
    try {
      const res = await fetch("/inject-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: serviceId, type, details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Injection failed");

      showToast(
        `Injected '${type}' into ${serviceId}. ${
          data.cascaded_impacted_services?.length
            ? `Cascaded to: ${data.cascaded_impacted_services.join(", ")}`
            : "No cascaded dependencies."
        }`,
        "error"
      );
      await fetchSystemState();
    } catch (err: any) {
      showToast(err.message || "Failed to inject incident", "error");
    }
  };

  // Handle Recovery
  const handleResolveIncident = async (serviceId: string, action: string) => {
    try {
      const res = await fetch("/resolve-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: serviceId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Resolution failed");

      showToast(`Resolved incident for ${serviceId} via '${action}'.`, "success");
      await fetchSystemState();
    } catch (err: any) {
      showToast(err.message || "Failed to resolve incident", "error");
    }
  };

  // Handle Environment Reset
  const handleResetEnvironment = async () => {
    try {
      const res = await fetch("/reset-environment", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed");

      showToast("GCP Digital Twin environment reset to clean baseline state.", "success");
      await fetchSystemState();
    } catch (err: any) {
      showToast(err.message || "Failed to reset environment", "error");
    }
  };

  const handleOpenDocs = () => {
    window.open("/docs", "_blank");
  };

  const servicesList = systemState ? Object.keys(systemState.services) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 max-w-md animate-bounce text-xs font-semibold backdrop-blur-md ${
            toastMessage.type === "error"
              ? "bg-rose-950/90 text-rose-200 border-rose-700"
              : toastMessage.type === "warning"
              ? "bg-amber-950/90 text-amber-200 border-amber-700"
              : "bg-emerald-950/90 text-emerald-200 border-emerald-700"
          }`}
        >
          {toastMessage.type === "error" ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          ) : toastMessage.type === "warning" ? (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <Header
        systemHealth={systemState?.system_health || "INITIALIZING"}
        activeIncidentsCount={systemState?.active_incidents_count || 0}
        onReset={handleResetEnvironment}
        onOpenDocs={handleOpenDocs}
        isRefreshing={isRefreshing}
        onRefresh={fetchSystemState}
        onQuickInject={() => handleInjectIncident("orders-db", "cpu_spike", "Sudden transaction surge causing thread contention.")}
        onQuickRunCommander={() => handleExecuteCommander("orders-db")}
        commanderLoading={commanderLoading}
      />

      {/* Navigation Quick Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800 sticky top-[65px] z-40 backdrop-blur-md px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>1. System Health & Digital Twin</span>
          </button>

          <button
            onClick={() => setActiveTab("agent-flow")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "agent-flow"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-purple-300" />
            <span>2. LangGraph Agent Flow (React Flow)</span>
            {trace && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>

          <button
            onClick={() => setActiveTab("consensus")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "consensus"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Scale className="w-4 h-4 text-amber-300" />
            <span>3. Consensus Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("report")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "report"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-4 h-4 text-teal-300" />
            <span>4. SRE Post-Mortem Report</span>
          </button>

          <button
            onClick={() => setActiveTab("api")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "api"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-300" />
            <span>5. Developer API & cURL</span>
          </button>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-10">
        {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
        {(activeTab === "overview" || activeTab === "agent-flow") && (
          <div className="space-y-8">
            {/* Banner Summary */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Server className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-xl font-bold tracking-tight text-slate-100">
                      Google Cloud Operations Center & Digital Twin
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl">
                    Real-time simulation backend modeling GCP microservices, telemetry metrics, failure injection,
                    and cascading dependencies with an autonomous 8-Agent LangGraph Incident Commander.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800 shrink-0">
                  <div>
                    <span className="text-slate-500 block text-[10px]">MONITORED SERVICES</span>
                    <span className="text-cyan-400 font-bold text-sm">{servicesList.length} Nodes</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">ACTIVE INCIDENTS</span>
                    <span
                      className={`font-bold text-sm ${
                        (systemState?.active_incidents_count || 0) > 0 ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {systemState?.active_incidents_count || 0} Incidents
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monitored GCP Microservices Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" /> GCP Monitored Services & Health
                  </h2>
                  <p className="text-xs text-slate-400">
                    Color-coded live metrics (green/yellow/red) polling <code className="text-cyan-300">/system-state</code>.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Auto-refreshing every 4s
                </span>
              </div>

              {loading && !systemState ? (
                <div className="p-12 text-center text-slate-400 text-xs font-mono bg-slate-900/50 rounded-xl border border-slate-800">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                  Connecting to Python FastAPI GCP Digital Twin...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {systemState &&
                    (Object.values(systemState.services) as ServiceState[]).map((svc) => (
                      <ServiceCard
                        key={svc.id}
                        service={svc}
                        onInject={handleInjectIncident}
                        onResolve={handleResolveIncident}
                      />
                    ))}
                </div>
              )}
            </section>

            {/* Topology Graph */}
            {systemState && <TopologyGraph services={systemState.services} />}
          </div>
        )}

        {/* TAB 2: LANGGRAPH AGENT WORKFLOW GRAPH */}
        {(activeTab === "overview" || activeTab === "agent-flow") && (
          <section className="space-y-4">
            <AgentWorkflowFlow
              trace={trace}
              onExecuteCommander={handleExecuteCommander}
              loading={commanderLoading}
            />
          </section>
        )}

        {/* TAB 3: CONSENSUS UTILITY MATRIX */}
        {(activeTab === "overview" || activeTab === "consensus") && (
          <section className="space-y-4">
            <ConsensusPanel trace={trace} />
          </section>
        )}

        {/* TAB 4: SRE POST-MORTEM REPORT */}
        {(activeTab === "overview" || activeTab === "report") && (
          <section className="space-y-4">
            <RootCauseReportPanel trace={trace} />
          </section>
        )}

        {/* TAB 5: INTERACTIVE CONTROL PANEL & DEVELOPER API */}
        {(activeTab === "overview" || activeTab === "api") && (
          <div className="space-y-8">
            <IncidentControlPanel
              servicesList={servicesList}
              activeIncidents={systemState?.active_incidents || []}
              onInject={handleInjectIncident}
              onResolve={handleResolveIncident}
            />

            <ApiTesterPanel systemState={systemState} onOpenDocs={handleOpenDocs} />

            <ReadmeDocs />
          </div>
        )}
      </main>
    </div>
  );
}
