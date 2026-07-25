import React from "react";
import { Server, Activity, ShieldAlert, RefreshCw, BookOpen, Terminal } from "lucide-react";

interface HeaderProps {
  systemHealth: string;
  activeIncidentsCount: number;
  onReset: () => void;
  onOpenDocs: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  onQuickInject?: () => void;
  onQuickRunCommander?: () => void;
  commanderLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  systemHealth,
  activeIncidentsCount,
  onReset,
  onOpenDocs,
  isRefreshing,
  onRefresh,
  onQuickInject,
  onQuickRunCommander,
  commanderLoading = false,
}) => {
  const getBadgeStyle = () => {
    switch (systemHealth) {
      case "CRITICAL_INCIDENT":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse";
      case "DEGRADED":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">HIVE Nebula</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
                GCP Digital Twin v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Multi-Agent Incident Commander — Foundation Layer
            </p>
          </div>
        </div>

        {/* Live System Status & Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          <div
            id="system-status-badge"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getBadgeStyle()}`}
          >
            {systemHealth === "CRITICAL_INCIDENT" ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : (
              <Activity className="w-4 h-4 text-emerald-400" />
            )}
            <span>STATUS: {systemHealth}</span>
            {activeIncidentsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-slate-950 text-[10px] font-bold">
                {activeIncidentsCount} {activeIncidentsCount === 1 ? "INCIDENT" : "INCIDENTS"}
              </span>
            )}
          </div>

          {/* Quick Inject Incident Button */}
          {onQuickInject && (
            <button
              id="header-quick-inject-btn"
              onClick={onQuickInject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/80 text-rose-200 hover:bg-rose-900 transition border border-rose-700/80 shadow-md shadow-rose-950/40"
              title="Inject CPU spike incident into orders-db"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>[ Inject Incident ]</span>
            </button>
          )}

          {/* Quick Run Multi-Agent Commander Button */}
          {onQuickRunCommander && (
            <button
              id="header-quick-commander-btn"
              onClick={onQuickRunCommander}
              disabled={commanderLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white hover:opacity-90 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              title="Run Gemini Multi-Agent Orchestrator"
            >
              <Terminal className={`w-3.5 h-3.5 ${commanderLoading ? "animate-spin text-cyan-300" : ""}`} />
              <span>{commanderLoading ? "Agents Reasoning..." : "⚡ Run Agents"}</span>
            </button>
          )}

          {/* Refresh State */}
          <button
            id="refresh-state-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition border border-slate-700 disabled:opacity-50"
            title="Poll GET /system-state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>Poll State</span>
          </button>

          {/* Reset State */}
          <button
            id="reset-state-btn"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 transition border border-amber-800/50"
            title="POST /reset-environment"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Twin</span>
          </button>

          {/* Swagger / Docs */}
          <button
            id="fastapi-docs-btn"
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900/60 transition border border-cyan-800/80"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>FastAPI Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
