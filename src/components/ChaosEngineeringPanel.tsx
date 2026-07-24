import React, { useState } from 'react';
import { X, Flame, Zap, ShieldAlert, Play, PlusCircle } from 'lucide-react';
import { ChaosScenario, CloudIncident } from '../types';
import { CHAOS_SCENARIOS } from '../data/mockData';

interface ChaosEngineeringPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectScenario: (scenario: ChaosScenario) => void;
  onInjectCustomPrompt: (promptText: string) => void;
}

export const ChaosEngineeringPanel: React.FC<ChaosEngineeringPanelProps> = ({
  isOpen,
  onClose,
  onInjectScenario,
  onInjectCustomPrompt,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    onInjectCustomPrompt(customPrompt);
    setCustomPrompt('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
            <h2 className="text-base font-bold text-slate-100">Chaos Engineering & Incident Simulator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <p className="text-xs text-slate-400">
            Inject realistic cloud infrastructure failures into the live telemetry stream to test how AetherOps collaborative AI agents detect, analyze, and execute self-healing remediations.
          </p>

          {/* Pre-configured Chaos Scenarios */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Pre-built Incident Scenarios
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHAOS_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-700/60 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                        {scenario.provider}
                      </span>
                      <span className="text-[10px] font-bold text-rose-400">
                        {scenario.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-100 group-hover:text-amber-300 transition-colors">
                      {scenario.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {scenario.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onInjectScenario(scenario);
                      onClose();
                    }}
                    className="w-full py-1.5 text-xs font-semibold bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-rose-100 rounded-lg transition-all flex items-center justify-center space-x-1"
                  >
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>Trigger Scenario</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Incident Prompt Generator */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <PlusCircle className="w-4 h-4 text-cyan-400 mr-1.5" /> Inject Custom Incident Prompt
            </h3>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <textarea
                rows={3}
                placeholder="E.g., High Kafka consumer group lag on auth-events topic causing payment webhook timeouts on GCP..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!customPrompt.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Generate AI Incident</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
