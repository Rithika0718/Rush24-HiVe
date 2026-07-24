import React from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { CloudIntegration } from '../types';

interface CloudProvidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: CloudIntegration[];
  onToggleIntegration: (providerName: string) => void;
}

export const CloudProvidersModal: React.FC<CloudProvidersModalProps> = ({
  isOpen,
  onClose,
  integrations,
  onToggleIntegration,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">Multi-Cloud Provider Connectors</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-400">
            AetherOps continuously pulls metric streams, audit logs, and pod states from connected cloud accounts. Toggle accounts or verify IAM role permissions.
          </p>

          <div className="space-y-3">
            {integrations.map((item) => (
              <div
                key={item.provider}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-100">{item.name}</span>
                    {item.connected ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 mr-0.5" /> Connected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 rounded">
                        Disconnected
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center space-x-3 text-xs text-slate-400 font-mono">
                    <span>Region: {item.region}</span>
                    <span>Resources: {item.resourceCount} Active</span>
                    <span>Last Sync: {item.lastSync}</span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleIntegration(item.provider)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    item.connected
                      ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-800'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                  }`}
                >
                  {item.connected ? 'Disconnect' : 'Connect Account'}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <span className="font-bold text-slate-200 flex items-center">
              <ShieldCheck className="w-4 h-4 text-cyan-400 mr-1.5" /> Security & Least Privilege
            </span>
            <p>
              AetherOps connects using cross-account IAM Roles with read-only CloudWatch/Stackdriver permissions and scoped Kubernetes ServiceAccounts (`/api/v1/namespaces/production`).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
