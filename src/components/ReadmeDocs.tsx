import React from "react";
import { BookOpen, Terminal, CheckCircle2, Cpu, Server, ShieldCheck } from "lucide-react";

export const ReadmeDocs: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6 text-slate-300 text-xs">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          HIVE Nebula — GCP Digital Twin Local Setup & Documentation
        </h2>
        <p className="text-slate-400 text-xs">
          Foundation Layer for Autonomous Multi-Agent Incident Commander (Hackathon Ready)
        </p>
      </div>

      {/* Quick Setup Commands */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          1. Running Python FastAPI Backend Locally
        </h3>
        <p className="text-slate-400">
          Install dependencies from <code className="text-cyan-300 font-mono">requirements.txt</code> and start the uvicorn server:
        </p>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-cyan-300 space-y-1">
          <div># 1. Install dependencies</div>
          <div>pip install -r requirements.txt</div>
          <div className="pt-1"># 2. Start FastAPI Digital Twin backend</div>
          <div>uvicorn main:app --host 0.0.0.0 --port 8000 --reload</div>
        </div>
      </div>

      {/* Architecture & Modeling */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
          <Server className="w-4 h-4 text-indigo-400" />
          2. Simulated GCP Infrastructure Model
        </h3>
        <p className="text-slate-400">
          The Digital Twin models 5 core GCP services with metrics (CPU %, Memory %, P95 Latency ms, Error Rate %) and directed dependency relationships:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-cyan-400 font-bold">1. api-gateway</span>
            <p className="text-slate-400 text-[10px]">Cloud Load Balancer / API Gateway</p>
            <p className="text-slate-500 text-[10px]">Depends on: auth-service, orders-db, payments-service</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-cyan-400 font-bold">2. auth-service</span>
            <p className="text-slate-400 text-[10px]">Cloud Run Container</p>
            <p className="text-slate-500 text-[10px]">Depends on: cache</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-cyan-400 font-bold">3. orders-db</span>
            <p className="text-slate-400 text-[10px]">Cloud SQL PostgreSQL Primary</p>
            <p className="text-slate-500 text-[10px]">Depends on: None (Root Data Storage)</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-cyan-400 font-bold">4. payments-service</span>
            <p className="text-slate-400 text-[10px]">GKE Microservice</p>
            <p className="text-slate-500 text-[10px]">Depends on: orders-db, cache</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 sm:col-span-2">
            <span className="text-cyan-400 font-bold">5. cache</span>
            <p className="text-slate-400 text-[10px]">Memorystore Redis Cluster</p>
            <p className="text-slate-500 text-[10px]">Depends on: None (Root Cache)</p>
          </div>
        </div>
      </div>

      {/* Incident Ripple Cascade Explanation */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-rose-400" />
          3. Failure Propagation & Recovery Logic
        </h3>
        <p className="text-slate-400">
          When an incident is injected via <code className="text-rose-300 font-mono">POST /inject-incident</code> (e.g. <code className="text-rose-300 font-mono">cpu_spike</code> on <code className="text-rose-300 font-mono">orders-db</code>):
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-400">
          <li>Target service status shifts to <span className="text-rose-400 font-bold">Critical</span> with spiked CPU (~98%) and latency (~480ms).</li>
          <li>Topological dependency pass evaluates upstream services: <span className="text-indigo-300 font-bold">payments-service</span> and <span className="text-cyan-300 font-bold">api-gateway</span> degrade automatically with elevated error rates and latency.</li>
          <li>Calling <code className="text-emerald-300 font-mono">POST /resolve-incident</code> (e.g. action: <code className="text-emerald-300 font-mono">restart</code>) restores healthy baseline metrics and recalculates dependency health back to <span className="text-emerald-400 font-bold">OPERATIONAL</span>.</li>
        </ul>
      </div>

      {/* Unit Tests */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          4. Running Unit Tests
        </h3>
        <p className="text-slate-400">Execute automated Python unittest suite:</p>
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-cyan-300 text-[11px]">
          python3 -m unittest test_main.py
        </div>
      </div>
    </div>
  );
};
