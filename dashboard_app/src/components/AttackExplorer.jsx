import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, ArrowRight, Search, Filter, Cpu, 
  Layers, AlertOctagon, CheckCircle2, XCircle, Info, Image as ImageIcon, 
  FileText, Hash, ExternalLink
} from 'lucide-react';
import labData from '../data/adversarial_lab_data.json';

export default function AttackExplorer({ initialAttackId, onNavigateToDefense }) {
  const [selectedAttackId, setSelectedAttackId] = useState(initialAttackId || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModality, setFilterModality] = useState('ALL');
  const [filterStage, setFilterStage] = useState('ALL');

  useEffect(() => {
    if (initialAttackId) {
      setSelectedAttackId(initialAttackId);
    }
  }, [initialAttackId]);

  const filteredAttacks = labData.filter(item => {
    const matchesSearch = item.attack_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.target_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.attacker_manipulates.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = filterModality === 'ALL' || item.modality.toUpperCase() === filterModality;
    let matchesStage = true;
    if (filterStage === 'EVASION') matchesStage = item.attack_category.includes('Evasion');
    if (filterStage === 'POISONING') matchesStage = item.attack_category.includes('Poisoning');
    return matchesSearch && matchesModality && matchesStage;
  });

  const selectedItem = labData.find(d => d.id === selectedAttackId) || labData[0];
  const demo = selectedItem.demo || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      {/* Left Sidebar: Attack Catalog (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input 
              type="text"
              placeholder="Search 20 attacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterModality}
              onChange={(e) => setFilterModality(e.target.value)}
              className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Modalities</option>
              <option value="NUMERICAL">Numerical</option>
              <option value="TEXT">Text</option>
              <option value="IMAGE">Image</option>
            </select>

            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Stages</option>
              <option value="EVASION">Evasion</option>
              <option value="POISONING">Poisoning</option>
            </select>
          </div>
        </div>

        {/* Attack Scrollable List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/80 max-h-[700px] overflow-y-auto">
          {filteredAttacks.map(item => {
            const isSelected = item.id === selectedAttackId;
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedAttackId(item.id)}
                className={`p-3.5 cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-slate-800/90 border-l-4 border-emerald-500 shadow-md' 
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">Attack #{item.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    item.modality === 'Numerical' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                    item.modality === 'Text' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                    'bg-purple-950 text-purple-400 border border-purple-900'
                  }`}>
                    {item.modality}
                  </span>
                </div>
                <h4 className={`text-sm font-semibold mt-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {item.attack_name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{item.attack_category.includes('Poisoning') ? 'Poisoning' : 'Evasion'}</span>
                  {item.attack_success_rate !== null && (
                    <span className="font-mono text-amber-400">ASR: {(item.attack_success_rate * 100).toFixed(1)}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Comprehensive Attack Inspector (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Main Attack Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-red-950 text-red-400 border border-red-800 text-xs font-mono font-bold">
                  Attack #{selectedItem.id}
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                  {selectedItem.attack_category}
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                  Complexity: {selectedItem.complexity}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-2">
                {selectedItem.attack_name}
              </h2>
            </div>

            {/* Jump to Defense Button */}
            <button
              onClick={() => onNavigateToDefense(selectedItem.id)}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-medium transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Paired Defense #{selectedItem.id}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description & Target Models */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="md:col-span-2 bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 font-semibold block mb-1">Attacker Capability & Vector:</span>
              <p className="text-slate-200 leading-relaxed">{selectedItem.attacker_manipulates}</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1 font-mono">
              <span className="text-slate-400 font-semibold block mb-1">Target Infrastructure:</span>
              <div className="text-slate-200">Model: <strong className="text-cyan-400">{selectedItem.target_model}</strong></div>
              <div className="text-slate-200">Modality: <strong className="text-amber-400">{selectedItem.modality}</strong></div>
            </div>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Clean Accuracy</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {(selectedItem.clean_accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Attacked Accuracy</div>
              <div className="text-base font-bold font-mono text-red-400 mt-0.5">
                {(selectedItem.attacked_accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Accuracy Drop</div>
              <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                {selectedItem.accuracy_drop !== null ? `${(selectedItem.accuracy_drop * 100).toFixed(1)}%` : '—'}
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Attack Success (ASR)</div>
              <div className="text-base font-bold font-mono text-red-400 mt-0.5">
                {selectedItem.attack_success_rate !== null ? `${(selectedItem.attack_success_rate * 100).toFixed(1)}%` : 'N/A (Poisoning)'}
              </div>
            </div>
          </div>
        </div>

        {/* Concrete Empirical Demonstration (Before -> Attacked -> Defended) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Concrete Empirical Demonstration: Original → Attacked → Defended
            </h3>
            <span className="text-xs font-mono text-slate-400">{demo.sample_name || `Sample ID #${selectedItem.id}`}</span>
          </div>

          {/* 1. Numerical Demo Component */}
          {selectedItem.modality === 'Numerical' && demo.original_values && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Sensor Feature</th>
                      <th className="py-2.5 px-3 text-emerald-400">Original (Clean)</th>
                      <th className="py-2.5 px-3 text-red-400">Attacked (Perturbed)</th>
                      <th className="py-2.5 px-3 text-cyan-400">Defended (Sanitized)</th>
                      <th className="py-2.5 px-3">Delta / Perturbation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {demo.features.map(f => {
                      const orig = demo.original_values[f];
                      const att = demo.attacked_values[f];
                      const def = demo.defended_values[f];
                      const delta = +(att - orig).toFixed(2);
                      const isPerturbed = delta !== 0;

                      return (
                        <tr key={f} className={isPerturbed ? 'bg-red-950/20' : ''}>
                          <td className="py-2.5 px-3 font-semibold text-slate-300">{f}</td>
                          <td className="py-2.5 px-3 text-slate-200">{orig}</td>
                          <td className="py-2.5 px-3 text-red-300 font-bold">{att}</td>
                          <td className="py-2.5 px-3 text-cyan-300">{def}</td>
                          <td className="py-2.5 px-3 font-mono">
                            {isPerturbed ? (
                              <span className="text-amber-400">{delta > 0 ? `+${delta}` : delta}</span>
                            ) : (
                              <span className="text-slate-600">0.00</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Predictions 3-Box Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/60">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 block font-semibold">1. Original Prediction</span>
                  <div className="text-sm font-bold text-white font-mono mt-1">{demo.original_prediction}</div>
                  <span className="text-[10px] text-slate-400">Ground Truth Correct</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-red-900/60">
                  <span className="text-[10px] uppercase font-mono text-red-400 block font-semibold">2. Attacked Prediction</span>
                  <div className="text-sm font-bold text-red-300 font-mono mt-1">{demo.attacked_prediction}</div>
                  <span className="text-[10px] text-red-400/80 font-mono">Misclassification Triggered</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-cyan-900/60">
                  <span className="text-[10px] uppercase font-mono text-cyan-400 block font-semibold">3. Defended Decision</span>
                  <div className="text-sm font-bold text-cyan-300 font-mono mt-1">{demo.defended_prediction}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{demo.defense_action}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Poisoning Audit Demo Component */}
          {demo.demo_type === 'poisoning' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Training Set Integrity Audit:</span>
                  <span className="text-xs font-mono text-amber-400">{demo.sample_name}</span>
                </div>
                <p className="text-xs text-slate-300">{demo.audit_summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs pt-2">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Clean Label / Baseline:</span>
                    <strong className="text-emerald-400">{demo.clean_label || demo.original_prediction}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Poisoned Injected State:</span>
                    <strong className="text-red-400">{demo.poisoned_label || demo.attacked_prediction}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Defense Audit Action:</span>
                    <strong className="text-cyan-400">{demo.defense_action}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Text Demo Component */}
          {selectedItem.modality === 'Text' && (
            <div className="space-y-4">
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-400 font-bold uppercase">Original Query:</span>
                    <span className="text-slate-400 font-semibold">Pred: <strong className="text-emerald-300">{demo.original_prediction}</strong></span>
                  </div>
                  <p className="text-slate-200 font-sans text-sm font-medium">"{demo.original_text}"</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-red-950/80 bg-red-950/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-400 font-bold uppercase">Attacked Query:</span>
                    <span className="text-red-400 font-semibold">Pred: <strong className="text-red-300">{demo.attacked_prediction}</strong></span>
                  </div>
                  <p className="text-slate-200 font-sans text-sm font-medium">"{demo.attacked_text}"</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-950/80 bg-cyan-950/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-cyan-400 font-bold uppercase">Defended Query:</span>
                    <span className="text-cyan-400 font-semibold">Pred: <strong className="text-cyan-300">{demo.defended_prediction}</strong></span>
                  </div>
                  <p className="text-slate-200 font-sans text-sm font-medium">"{demo.defended_text}"</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Image / Deep Learning Demo Component */}
          {selectedItem.modality === 'Image' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs mb-3">
                <div className="bg-slate-950 p-2.5 rounded border border-emerald-900/60">
                  <span className="text-slate-400 text-[10px] block uppercase">Clean CNN Pred</span>
                  <strong className="text-emerald-400">{demo.original_prediction}</strong>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-red-900/60">
                  <span className="text-slate-400 text-[10px] block uppercase">Attacked CNN Pred</span>
                  <strong className="text-red-400">{demo.attacked_prediction}</strong>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-cyan-900/60">
                  <span className="text-slate-400 text-[10px] block uppercase">Defended CNN Pred</span>
                  <strong className="text-cyan-400">{demo.defended_prediction}</strong>
                </div>
              </div>

              {/* Render High-Res Visual Artifacts */}
              {demo.image_artifact && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">
                    Extracted Notebook Visualization Artifact:
                  </span>
                  <img 
                    src={demo.image_artifact} 
                    alt={selectedItem.attack_name} 
                    className="w-full rounded-md border border-slate-800 shadow-lg object-contain max-h-[380px] bg-black/40" 
                  />
                </div>
              )}

              {/* Supplemental Images (e.g. Backdoor Trigger Grids / Confusion Matrices) */}
              {demo.side_by_side_prediction_artifact && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">
                    Trigger Anomaly Detection & Retrained Decision:
                  </span>
                  <img 
                    src={demo.side_by_side_prediction_artifact} 
                    alt="Trigger defense" 
                    className="w-full rounded-md border border-slate-800 object-contain max-h-[300px]" 
                  />
                </div>
              )}

              {demo.confusion_matrix_artifact && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">
                    Clean vs Poisoned vs Defended 3-Way Confusion Matrix:
                  </span>
                  <img 
                    src={demo.confusion_matrix_artifact} 
                    alt="Confusion Matrix" 
                    className="w-full rounded-md border border-slate-800 object-contain max-h-[300px]" 
                  />
                </div>
              )}
            </div>
          )}

          {/* Defense Result Verdict Tag */}
          <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Defense Outcome & Status:</span>
            <span className="text-emerald-400 font-bold">{demo.recovery_status || 'Verified in Benchmark'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
