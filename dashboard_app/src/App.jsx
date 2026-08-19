import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import AttackExplorer from './components/AttackExplorer';
import DefenseExplorer from './components/DefenseExplorer';
import LiveLab from './components/LiveLab';
import { Shield, ExternalLink, Github, Terminal, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [targetAttackId, setTargetAttackId] = useState(1);
  const [targetDefenseId, setTargetDefenseId] = useState(1);
  
  const [liveLabSandbox, setLiveLabSandbox] = useState('numerical');
  const [liveLabAttackType, setLiveLabAttackType] = useState('drift');

  // Jump handlers
  const handleSelectAttack = (attackId) => {
    setTargetAttackId(attackId);
    setActiveTab('attacks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDefense = (defenseId) => {
    setTargetDefenseId(defenseId);
    setActiveTab('defenses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAttack = (attackId) => {
    setTargetAttackId(attackId);
    setActiveTab('attacks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToLiveLab = (sandbox, attackType) => {
    setLiveLabSandbox(sandbox);
    if (attackType) setLiveLabAttackType(attackType);
    setActiveTab('livelab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-100 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <Overview 
            onSelectAttack={handleSelectAttack} 
            onNavigateToLiveLab={handleNavigateToLiveLab}
          />
        )}

        {activeTab === 'attacks' && (
          <AttackExplorer 
            initialAttackId={targetAttackId} 
            onNavigateToDefense={handleNavigateToDefense}
          />
        )}

        {activeTab === 'defenses' && (
          <DefenseExplorer 
            initialDefenseId={targetDefenseId} 
            onNavigateToAttack={handleNavigateToAttack}
          />
        )}

        {activeTab === 'livelab' && (
          <LiveLab 
            initialSandbox={liveLabSandbox}
            initialAttackType={liveLabAttackType}
          />
        )}
      </main>

      {/* Modern Cyber Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-300 font-semibold">CIA 3 Adversarial ML Defense Control Center</span>
            <span>•</span>
            <span>Tejas R M (2548560)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Notebook Source of Truth (.ipynb)
            </span>
            <span>•</span>
            <span>FastAPI Live Model Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
