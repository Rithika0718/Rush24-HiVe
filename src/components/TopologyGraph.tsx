import React from "react";
import { ServiceState } from "../types";
import { ArrowRight, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TopologyGraphProps {
  services: Record<string, ServiceState>;
}

export const TopologyGraph: React.FC<TopologyGraphProps> = ({ services }) => {
  const serviceList: ServiceState[] = Object.values(services);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            GCP Dependency Topology Map
          </h2>
          <p className="text-xs text-slate-400">
            Directed dependency relationships. Failure at a database or cache node cascades upstream.
          </p>
        </div>
      </div>

      {/* Visual Dependency Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
        {/* Layer 1: Edge Ingress */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
            Layer 1: Edge Ingress
          </div>
          {serviceList
            .filter((s) => s.id === "api-gateway")
            .map((svc) => (
              <TopologyNodeCard key={svc.id} service={svc} />
            ))}
        </div>

        {/* Layer 2: Core Microservices */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-1">
            Layer 2: Application Services
          </div>
          {serviceList
            .filter((s) => ["auth-service", "payments-service"].includes(s.id))
            .map((svc) => (
              <TopologyNodeCard key={svc.id} service={svc} />
            ))}
        </div>

        {/* Layer 3: Persistence & Cache Datastores */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider border-b border-slate-800 pb-1">
            Layer 3: Data Tier (Root Storage)
          </div>
          {serviceList
            .filter((s) => ["orders-db", "cache"].includes(s.id))
            .map((svc) => (
              <TopologyNodeCard key={svc.id} service={svc} />
            ))}
        </div>
      </div>

      {/* Dependency Flow Instructions */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
        <span className="text-slate-300 font-semibold">Dependency Cascade Rule:</span>
        <div className="flex items-center gap-1">
          <span className="text-purple-300">orders-db</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-indigo-300">payments-service</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-cyan-300">api-gateway</span>
        </div>
      </div>
    </div>
  );
};

interface TopologyNodeCardProps {
  service: ServiceState;
}

const TopologyNodeCard: React.FC<TopologyNodeCardProps> = ({ service }) => {
  const isHealthy = service.status === "Healthy";
  const isCritical = service.status === "Critical";

  return (
    <div
      className={`p-3 rounded-lg border text-xs transition-all ${
        isCritical
          ? "bg-rose-950/40 border-rose-600/60 text-rose-200"
          : !isHealthy
          ? "bg-amber-950/40 border-amber-600/60 text-amber-200"
          : "bg-slate-900 border-slate-800 text-slate-200"
      }`}
    >
      <div className="flex items-center justify-between font-semibold mb-1">
        <span>{service.name}</span>
        {isHealthy ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <AlertTriangle className={`w-3.5 h-3.5 ${isCritical ? "text-rose-400" : "text-amber-400"}`} />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
        <span>Latency: {service.latency_ms.toFixed(0)}ms</span>
        <span>CPU: {service.cpu_percent.toFixed(0)}%</span>
      </div>
    </div>
  );
};
