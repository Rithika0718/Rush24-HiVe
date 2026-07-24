import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, BarChart3 } from 'lucide-react';
import { MetricPoint, ServiceNode } from '../types';

interface TelemetryChartsProps {
  metricsHistory: Record<string, MetricPoint[]>;
  services: Record<string, ServiceNode>;
}

export default function TelemetryCharts({ metricsHistory, services }: TelemetryChartsProps) {
  const serviceList = Object.values(services);
  const [selectedServiceId, setSelectedServiceId] = useState('gateway');

  const chartData = metricsHistory[selectedServiceId] || [];

  return (
    <div className="bg-dark-panel border border-dark-border rounded-xl p-5 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-2">
        <div>
          <h3 className="font-mono text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 size={16} className="text-brand-500" />
            Telemetry Metrics Explorer
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">Time-series history analysis logs</p>
        </div>

        {/* Selector */}
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="bg-dark-bg border border-dark-border rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-200 outline-none hover:border-slate-500 focus:border-brand-500"
        >
          {serviceList.map((svc) => (
            <option key={svc.id} value={svc.id}>
              {svc.label}
            </option>
          ))}
        </select>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <p className="text-xs text-slate-400 font-mono">No metrics history loaded.</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[220px]">
          {/* Chart 1: CPU & Memory */}
          <div className="flex flex-col h-full bg-[#080d1a]/30 rounded-lg p-3 border border-dark-border/40">
            <span className="text-[10px] text-slate-400 font-mono font-medium mb-3 block uppercase">Resource Utilization (CPU &amp; RAM)</span>
            <div className="flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2E4D" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} domain={[0, 100]} unit="%" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151D30', borderColor: '#22304E', fontSize: 10, fontFamily: 'monospace' }}
                    labelStyle={{ color: '#94A3B8' }}
                  />
                  <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                  <Area name="CPU Load" type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCpu)" />
                  <Area name="RAM Usage" type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorMem)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Latency */}
          <div className="flex flex-col h-full bg-[#080d1a]/30 rounded-lg p-3 border border-dark-border/40">
            <span className="text-[10px] text-slate-400 font-mono font-medium mb-3 block uppercase">Response Latency Profile</span>
            <div className="flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2E4D" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151D30', borderColor: '#22304E', fontSize: 10, fontFamily: 'monospace' }}
                    labelStyle={{ color: '#94A3B8' }}
                  />
                  <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                  <Area name="Latency (ms)" type="monotone" dataKey="latency" stroke="#ec4899" strokeWidth={1.5} fillOpacity={1} fill="url(#colorLatency)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
