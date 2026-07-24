import React from 'react';
import { Cpu, Database, Network, Server, HardDrive } from 'lucide-react';
import { ServiceNode } from '../types';

interface HealthCardsProps {
  services: Record<string, ServiceNode>;
}

export default function HealthCards({ services }: HealthCardsProps) {
  const serviceList = Object.values(services);

  // Compute metrics
  const avgCpu = serviceList.reduce((acc, curr) => acc + curr.telemetry.cpu, 0) / serviceList.length;
  const avgMem = serviceList.reduce((acc, curr) => acc + curr.telemetry.memory, 0) / serviceList.length;
  
  // DB latency
  const dbServices = serviceList.filter(s => s.role === 'database' || s.role === 'cache');
  const avgDbLatency = dbServices.reduce((acc, curr) => acc + curr.telemetry.latency, 0) / (dbServices.length || 1);

  // Network/Gateway Latency
  const gwLatency = services['gateway']?.telemetry.latency || 0;

  // Health count
  const healthyCount = serviceList.filter(s => s.telemetry.status === 'HEALTHY').length;
  const totalCount = serviceList.length;

  const getMetricColor = (val: number, type: 'cpu' | 'mem' | 'db' | 'gw') => {
    if (type === 'cpu' || type === 'mem') {
      if (val > 80) return 'text-rose-500';
      if (val > 60) return 'text-amber-500';
      return 'text-emerald-500';
    } else if (type === 'db') {
      if (val > 100) return 'text-rose-500';
      if (val > 10) return 'text-amber-500';
      return 'text-emerald-500';
    } else {
      if (val > 500) return 'text-rose-500';
      if (val > 100) return 'text-amber-500';
      return 'text-emerald-500';
    }
  };

  const getMetricBg = (val: number, type: 'cpu' | 'mem' | 'db' | 'gw') => {
    if (type === 'cpu' || type === 'mem') {
      if (val > 80) return 'bg-rose-500/10 border-rose-500/20';
      if (val > 60) return 'bg-amber-500/10 border-amber-500/20';
      return 'bg-emerald-500/10 border-emerald-500/20';
    } else if (type === 'db') {
      if (val > 100) return 'bg-rose-500/10 border-rose-500/20';
      if (val > 10) return 'bg-amber-500/10 border-amber-500/20';
      return 'bg-emerald-500/10 border-emerald-500/20';
    } else {
      if (val > 500) return 'bg-rose-500/10 border-rose-500/20';
      if (val > 100) return 'bg-amber-500/10 border-amber-500/20';
      return 'bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getSystemStatusText = () => {
    if (healthyCount === totalCount) return 'All Operational';
    if (healthyCount > totalCount * 0.7) return 'Degraded Services';
    return 'Critical Outage';
  };

  const getSystemStatusColor = () => {
    if (healthyCount === totalCount) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (healthyCount > totalCount * 0.7) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* 1. CPU Card */}
      <div className={`p-4 rounded-xl border bg-dark-panel border-dark-border flex flex-col justify-between transition-all hover:-translate-y-0.5`}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase font-mono">Cluster CPU Load</span>
          <Cpu size={16} className="text-slate-400" />
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono tracking-tight transition-colors ${getMetricColor(avgCpu, 'cpu')}`}>
            {avgCpu.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-dark-bg rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${avgCpu > 80 ? 'bg-rose-500' : avgCpu > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
            style={{ width: `${Math.min(avgCpu, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* 2. Memory Card */}
      <div className="p-4 rounded-xl border bg-dark-panel border-dark-border flex flex-col justify-between transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase font-mono">Cluster RAM Allocation</span>
          <HardDrive size={16} className="text-slate-400" />
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono tracking-tight transition-colors ${getMetricColor(avgMem, 'mem')}`}>
            {avgMem.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-dark-bg rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${avgMem > 80 ? 'bg-rose-500' : avgMem > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
            style={{ width: `${Math.min(avgMem, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* 3. DB Latency Card */}
      <div className="p-4 rounded-xl border bg-dark-panel border-dark-border flex flex-col justify-between transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase font-mono">DB Response time</span>
          <Database size={16} className="text-slate-400" />
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono tracking-tight transition-colors ${getMetricColor(avgDbLatency, 'db')}`}>
            {avgDbLatency > 100 ? `${(avgDbLatency / 1000).toFixed(2)}s` : `${avgDbLatency.toFixed(1)}ms`}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Target SLA: &lt;10ms</span>
          <span className={avgDbLatency > 10 ? 'text-amber-500 font-semibold' : 'text-emerald-500'}>
            {avgDbLatency > 10 ? 'Breached' : 'Within SLA'}
          </span>
        </div>
      </div>

      {/* 4. Network Latency Card */}
      <div className="p-4 rounded-xl border bg-dark-panel border-dark-border flex flex-col justify-between transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase font-mono">Gateway API Latency</span>
          <Network size={16} className="text-slate-400" />
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono tracking-tight transition-colors ${getMetricColor(gwLatency, 'gw')}`}>
            {gwLatency > 1000 ? `${(gwLatency / 1000).toFixed(2)}s` : `${gwLatency.toFixed(1)}ms`}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Target SLA: &lt;200ms</span>
          <span className={gwLatency > 200 ? 'text-rose-500 font-semibold' : 'text-emerald-500'}>
            {gwLatency > 200 ? 'Breached' : 'Within SLA'}
          </span>
        </div>
      </div>

      {/* 5. System Health Status Card */}
      <div className="p-4 rounded-xl border bg-dark-panel border-dark-border flex flex-col justify-between transition-all hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase font-mono">Microservice Status</span>
          <Server size={16} className="text-slate-400" />
        </div>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tracking-tight">
            {healthyCount}
          </span>
          <span className="text-sm text-slate-400 font-mono">
            / {totalCount}
          </span>
        </div>
        <div className={`mt-2 py-0.5 px-2 rounded text-center border text-[10px] font-semibold tracking-wide uppercase ${getSystemStatusColor()}`}>
          {getSystemStatusText()}
        </div>
      </div>
    </div>
  );
}
