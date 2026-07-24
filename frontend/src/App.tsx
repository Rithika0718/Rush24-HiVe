import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import { SimulationState } from './types';
import { injectChaos, resetSimulation, fetchSimulationState } from './services/api';
import DebatePanel from './components/DebatePanel';
import Timeline from './components/Timeline';
import RcaPanel from './components/RcaPanel';
import AlertsList from './components/AlertsList';
import { Radio, RefreshCw, Zap, AlertOctagon } from 'lucide-react';

export default function App() {
  const [section, setSection] = useState('dashboard');
  const [overallStatus, setOverallStatus] = useState<'HEALTHY' | 'DEGRADED' | 'CRITICAL'>('HEALTHY');
  const [state, setState] = useState<SimulationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll state every 3 seconds on mount
  useEffect(() => {
    let active = true;
    async function loadState() {
      try {
        const data = await fetchSimulationState();
        if (active) {
          setState(data);
          setOverallStatus(data.overall_status);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error(err);
          setError('Failed to connect to HIVE Nebula simulation backend. Ensure the server is running on port 8000.');
        }
      }
    }

    loadState();
    const interval = setInterval(loadState, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleInjectChaos = async (scenario: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await injectChaos(scenario);
      setState(data);
      setOverallStatus(data.overall_status);
    } catch (err) {
      console.error(err);
      setError('Failed to inject simulated infrastructure chaos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resetSimulation();
      setState(data);
      setOverallStatus(data.overall_status);
    } catch (err) {
      console.error(err);
      setError('Failed to reset system digital twin simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (error && !state) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-dark-bg">
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center max-w-md">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon size={24} className="text-rose-500 animate-bounce" />
            </div>
            <h3 className="text-lg font-semibold font-mono text-slate-100 mb-2">Connection Outage</h3>
            <p className="text-sm text-slate-400 font-sans leading-relaxed mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold rounded-lg font-mono text-white transition-all shadow-md shadow-rose-950/20"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    if (!state) {
      return (
        <div className="flex-1 flex items-center justify-center bg-dark-bg text-slate-400 font-mono text-xs">
          <RefreshCw className="animate-spin text-brand-500 mr-2" size={16} />
          Connecting to Nebula telemetry systems...
        </div>
      );
    }

    switch (section) {
      case 'dashboard':
        return (
          <Dashboard state={state} />
        );
      case 'chaos':
        return (
          <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-dark-bg">
            <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
              <h2 className="font-mono text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2 mb-2">
                <Radio size={16} className="text-brand-500" />
                Nebula Chaos Experimentation Lab
              </h2>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mb-6">
                Trigger manual infrastructure failures on the digital twin environment to validate HIVE AI automated recovery runbooks.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Experiment 1 */}
                <div className="p-4 rounded-xl border border-dark-border bg-dark-hover flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-brand-500 font-semibold uppercase block mb-1">Scenario #01</span>
                    <h3 className="text-xs font-bold font-mono text-slate-200 mb-2">Database Thread Contention</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-4">
                      Simulate high query contention and CPU exhaustion on auth_db. Verify upstream latency propagation on Auth Service and Gateway API.
                    </p>
                  </div>
                  <button
                    disabled={isLoading || overallStatus !== 'HEALTHY'}
                    onClick={() => {
                      handleInjectChaos('DB_LATENCY_SPIKE');
                      setSection('dashboard');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 text-xs font-semibold py-2 rounded-lg font-mono disabled:opacity-50 transition-all"
                  >
                    <Zap size={12} />
                    Inject DB Contention
                  </button>
                </div>

                {/* Experiment 2 */}
                <div className="p-4 rounded-xl border border-dark-border bg-dark-hover flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-brand-500 font-semibold uppercase block mb-1">Scenario #02</span>
                    <h3 className="text-xs font-bold font-mono text-slate-200 mb-2">JVM Heap Memory Leak</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-4">
                      Simulate a memory leak in catalog_service. Watch RAM usage hit maximum capacity and trigger garbage collection pauses resulting in HTTP gateway 5xx timeouts.
                    </p>
                  </div>
                  <button
                    disabled={isLoading || overallStatus !== 'HEALTHY'}
                    onClick={() => {
                      handleInjectChaos('MEMORY_LEAK');
                      setSection('dashboard');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 text-xs font-semibold py-2 rounded-lg font-mono disabled:opacity-50 transition-all"
                  >
                    <Zap size={12} />
                    Inject Memory Leak
                  </button>
                </div>

                {/* Experiment 3 */}
                <div className="p-4 rounded-xl border border-dark-border bg-dark-hover flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-brand-500 font-semibold uppercase block mb-1">Scenario #03</span>
                    <h3 className="text-xs font-bold font-mono text-slate-200 mb-2">Egress Route Network Partition</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-4">
                      Isolate outgoing routes to external billing payment gateways. Verify socket timeouts cascade down order creation channels and disrupt checkout paths.
                    </p>
                  </div>
                  <button
                    disabled={isLoading || overallStatus !== 'HEALTHY'}
                    onClick={() => {
                      handleInjectChaos('NETWORK_PARTITION');
                      setSection('dashboard');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 text-xs font-semibold py-2 rounded-lg font-mono disabled:opacity-50 transition-all"
                  >
                    <Zap size={12} />
                    Inject Route Partition
                  </button>
                </div>
              </div>

              {overallStatus !== 'HEALTHY' && (
                <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/15 rounded-lg flex items-center gap-3">
                  <AlertOctagon className="text-amber-500 shrink-0" size={18} />
                  <div className="font-mono text-xs text-slate-300">
                    <span className="font-semibold text-slate-200">Simulation Active:</span> Reset the current digital twin node configuration before launching secondary chaos tasks.
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'debate':
        return (
          <div className="flex-1 p-6 overflow-y-auto bg-dark-bg min-h-[500px]">
            <DebatePanel debateLog={state.debate_log} />
          </div>
        );
      case 'timeline':
        return (
          <div className="flex-1 p-6 overflow-y-auto bg-dark-bg min-h-[500px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Timeline timeline={state.timeline} />
              <RcaPanel rca={state.rca} />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 p-6 text-slate-400 font-mono text-xs bg-dark-bg">
            404 Section Not Found
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-bg text-slate-200">
      {/* Sidebar Layout */}
      <Sidebar currentSection={section} setSection={setSection} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopNav 
          overallStatus={overallStatus} 
          onInjectChaos={handleInjectChaos} 
          onReset={handleReset} 
          isLoading={isLoading} 
        />
        
        {/* Active Route Content */}
        {renderContent()}
      </div>
    </div>
  );
}
