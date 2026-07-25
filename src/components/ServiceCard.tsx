import React from "react";
import { ServiceState, IncidentType } from "../types";
import { Cpu, HardDrive, Clock, AlertTriangle, Play, RotateCcw, Cloud, Database, Cpu as Chip, Network } from "lucide-react";

interface ServiceCardProps {
  service: ServiceState;
  onInject: (serviceId: string, type: IncidentType) => void;
  onResolve: (serviceId: string, action: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onInject, onResolve }) => {
  const isHealthy = service.status === "Healthy";
  const isDegraded = service.status === "Degraded";
  const isCritical = service.status === "Critical";

  const getStatusBadge = () => {
    if (isCritical) {
      return "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse";
    }
    if (isDegraded) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/50";
    }
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
  };

  const getGcpIcon = () => {
    if (service.gcp_resource_type.includes("Cloud SQL")) return <Database className="w-4 h-4 text-cyan-400" />;
    if (service.gcp_resource_type.includes("Memorystore")) return <Chip className="w-4 h-4 text-purple-400" />;
    if (service.gcp_resource_type.includes("Kubernetes") || service.gcp_resource_type.includes("GKE"))
      return <Network className="w-4 h-4 text-blue-400" />;
    return <Cloud className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div
      id={`service-card-${service.id}`}
      className={`rounded-xl border p-4 transition-all duration-300 flex flex-col justify-between ${
        isCritical
          ? "bg-rose-950/20 border-rose-600/40 shadow-lg shadow-rose-950/50"
          : isDegraded
          ? "bg-amber-950/20 border-amber-600/40 shadow-md shadow-amber-950/30"
          : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md"
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
              {getGcpIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">{service.name}</h3>
              <p className="text-[11px] text-slate-400 font-mono">{service.id}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getStatusBadge()}`}>
            {service.status}
          </span>
        </div>

        {/* GCP Resource Tag */}
        <div className="text-[11px] text-cyan-400/90 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded mb-3 inline-block font-mono">
          {service.gcp_resource_type}
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4">{service.description}</p>

        {/* Real-time Metrics Grid */}
        <div className="space-y-2 mb-4 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 text-xs">
          {/* CPU Metric */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" /> CPU Usage
              </span>
              <span className={`font-mono font-medium ${service.cpu_percent > 85 ? "text-rose-400" : "text-slate-200"}`}>
                {service.cpu_percent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  service.cpu_percent > 85 ? "bg-rose-500" : service.cpu_percent > 60 ? "bg-amber-500" : "bg-cyan-500"
                }`}
                style={{ width: `${Math.min(100, service.cpu_percent)}%` }}
              />
            </div>
          </div>

          {/* Memory Metric */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-indigo-400" /> Memory
              </span>
              <span className={`font-mono font-medium ${service.memory_percent > 85 ? "text-rose-400" : "text-slate-200"}`}>
                {service.memory_percent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  service.memory_percent > 85 ? "bg-rose-500" : service.memory_percent > 65 ? "bg-amber-500" : "bg-indigo-500"
                }`}
                style={{ width: `${Math.min(100, service.memory_percent)}%` }}
              />
            </div>
          </div>

          {/* Latency & Error Rate */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 text-[10px] block">P95 Latency</span>
              <span className={`flex items-center gap-1 ${service.latency_ms > 200 ? "text-amber-400" : "text-slate-200"}`}>
                <Clock className="w-3 h-3" /> {service.latency_ms.toFixed(0)} ms
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Error Rate</span>
              <span className={`flex items-center gap-1 ${service.error_rate_percent > 2 ? "text-rose-400" : "text-slate-200"}`}>
                <AlertTriangle className="w-3 h-3" /> {service.error_rate_percent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        {service.dependencies.length > 0 && (
          <div className="mb-4">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Depends On:
            </span>
            <div className="flex flex-wrap gap-1">
              {service.dependencies.map((dep) => (
                <span
                  key={dep}
                  className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono border border-slate-700/60"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => onInject(service.id, "cpu_spike")}
          className="flex-1 py-1.5 px-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-medium flex items-center justify-center gap-1 transition"
          title="POST /inject-incident { service, type: cpu_spike }"
        >
          <Play className="w-3 h-3 fill-rose-400" />
          <span>Fail</span>
        </button>
        <button
          onClick={() => onResolve(service.id, "restart")}
          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium flex items-center justify-center gap-1 transition"
          title="POST /resolve-incident { service, action: restart }"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restart</span>
        </button>
      </div>
    </div>
  );
};
