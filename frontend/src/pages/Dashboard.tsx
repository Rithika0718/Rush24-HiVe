import React, { useState } from 'react';
import { SimulationState } from '../types';
import HealthCards from '../components/HealthCards';
import DigitalTwin from '../components/DigitalTwin';
import DebatePanel from '../components/DebatePanel';
import Timeline from '../components/Timeline';
import RcaPanel from '../components/RcaPanel';
import AlertsList from '../components/AlertsList';
import TelemetryCharts from '../components/TelemetryCharts';
import { Activity, ShieldAlert, FileText, Bell, Terminal } from 'lucide-react';

interface DashboardProps {
  state: SimulationState;
}

export default function Dashboard({ state }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'debate' | 'timeline' | 'rca' | 'alerts'>('debate');


  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-bg">
      {/* Cloud Health Metrics Grid */}
      <HealthCards services={state.services} />

      {/* Observability Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Twin Visualizer & Telemetry Charts */}
        <div className="xl:col-span-7 space-y-6">
          <DigitalTwin 
            nodes={state.dependency_graph.nodes} 
            edges={state.dependency_graph.edges} 
          />
          <TelemetryCharts 
            metricsHistory={state.metrics_history} 
            services={state.services} 
          />
        </div>

        {/* Right Side: Tabbed War Room Panel */}
        <div className="xl:col-span-5 flex flex-col h-full bg-dark-panel border border-dark-border rounded-xl overflow-hidden min-h-[580px]">
          {/* Tab Selector */}
          <div className="flex border-b border-dark-border bg-[#0e1423]/70 shrink-0 font-mono text-[10px] uppercase font-bold tracking-wider">
            <button
              onClick={() => setActiveTab('debate')}
              className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'debate'
                  ? 'border-brand-500 text-slate-100 bg-dark-panel/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity size={12} />
              AI Debate
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'timeline'
                  ? 'border-brand-500 text-slate-100 bg-dark-panel/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal size={12} />
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('rca')}
              className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'rca'
                  ? 'border-brand-500 text-slate-100 bg-dark-panel/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText size={12} />
              RCA Report
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'alerts'
                  ? 'border-brand-500 text-slate-100 bg-dark-panel/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell size={12} />
              Alerts
            </button>
          </div>

          {/* Active Tab Screen */}
          <div className="flex-1 min-h-0 bg-dark-panel">
            {activeTab === 'debate' && <DebatePanel debateLog={state.debate_log} />}
            {activeTab === 'timeline' && <Timeline timeline={state.timeline} />}
            {activeTab === 'rca' && <RcaPanel rca={state.rca} />}
            {activeTab === 'alerts' && <AlertsList alerts={state.alerts} />}
          </div>
        </div>
      </div>
    </div>
  );
}
