import React from 'react';
import { LayoutDashboard, Radio, Cpu, Settings, AlertTriangle, ShieldAlert, BookOpen } from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  setSection: (section: string) => void;
}

export default function Sidebar({ currentSection, setSection }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Observability', icon: LayoutDashboard },
    { id: 'chaos', label: 'Chaos Lab', icon: Radio },
    { id: 'debate', label: 'Debate Engine', icon: ShieldAlert },
    { id: 'timeline', label: 'Timeline log', icon: AlertTriangle },
  ];

  return (
    <aside className="w-64 bg-dark-panel border-r border-dark-border flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-dark-border flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-white text-lg shadow-lg">
            H
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-dark-panel"></div>
        </div>
        <div>
          <h1 className="font-semibold text-slate-100 tracking-wide font-mono text-sm">HIVE Nebula</h1>
          <p className="text-[10px] text-slate-400 font-mono">Incident Commander v1.0</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover border border-transparent'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-brand-500' : 'text-slate-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-border bg-[#0e1423]/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-hover/40 border border-dark-border/40">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs text-slate-300 font-mono tracking-tight">Active Connection: OK</span>
        </div>
      </div>
    </aside>
  );
}
