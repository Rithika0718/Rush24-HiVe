import React, { useState } from "react";
import { IncidentType, ActiveIncident } from "../types";
import { Flame, ShieldCheck, AlertOctagon, Terminal } from "lucide-react";

interface IncidentControlPanelProps {
  servicesList: string[];
  activeIncidents: ActiveIncident[];
  onInject: (serviceId: string, type: IncidentType, details?: string) => Promise<void>;
  onResolve: (serviceId: string, action: string) => Promise<void>;
}

export const IncidentControlPanel: React.FC<IncidentControlPanelProps> = ({
  servicesList,
  activeIncidents,
  onInject,
  onResolve,
}) => {
  const [targetService, setTargetService] = useState<string>("orders-db");
  const [incidentType, setIncidentType] = useState<IncidentType>("cpu_spike");
  const [details, setDetails] = useState<string>("");

  const [resolveTarget, setResolveTarget] = useState<string>("orders-db");
  const [resolveAction, setResolveAction] = useState<string>("restart");

  const [loadingInject, setLoadingInject] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);

  const handleInjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingInject(true);
    await onInject(targetService, incidentType, details);
    setLoadingInject(false);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingResolve(true);
    await onResolve(resolveTarget, resolveAction);
    setLoadingResolve(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Incident Injection Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/60">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">1. Incident Injection Console</h2>
            <p className="text-xs text-slate-400">
              Triggers <code className="text-rose-300 font-mono">POST /inject-incident</code>
            </p>
          </div>
        </div>

        <form onSubmit={handleInjectSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Service Select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Service</label>
              <select
                value={targetService}
                onChange={(e) => setTargetService(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {servicesList.map((sid) => (
                  <option key={sid} value={sid}>
                    {sid}
                  </option>
                ))}
              </select>
            </div>

            {/* Failure Mode Select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Failure Mode</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="cpu_spike">cpu_spike (CPU ~98%)</option>
                <option value="memory_leak">memory_leak (RAM ~97%)</option>
                <option value="latency_spike">latency_spike (+1850ms)</option>
                <option value="network_partition">network_partition (Loss)</option>
                <option value="db_connection_exhaustion">db_connection_exhaustion</option>
                <option value="service_crash">service_crash (100% Error)</option>
              </select>
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Incident Context / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Unindexed query storm on orders table"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loadingInject}
            className="w-full py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-rose-950/50 disabled:opacity-50"
          >
            <Flame className="w-4 h-4" />
            <span>{loadingInject ? "Injecting Failure..." : "POST /inject-incident"}</span>
          </button>
        </form>
      </div>

      {/* Incident Recovery Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">2. Incident Recovery Console</h2>
            <p className="text-xs text-slate-400">
              Triggers <code className="text-emerald-300 font-mono">POST /resolve-incident</code>
            </p>
          </div>
        </div>

        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Service Select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Service</label>
              <select
                value={resolveTarget}
                onChange={(e) => setResolveTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                {servicesList.map((sid) => (
                  <option key={sid} value={sid}>
                    {sid}
                  </option>
                ))}
              </select>
            </div>

            {/* Resolution Action */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Resolution Action</label>
              <select
                value={resolveAction}
                onChange={(e) => setResolveAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="restart">restart (Container Reboot)</option>
                <option value="scale_up">scale_up (Increase Replicas)</option>
                <option value="flush_cache">flush_cache (Purge Memory)</option>
                <option value="increase_conn_pool">increase_conn_pool</option>
                <option value="rollback_deploy">rollback_deploy</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingResolve}
            className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loadingResolve ? "Executing Recovery..." : "POST /resolve-incident"}</span>
          </button>

          {/* Active Incidents Summary */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" /> Active System Incidents ({activeIncidents.length}):
            </span>
            {activeIncidents.length === 0 ? (
              <p className="text-xs text-emerald-400/90 font-mono bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                ✓ No active incidents. All services operating normally.
              </p>
            ) : (
              <div className="space-y-2">
                {activeIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-2.5 rounded bg-rose-950/30 border border-rose-800/60 text-xs font-mono"
                  >
                    <div className="flex justify-between text-rose-300 font-bold">
                      <span>[{inc.target_service}] {inc.type}</span>
                      <span className="text-[10px] text-slate-400">{inc.id}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5">{inc.details}</p>
                    {inc.impacted_services.length > 0 && (
                      <div className="text-[10px] text-amber-300 mt-1">
                        Cascaded Impact: {inc.impacted_services.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
