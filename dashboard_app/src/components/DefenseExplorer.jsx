import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, ArrowRight, Search, CheckCircle2, 
  AlertTriangle, RefreshCw, Layers, Zap, Sliders, Activity, Database
} from 'lucide-react';
import labData from '../data/adversarial_lab_data.json';

export default function DefenseExplorer({ initialDefenseId, onNavigateToAttack }) {
  const [selectedDefenseId, setSelectedDefenseId] = useState(initialDefenseId || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModality, setFilterModality] = useState('ALL');

  useEffect(() => {
    if (initialDefenseId) {
      setSelectedDefenseId(initialDefenseId);
    }
  }, [initialDefenseId]);

  const filteredDefenses = labData.filter(item => {
    const matchesSearch = item.defense_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.attack_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.defense_type && item.defense_type.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesModality = filterModality === 'ALL' || item.modality.toUpperCase() === filterModality;
    return matchesSearch && matchesModality;
  });

  const selectedItem = labData.find(d => d.id === selectedDefenseId) || labData[0];
  const demo = selectedItem.demo || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      {/* Left Sidebar: Defense Catalog (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input 
              type="text"
              placeholder="Search 20 defenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterModality}
              onChange={(e) => setFilterModality(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Modalities</option>
              <option value="NUMERICAL">Numerical IoT</option>
              <option value="TEXT">Text NLP</option>
              <option value="IMAGE">Image Vision</option>
            </select>
          </div>
        </div>

        {/* Defense Scrollable List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/80 max-h-[700px] overflow-y-auto">
          {filteredDefenses.map(item => {
            const isSelected = item.id === selectedDefenseId;
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedDefenseId(item.id)}
                className={`p-3.5 cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-slate-800/90 border-l-4 border-emerald-500 shadow-md' 
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">Defense #{item.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    item.modality === 'Numerical' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                    item.modality === 'Text' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                    'bg-purple-950 text-purple-400 border border-purple-900'
                  }`}>
                    {item.modality}
                  </span>
                </div>
                <h4 className={`text-sm font-semibold mt-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {item.defense_name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Defends: Attack #{item.id}</span>
                  {item.accuracy_recovery !== null && (
                    <span className={`font-mono ${item.accuracy_recovery > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      {item.accuracy_recovery > 0 ? `+${(item.accuracy_recovery * 100).toFixed(1)}%` : `${(item.accuracy_recovery * 100).toFixed(1)}%`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Defense Inspector (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Main Defense Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">
                  Defense #{selectedItem.id}
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                  Modality: {selectedItem.modality}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-2">
                {selectedItem.defense_name}
              </h2>
            </div>

            {/* Jump to Attack Button */}
            <button
              onClick={() => onNavigateToAttack(selectedItem.id)}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 text-xs font-medium transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Countered Attack #{selectedItem.id}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Defense Mechanism & Target Problem */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="md:col-span-2 bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 font-semibold block mb-1">Defense Strategy & Algorithmic Design:</span>
              <p className="text-slate-200 leading-relaxed">{demo.defense_description || 'Algorithmic filtering, outlier rejection, or robust retraining strategy.'}</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1 font-mono">
              <span className="text-slate-400 font-semibold block mb-1">Countermeasure Focus:</span>
              <div className="text-slate-200">Against: <strong className="text-red-400">{selectedItem.attack_name}</strong></div>
              <div className="text-slate-200">Domain: <strong className="text-emerald-400">{selectedItem.modality}</strong></div>
            </div>
          </div>

          {/* Defense Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase text-slate-400">Defended Accuracy</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {selectedItem.defended_accuracy !== null ? `${(selectedItem.defended_accuracy * 100).toFixed(1)}%` : '—'}
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase text-slate-400">Accuracy Recovery</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">
                {selectedItem.accuracy_recovery !== null ? `${selectedItem.accuracy_recovery > 0 ? '+' : ''}${(selectedItem.accuracy_recovery * 100).toFixed(1)}%` : '—'}
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase text-slate-400">Detection Rate (Recall)</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                {selectedItem.detection_rate !== null ? `${(selectedItem.detection_rate * 100).toFixed(1)}%` : 'N/A (Transform)'}
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase text-slate-400">False Positive Rate (FPR)</div>
              <div className="text-base font-bold text-slate-300 mt-0.5">
                {selectedItem.false_positive_rate !== null ? `${(selectedItem.false_positive_rate * 100).toFixed(1)}%` : '0.00%'}
              </div>
            </div>
          </div>
        </div>

        {/* Defense Concrete Demonstration Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Defense Action Demonstration
            </h3>
            <span className="text-xs font-mono text-emerald-400">{demo.defense_action || 'Applied Countermeasure'}</span>
          </div>

          {/* Numerical Defense Table */}
          {selectedItem.modality === 'Numerical' && demo.original_values && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Feature</th>
                      <th className="py-2.5 px-3 text-red-400">Attacked Input</th>
                      <th className="py-2.5 px-3 text-emerald-400">Defended / Sanitized Output</th>
                      <th className="py-2.5 px-3">Action Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {demo.features.map(f => {
                      const att = demo.attacked_values[f];
                      const def = demo.defended_values[f];
                      const changed = att !== def;

                      return (
                        <tr key={f} className={changed ? 'bg-emerald-950/20' : ''}>
                          <td className="py-2.5 px-3 font-semibold text-slate-300">{f}</td>
                          <td className="py-2.5 px-3 text-red-300">{att}</td>
                          <td className="py-2.5 px-3 text-emerald-300 font-bold">{def}</td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {changed ? (
                              <span className="text-emerald-400 font-semibold">Repaired / Imputed / Clipped</span>
                            ) : (
                              <span className="text-slate-500">Unmodified</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-red-900/60">
                  <span className="text-slate-400 text-[10px] block uppercase">Vulnerable Attacked Outcome</span>
                  <div className="text-sm font-bold text-red-400 mt-1">{demo.attacked_prediction}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/60">
                  <span className="text-slate-400 text-[10px] block uppercase">Defended Model Outcome</span>
                  <div className="text-sm font-bold text-emerald-400 mt-1">{demo.defended_prediction}</div>
                </div>
              </div>
            </div>
          )}

          {/* Text Defense Representation */}
          {selectedItem.modality === 'Text' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-red-950/60">
                <span className="text-red-400 font-bold block mb-1 uppercase">Attacked Corrupted Query:</span>
                <p className="text-slate-200 font-sans text-sm font-medium">"{demo.attacked_text}"</p>
                <div className="mt-2 text-slate-400">Yielded Misclassified Intent: <strong className="text-red-400">{demo.attacked_prediction}</strong></div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-emerald-950/60">
                <span className="text-emerald-400 font-bold block mb-1 uppercase">Defended Normalized Query:</span>
                <p className="text-slate-200 font-sans text-sm font-medium">"{demo.defended_text}"</p>
                <div className="mt-2 text-slate-400">Restored Intent Prediction: <strong className="text-emerald-400">{demo.defended_prediction}</strong></div>
              </div>
            </div>
          )}

          {/* Image & Poisoning Artifacts */}
          {selectedItem.modality === 'Image' && (
            <div className="space-y-3">
              {demo.image_artifact && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-2">
                    Defense Visual Verification:
                  </span>
                  <img 
                    src={demo.image_artifact} 
                    alt={selectedItem.defense_name} 
                    className="w-full rounded-md border border-slate-800 object-contain max-h-[360px] bg-black/40" 
                  />
                </div>
              )}
            </div>
          )}

          {/* Poisoning Data Sanitization summary */}
          {demo.demo_type === 'poisoning' && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-slate-400 uppercase font-semibold block">Training Dataset Sanitization Outcome:</span>
              <p className="text-slate-200 font-sans">{demo.audit_summary}</p>
              <div className="flex items-center space-x-2 text-emerald-400 pt-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Status: {demo.recovery_status}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
