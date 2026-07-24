import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Activity, ShieldAlert, Cpu, HardDrive, Wifi } from 'lucide-react';

interface TelemetryPoint {
  time: string;
  cpu: number;
  memory: number;
  latency: number;
  errors: number;
}

export const TelemetryCharts: React.FC = () => {
  const [data, setData] = useState<TelemetryPoint[]>(() => {
    const points: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const timeStr = new Date(now - i * 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      points.push({
        time: timeStr,
        cpu: Math.floor(35 + Math.random() * 20 + (i === 3 ? 40 : 0)),
        memory: Math.floor(45 + Math.random() * 15 + (i === 3 ? 35 : 0)),
        latency: Math.floor(15 + Math.random() * 25 + (i === 3 ? 600 : 0)),
        errors: i === 3 ? 24.8 : Math.random() * 2,
      });
    }
    return points;
  });

  // Streaming real-time tick updates every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const lastPoint = prev[prev.length - 1];
        const newPoint: TelemetryPoint = {
          time: nextTime,
          cpu: Math.min(100, Math.max(20, Math.floor(lastPoint.cpu + (Math.random() * 12 - 6)))),
          memory: Math.min(100, Math.max(30, Math.floor(lastPoint.memory + (Math.random() * 8 - 4)))),
          latency: Math.min(2000, Math.max(8, Math.floor(lastPoint.latency + (Math.random() * 40 - 20)))),
          errors: parseFloat((Math.random() * 1.5).toFixed(1)),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* CPU & Memory Utilization Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Global Cluster CPU & Memory Load</h3>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 mr-1.5" /> CPU
            </span>
            <span className="flex items-center text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 mr-1.5" /> Memory
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
              <Area type="monotone" dataKey="memory" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMemory)" name="Memory %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latency & Error Rate Spikes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Downstream Latency & Error Rate</h3>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" /> Latency (ms)
            </span>
            <span className="flex items-center text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" /> Error Rate (%)
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 10 }} unit="ms" />
              <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fontSize: 10 }} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} name="Latency (ms)" />
              <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e' }} name="Error %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
