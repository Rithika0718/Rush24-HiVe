import React from "react";
import { motion } from "motion/react";
import {
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Download,
} from "lucide-react";
import { IncidentState } from "../types";

interface RootCauseReportPanelProps {
  trace: IncidentState | null;
}

export const RootCauseReportPanel: React.FC<RootCauseReportPanelProps> = ({ trace }) => {
  const [copied, setCopied] = React.useState(false);
  const report = trace?.final_report;
  const targetService = trace?.affected_service || "orders-db";

  const handleCopy = () => {
    if (report?.report_markdown) {
      navigator.clipboard.writeText(report.report_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-md text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                SRE Post-Mortem Incident Report
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-400" /> Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated post-mortem report synthesized by the Reporter Agent following resolution.
            </p>
          </div>
        </div>

        {report && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Post-Mortem</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Service Health Transition Banner */}
      <div className="mt-6 p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-mono">Incident Recovery State Transition:</span>
            <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" /> CRITICAL
              </span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </motion.div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> HEALTHY (RESTORED)
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
          Target Service: <span className="text-emerald-400 font-bold">{targetService}</span>
        </div>
      </div>

      {/* Report Markdown View */}
      {!report ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No post-mortem report generated yet. Run the multi-agent commander to view the synthesized report.
        </div>
      ) : (
        <div className="mt-6 bg-slate-950/90 border border-slate-800 rounded-xl p-6 font-mono text-xs text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <span className="text-teal-400 font-bold">{report.title}</span>
            <span className="text-[10px] text-slate-500">
              Generated: {new Date(report.generated_at).toLocaleTimeString()}
            </span>
          </div>

          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            {report.report_markdown}
          </pre>
        </div>
      )}
    </div>
  );
};
