import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, Cpu, Database, Terminal } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: Activity, badge: 'Summary' },
    { id: 'attacks', label: 'Attack Explorer', icon: ShieldAlert, badge: '20 Attacks' },
    { id: 'defenses', label: 'Defense Explorer', icon: ShieldCheck, badge: '20 Defenses' },
    { id: 'livelab', label: 'Interactive Live Lab', icon: Terminal, badge: 'Live Demo' }
  ];

  return (
    <header className="sticky top-0 z-50 cyber-glass border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between min-h-[64px] py-2 gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-500/30 text-emerald-400">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">ADVERSARIAL ML LAB</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold hidden sm:inline-block">
                  Smart Agriculture
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono whitespace-nowrap">CIA Demonstration & Defense Suite</p>
            </div>
          </div>

          {/* Navigation Tabs (Scrollable on small screens, non-wrapping) */}
          <nav className="flex items-center space-x-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-700/50' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* System Telemetry Badges (Shown on larger screens) */}
          <div className="hidden xl:flex items-center space-x-2 text-xs font-mono shrink-0">
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>3 Modalities</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>4 Classifiers + CNN</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
