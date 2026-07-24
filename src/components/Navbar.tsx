import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Zap, 
  Layers, 
  Cpu, 
  Flame, 
  Bot, 
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { CloudIncident } from '../types';

interface NavbarProps {
  activeIncidentsCount: number;
  autonomousMode: boolean;
  setAutonomousMode: (val: boolean) => void;
  onOpenProviders: () => void;
  onOpenChaos: () => void;
  onOpenTerminal: () => void;
  onOpenChat: () => void;
  activeView: 'dashboard' | 'topology' | 'incidents' | 'terminal';
  setActiveView: (view: 'dashboard' | 'topology' | 'incidents' | 'terminal') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeIncidentsCount,
  autonomousMode,
  setAutonomousMode,
  onOpenProviders,
  onOpenChaos,
  onOpenTerminal,
  onOpenChat,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                  AetherOps AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Swarm v3.6
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Autonomous Cloud Incident Resolution</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                activeView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => setActiveView('topology')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                activeView === 'topology'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Service Topology</span>
            </button>

            <button
              onClick={() => setActiveView('incidents')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                activeView === 'incidents'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Incidents</span>
              {activeIncidentsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-600 text-white rounded-full">
                  {activeIncidentsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('terminal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                activeView === 'terminal'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Agent Swarm Stream</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Autonomous Mode Switch */}
            <div className="hidden lg:flex items-center bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-medium">Auto-Healing:</span>
                <button
                  onClick={() => setAutonomousMode(!autonomousMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    autonomousMode ? 'bg-emerald-500' : 'bg-amber-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      autonomousMode ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`font-semibold ${autonomousMode ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {autonomousMode ? 'Autonomous' : 'Human Approval'}
                </span>
              </div>
            </div>

            {/* Cloud Integrations Button */}
            <button
              onClick={onOpenProviders}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="hidden sm:inline">Cloud Connectors</span>
            </button>

            {/* Chaos Injection Button */}
            <button
              onClick={onOpenChaos}
              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-rose-100 rounded-xl border border-rose-700/50 shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span className="hidden sm:inline font-semibold">Inject Incident</span>
            </button>

            {/* AI Assistant Chat Trigger */}
            <button
              onClick={onOpenChat}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
              title="Open AI Command Assistant"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
