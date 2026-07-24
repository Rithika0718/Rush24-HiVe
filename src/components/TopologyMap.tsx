import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  HardDrive, 
  Globe, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { ServiceNode, CloudProvider } from '../types';

interface TopologyMapProps {
  nodes: ServiceNode[];
  onSelectNode: (node: ServiceNode) => void;
  selectedNodeId?: string;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({
  nodes,
  onSelectNode,
  selectedNodeId,
}) => {
  const [filterProvider, setFilterProvider] = useState<CloudProvider | 'ALL'>('ALL');

  const filteredNodes = filterProvider === 'ALL' 
    ? nodes 
    : nodes.filter((n) => n.provider === filterProvider);

  const getProviderBadge = (provider: CloudProvider) => {
    switch (provider) {
      case 'AWS':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-400 border border-amber-800">AWS</span>;
      case 'GCP':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-950 text-blue-400 border border-blue-800">GCP</span>;
      case 'Kubernetes':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">K8s</span>;
      case 'Azure':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-950 text-sky-400 border border-sky-800">Azure</span>;
    }
  };

  const getNodeIcon = (type: ServiceNode['type']) => {
    switch (type) {
      case 'gateway':
        return <Globe className="w-5 h-5 text-indigo-400" />;
      case 'microservice':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'database':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'cache':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'queue':
        return <Layers className="w-5 h-5 text-purple-400" />;
      default:
        return <Server className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Topology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Live Cloud Topology Map
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual node mesh with live CPU, memory, and telemetry links.
          </p>
        </div>

        {/* Provider Filters */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['ALL', 'AWS', 'GCP', 'Kubernetes', 'Azure'] as const).map((prov) => (
            <button
              key={prov}
              onClick={() => setFilterProvider(prov)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterProvider === prov
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>
      </div>

      {/* Node Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredNodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isIncident = node.status === 'INCIDENT';
          const isDegraded = node.status === 'DEGRADED';

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node)}
              className={`relative rounded-xl p-4 border transition-all cursor-pointer group ${
                isIncident
                  ? 'bg-rose-950/30 border-rose-600/80 hover:border-rose-500 shadow-rose-950/50 shadow-lg'
                  : isDegraded
                  ? 'bg-amber-950/20 border-amber-600/70 hover:border-amber-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              } ${isSelected ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900' : ''}`}
            >
              {/* Status Indicator Glow */}
              {isIncident && (
                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Incident</span>
                </div>
              )}

              {isDegraded && (
                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Degraded</span>
                </div>
              )}

              {node.status === 'HEALTHY' && (
                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] font-medium text-emerald-400 uppercase">Healthy</span>
                </div>
              )}

              {/* Node Main Title */}
              <div className="flex items-start space-x-3 pr-16">
                <div className={`p-2.5 rounded-lg border ${
                  isIncident ? 'bg-rose-900/50 border-rose-700' : 'bg-slate-900 border-slate-800'
                }`}>
                  {getNodeIcon(node.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate max-w-[120px]">
                      {node.name}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-1.5">
                    {getProviderBadge(node.provider)}
                    <span className="text-[11px] text-slate-400 font-mono">{node.region}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Progress bars */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className={`font-mono font-semibold ${node.cpu > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {node.cpu}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        node.cpu > 80 ? 'bg-rose-500' : node.cpu > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${node.cpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Memory</span>
                    <span className={`font-mono font-semibold ${node.memory > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {node.memory}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        node.memory > 80 ? 'bg-rose-500' : node.memory > 60 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${node.memory}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Latency & Requests footer */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                <span className="font-mono">Latency: <strong className={node.latency > 500 ? 'text-rose-400' : 'text-slate-200'}>{node.latency}ms</strong></span>
                <span className="font-mono">{node.reqRate} req/s</span>
              </div>

              {/* Dependency Links */}
              {node.dependencies.length > 0 && (
                <div className="mt-2 text-[10px] text-slate-500 flex items-center space-x-1">
                  <span>Connects to:</span>
                  <span className="font-mono text-slate-400 truncate max-w-[140px]">
                    {node.dependencies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
