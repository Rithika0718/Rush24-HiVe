import React from "react";
import { motion } from "motion/react";
import {
  Scale,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  Zap,
  Award,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { IncidentState } from "../types";

interface ConsensusPanelProps {
  trace: IncidentState | null;
}

export const ConsensusPanel: React.FC<ConsensusPanelProps> = ({ trace }) => {
  const consensus = trace?.consensus_decision;
  const candidates = consensus?.ranking_matrix || [
    {
      option_id: "opt_restart",
      action: "restart",
      label: "Restart Service / Container",
      resolution_confidence: "98%",
      risk_score: "3/10",
      cost_usd: "$0.00",
      calculated_utility: 35.0,
    },
    {
      option_id: "opt_scale_up",
      action: "scale_up",
      label: "Scale Up Compute / Replicas",
      resolution_confidence: "82%",
      risk_score: "2/10",
      cost_usd: "$45.00",
      calculated_utility: 18.2,
    },
    {
      option_id: "opt_flush_cache",
      action: "flush_cache",
      label: "Flush Session & Query Cache",
      resolution_confidence: "65%",
      risk_score: "6/10",
      cost_usd: "$0.00",
      calculated_utility: 12.0,
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-md text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Multi-Agent Consensus & Utility Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent side-by-side evaluation combining Resource, Cost (FinOps), and Risk (SRE) agent proposals.
            </p>
          </div>
        </div>

        {consensus && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Winner: {consensus.selected_label}</span>
          </div>
        )}
      </div>

      {/* Formula explanation banner */}
      <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Utility Mathematical Objective Function
            </span>
            <code className="text-xs text-indigo-300 font-mono">
              Utility = (Resolution Confidence % × 0.50) - (SRE Risk × 3.0) - (FinOps Cost Score × 2.0)
            </code>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
          Target Service: <span className="text-amber-400 font-bold">{trace?.affected_service || "orders-db"}</span>
        </div>
      </div>

      {/* Side-by-side options comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {candidates.map((cand, index) => {
          const isWinner = index === 0;

          return (
            <motion.div
              key={cand.option_id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-xl border p-5 flex flex-col justify-between transition-all ${
                isWinner
                  ? "bg-slate-900/95 border-emerald-500/70 shadow-xl shadow-emerald-950/40 ring-2 ring-emerald-500/30"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80"
              }`}
            >
              {isWinner && (
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CONSENSUS WINNER
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Option #{index + 1}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isWinner ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Utility: {cand.calculated_utility}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-4">{cand.label}</h3>

                {/* Score breakdown metrics */}
                <div className="space-y-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Confidence
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {cand.resolution_confidence}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> SRE Operational Risk
                    </span>
                    <span className="font-mono font-bold text-rose-300">
                      {cand.risk_score}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> FinOps Cost ($)
                    </span>
                    <span className="font-mono font-bold text-white">
                      {cand.cost_usd}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rationale explanation footer */}
              {isWinner && consensus?.consensus_rationale && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-200 mt-2">
                  <strong className="block text-emerald-400 mb-1">Consensus Rationale:</strong>
                  {consensus.consensus_rationale}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
