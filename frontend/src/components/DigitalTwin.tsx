import React from 'react';
import { Database, Server, Cpu, Activity, Network, Key, ShoppingCart, Globe, HardDrive } from 'lucide-react';
import { ServiceNode, DependencyEdge } from '../types';

interface DigitalTwinProps {
  nodes: ServiceNode[];
  edges: DependencyEdge[];
}

const COORDINATES: Record<string, { x: number; y: number }> = {
  gateway: { x: 400, y: 40 },
  auth_service: { x: 200, y: 150 },
  auth_db: { x: 100, y: 280 },
  catalog_service: { x: 400, y: 150 },
  catalog_db: { x: 300, y: 280 },
  recommend_cache: { x: 500, y: 280 },
  order_service: { x: 600, y: 150 },
  order_db: { x: 580, y: 280 },
  payment_service: { x: 720, y: 280 },
  payment_gateway: { x: 720, y: 375 },
};

export default function DigitalTwin({ nodes, edges }: DigitalTwinProps) {
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'gateway': return <Network size={16} className="text-blue-400" />;
      case 'database': return <Database size={16} className="text-emerald-400" />;
      case 'cache': return <HardDrive size={16} className="text-cyan-400" />;
      case 'external': return <Globe size={16} className="text-purple-400" />;
      default: return <Server size={16} className="text-indigo-400" />;
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'border-emerald-500/30 bg-emerald-500/5 glow-healthy text-emerald-400';
      case 'WARNING': return 'border-amber-500/30 bg-amber-500/5 glow-warning text-amber-400';
      case 'CRITICAL': return 'border-rose-500/40 bg-rose-500/5 glow-critical text-rose-400';
      default: return 'border-slate-800 bg-slate-900/40 text-slate-400';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />;
      case 'WARNING': return <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />;
      case 'CRITICAL': return <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />;
    }
  };

  return (
    <div className="bg-dark-panel border border-dark-border rounded-xl p-6 relative overflow-hidden flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-mono text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
            <Activity size={16} className="text-brand-500" />
            Cloud Digital Twin &amp; Cascade Map
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">Real-time cascading telemetry analysis</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-slate-400">Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span className="text-slate-400">Critical Failure</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 min-h-[380px] bg-[#080d1a]/50 rounded-lg border border-dark-border/40 overflow-auto">
        <svg viewBox="0 0 820 420" className="w-full h-full min-w-[800px]" style={{ overflow: 'visible' }}>
          <defs>
            {/* Arrow Marker */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#1F2E4D" />
            </marker>
            <marker
              id="arrow-cascade"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
            </marker>
          </defs>

          {/* Connection Lines (Edges) */}
          {edges.map((edge) => {
            const start = COORDINATES[edge.source];
            const end = COORDINATES[edge.target];
            if (!start || !end) return null;

            // Find telemetry of source and target to decide path color
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            const isCascade = 
              sourceNode && targetNode && 
              sourceNode.telemetry.status !== 'HEALTHY' && 
              targetNode.telemetry.status !== 'HEALTHY';

            return (
              <g key={edge.id}>
                {/* Background thicker wire */}
                <path
                  d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                  stroke={isCascade ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 48, 78, 0.4)'}
                  strokeWidth="4"
                  fill="none"
                />
                {/* Flowing animated signal wire */}
                <path
                  d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                  stroke={isCascade ? '#EF4444' : '#1e2e4f'}
                  strokeWidth="1.5"
                  strokeDasharray={isCascade ? '4,4' : 'none'}
                  strokeDashoffset={isCascade ? '2' : '0'}
                  className={isCascade ? 'animate-flow' : ''}
                  fill="none"
                  markerEnd={isCascade ? 'url(#arrow-cascade)' : 'url(#arrow)'}
                />
              </g>
            );
          })}

          {/* ForeignObject Nodes */}
          {nodes.map((node) => {
            const coord = COORDINATES[node.id];
            if (!coord) return null;

            const width = 160;
            const height = 65;
            // Center the node rectangle on the coordinate
            const x = coord.x - width / 2;
            const y = coord.y - height / 2;

            return (
              <foreignObject
                key={node.id}
                x={x}
                y={y}
                width={width}
                height={height}
                className="overflow-visible"
              >
                <div 
                  className={`w-full h-full p-2.5 rounded-lg border flex flex-col justify-between transition-all select-none duration-300 backdrop-blur-sm ${getNodeColor(node.telemetry.status)}`}
                >
                  {/* Node Title & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {getRoleIcon(node.role)}
                      <span className="font-semibold text-[10px] tracking-tight font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                        {node.label}
                      </span>
                    </div>
                    {getStatusIndicator(node.telemetry.status)}
                  </div>

                  {/* Telemetry Stats */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
                    <div className="flex items-center gap-0.5">
                      <span>CPU:</span>
                      <span className="text-slate-300 font-semibold">{node.telemetry.cpu.toFixed(0)}%</span>
                    </div>
                    {node.role !== 'external' && (
                      <div className="flex items-center gap-0.5">
                        <span>LAT:</span>
                        <span className="text-slate-300 font-semibold">
                          {node.telemetry.latency > 1000 
                            ? `${(node.telemetry.latency / 1000).toFixed(1)}s` 
                            : `${node.telemetry.latency.toFixed(0)}ms`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>

      <style>{`
        @keyframes flow-effect {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-flow {
          animation: flow-effect 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}
