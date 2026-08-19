import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, Target, Zap, Activity, AlertTriangle, 
  Database, Layers, BarChart3, ArrowRight, CheckCircle2, TrendingDown, RefreshCw,
  Play, Cpu, Flame, Check, Shield, AlertOctagon, Terminal,
  Sliders, FileText, Image as ImageIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, Legend, CartesianGrid 
} from 'recharts';
import labData from '../data/adversarial_lab_data.json';
import clfComparison from '../data/classifier_comparison.json';
import modalityStats from '../data/modality_stats.json';
import stageStats from '../data/stage_stats.json';

export default function Overview({ onSelectAttack, onNavigateToLiveLab }) {
  const [filterModality, setFilterModality] = useState('ALL');
  const [filterStage, setFilterStage] = useState('ALL');

  // Filtered dataset for master matrix table
  const filteredData = labData.filter(item => {
    const matchesModality = filterModality === 'ALL' || item.modality.toUpperCase() === filterModality;
    let matchesStage = true;
    if (filterStage === 'EVASION') {
      matchesStage = item.attack_category.includes('Evasion');
    } else if (filterStage === 'POISONING') {
      matchesStage = item.attack_category.includes('Poisoning');
    } else if (filterStage === 'DL') {
      matchesStage = item.attack_category.includes('Deep Learning') || item.modality === 'Image';
    }
    return matchesModality && matchesStage;
  });

  // Prepare chart data for ASR
  const asrChartData = labData
    .filter(d => d.attack_success_rate !== null && d.attack_success_rate !== undefined)
    .map(d => ({
      name: `#${d.id} ${d.attack_name.length > 16 ? d.attack_name.substring(0, 14) + '...' : d.attack_name}`,
      full_name: d.attack_name,
      asr: +(d.attack_success_rate * 100).toFixed(1),
      modality: d.modality,
      id: d.id
    }));

  // Prepare Defense Recovery Data
  const recoveryChartData = labData
    .filter(d => d.accuracy_recovery !== null && d.accuracy_recovery !== undefined)
    .map(d => ({
      name: `#${d.id}`,
      defense: d.defense_name,
      recovery: +(d.accuracy_recovery * 100).toFixed(1),
      id: d.id
    }));

  // Severe Attacks Spotlight
  const severeAttacks = [
    { id: 20, name: "CNN Backdoor Poisoning", asr: "100.0%", modality: "Image", desc: "Yellow trigger square induces misclassification on 100% of test images." },
    { id: 7, name: "Distribution-Preserving Evasion", asr: "87.32%", modality: "Numerical", desc: "Feature covariance shifts evade univariate bounds while flipping labels." },
    { id: 17, name: "FGSM Gradient Sign", asr: "85.06%", modality: "Image", desc: "Single gradient step perturbs leaf pixels into false disease category." },
    { id: 15, name: "Important Token Removal", asr: "76.83%", modality: "Text", desc: "Stripping top TF-IDF keywords collapses intent classifier confidence." }
  ];

  // Best Defenses Spotlight
  const topDefenses = [
    { id: 17, name: "FGSM Adversarial Training", metric: "+70.31% Recovery", type: "Robust Retraining", desc: "Retrains CNN on 50/50 clean and adversarial image mix." },
    { id: 7, name: "K-Means Centroid Distance", metric: "94.91% Recall", type: "Unsupervised Clustering", desc: "Flags adversarial shifts exceeding cluster centroid radius." },
    { id: 8, name: "DBSCAN Noise Detection", metric: "88.91% Recall", type: "Density Clustering", desc: "Isolates unclustered noise points in low-density feature space." },
    { id: 9, name: "Label Consistency Filtering", metric: "99.65% Recall", type: "Training Sanitization", desc: "k-NN neighborhood voting prunes 573 of 575 mislabeled training samples." },
    { id: 20, name: "Trigger Anomaly Detection", metric: "100.0% Recall", type: "Patch Variance Audit", desc: "Locates zero-variance color patches and purges backdoor training data." }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner & Command Center Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 md:p-8 border border-slate-800 cyber-glow-emerald">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>Adversarial ML Command Center • Smart Agriculture Security Benchmark</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Adversarial ML Attack & Defense Demonstration Control Center
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
            Empirical stress-testing of 20 distinct adversarial attacks spanning <strong>Decision-Time Evasion</strong> and <strong>Training-Time Data Poisoning</strong> across Multi-Modal Agricultural AI (Tabular IoT Sensors, NLP Advisory, and CNN Leaf Pathologies), paired with 20 defense mechanisms.
          </p>

          {/* PART 8 F — CIA QUICK DEMO LAUNCH BAR */}
          <div className="pt-2">
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold block mb-2">
              ⚡ START CIA QUICK DEMO LAUNCHERS:
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigateToLiveLab('numerical', 'drift')}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg transition-all"
              >
                <Sliders className="w-4 h-4" />
                <span>Numerical Sensor Demo</span>
              </button>

              <button
                onClick={() => onNavigateToLiveLab('text', 'synonym')}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Farmer Text NLP Demo</span>
              </button>

              <button
                onClick={() => onNavigateToLiveLab('image', 'fgsm')}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg transition-all"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Leaf Vision FGSM Demo</span>
              </button>

              <button
                onClick={() => onSelectAttack(20)}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg transition-all"
              >
                <Flame className="w-4 h-4" />
                <span>CNN Backdoor Poisoning (#20)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PART 8 A — THREAT SUMMARY CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase">Total Attacks</span>
          <div className="text-2xl font-black text-white mt-1">20</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase">Total Defenses</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">20</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase">Evasion Stage</span>
          <div className="text-2xl font-black text-sky-400 mt-1">14</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase">Poisoning Stage</span>
          <div className="text-2xl font-black text-rose-400 mt-1">6</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase">Modalities</span>
          <div className="text-2xl font-black text-amber-400 mt-1">3</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase">Classifiers</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">4 + CNN</div>
        </div>
      </div>

      {/* PART 8 E — ATTACK -> DEFENSE CONCEPTUAL FLOWCHART DIAGRAM */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          CIA Core Conceptual Pipeline: Attack Generation ➔ Model Decision ➔ Defense Countermeasure
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-center font-mono text-xs pt-2">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">1. CLEAN INPUT</span>
            <span className="text-slate-400 text-[10px]">Sensor / Text / Leaf</span>
          </div>

          <div className="text-red-400 font-bold hidden md:block">➔ ATTACK ➔</div>

          <div className="bg-slate-950 p-3 rounded-lg border border-red-950/80 bg-red-950/10">
            <span className="text-red-400 font-bold block mb-1">2. MODEL DECISION</span>
            <span className="text-slate-400 text-[10px]">Evasion / Poisoned Flip</span>
          </div>

          <div className="text-cyan-400 font-bold hidden md:block">➔ FILTER ➔</div>

          <div className="bg-slate-950 p-3 rounded-lg border border-cyan-950/80 bg-cyan-950/10">
            <span className="text-cyan-400 font-bold block mb-1">3. DEFENSE RESULT</span>
            <span className="text-slate-400 text-[10px]">RECOVERED / REJECTED</span>
          </div>
        </div>
      </div>

      {/* PART 8 B & C — SPOTLIGHTS GRID: ATTACK SEVERITY & BEST DEFENSES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATTACK SEVERITY SPOTLIGHT */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              Peak Severity Attacks (Click to Inspect)
            </h2>
            <span className="text-xs font-mono text-red-400">High Impact</span>
          </div>

          <div className="space-y-3">
            {severeAttacks.map(att => (
              <div 
                key={att.id}
                onClick={() => onSelectAttack(att.id)}
                className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 hover:border-red-800 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-900 text-xs font-mono font-bold">
                      #{att.id}
                    </span>
                    <span className="font-semibold text-white text-sm group-hover:text-red-400 transition-colors">
                      {att.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-red-400 text-sm">{att.asr}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{att.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BEST DEFENSES SPOTLIGHT */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Best Performing Countermeasures
            </h2>
            <span className="text-xs font-mono text-emerald-400">Top Resilience</span>
          </div>

          <div className="space-y-3">
            {topDefenses.map(def => (
              <div key={def.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs font-mono font-bold">
                      Defense #{def.id}
                    </span>
                    <span className="font-semibold text-slate-200 text-sm">
                      {def.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">{def.metric}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{def.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PART 8 D — MODALITY BREAKDOWN CARDS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Multi-Modal Domain Breakdown (Click Card to Filter)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Numerical */}
          <div 
            onClick={() => {
              setFilterModality('NUMERICAL');
              document.getElementById('matrix-table')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-slate-950 p-4 rounded-xl border border-blue-900/60 hover:border-blue-500 cursor-pointer transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-blue-400 uppercase font-bold">1. Tabular IoT Sensors</span>
              <span className="text-xs font-mono text-slate-400">12 Attacks</span>
            </div>
            <div className="text-lg font-bold text-white group-hover:text-blue-300">Numerical Domain</div>
            <p className="text-xs text-slate-400">8 Evasion + 4 Poisoning attacks evaluated across Random Forest, SVM, LR, and MLP.</p>
            <div className="text-xs font-mono text-blue-400 flex items-center gap-1 pt-1">
              <span>Inspect Numerical Attacks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Text */}
          <div 
            onClick={() => {
              setFilterModality('TEXT');
              document.getElementById('matrix-table')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-slate-950 p-4 rounded-xl border border-amber-900/60 hover:border-amber-500 cursor-pointer transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase font-bold">2. Farmer Query NLP</span>
              <span className="text-xs font-mono text-slate-400">4 Attacks</span>
            </div>
            <div className="text-lg font-bold text-white group-hover:text-amber-300">Text Domain</div>
            <p className="text-xs text-slate-400">4 Evasion attacks (Synonyms, Typos, Token Removal, Dilution) evaluated on TF-IDF + LR.</p>
            <div className="text-xs font-mono text-amber-400 flex items-center gap-1 pt-1">
              <span>Inspect Text Attacks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Image */}
          <div 
            onClick={() => {
              setFilterModality('IMAGE');
              document.getElementById('matrix-table')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-slate-950 p-4 rounded-xl border border-purple-900/60 hover:border-purple-500 cursor-pointer transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-purple-400 uppercase font-bold">3. Leaf Vision CNN</span>
              <span className="text-xs font-mono text-slate-400">4 Attacks</span>
            </div>
            <div className="text-lg font-bold text-white group-hover:text-purple-300">Image & Deep Learning</div>
            <p className="text-xs text-slate-400">2 Evasion (FGSM, Patch) + 2 Poisoning (Label Poisoning, Backdoor Trigger) evaluated on CNN.</p>
            <div className="text-xs font-mono text-purple-400 flex items-center gap-1 pt-1">
              <span>Inspect Image Attacks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Success Rate (ASR) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-red-400" />
                Attack Success Rate (ASR) Benchmark
              </h2>
              <p className="text-xs text-slate-400">Proportion of previously correct samples flipped by adversary</p>
            </div>
            <span className="text-xs font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800">
              Avg ASR: 45.5%
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={asrChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  angle={-35} 
                  textAnchor="end" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  interval={0}
                />
                <YAxis unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(val, name, item) => [`${val}% ASR`, item.payload.full_name]}
                />
                <Bar dataKey="asr" radius={[4, 4, 0, 0]}>
                  {asrChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.asr > 75 ? '#ef4444' : entry.asr > 40 ? '#f59e0b' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defense Recovery Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                Defense Accuracy Recovery Gain
              </h2>
              <p className="text-xs text-slate-400">Net percentage point gain in accuracy post-defense</p>
            </div>
            <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
              Peak: +70.3%
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(val, name, item) => [`${val > 0 ? '+' : ''}${val}% Recovery`, item.payload.defense]}
                />
                <Bar dataKey="recovery" radius={[4, 4, 0, 0]}>
                  {recoveryChartData.map((entry, index) => (
                    <Cell 
                      key={`rec-${index}`} 
                      fill={entry.recovery > 20 ? '#10b981' : entry.recovery > 0 ? '#06b6d4' : '#64748b'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Master Attack-Defense Matrix */}
      <div id="matrix-table" className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Master 20 × 20 Attack-Defense Matrix
            </h2>
            <p className="text-xs text-slate-400">Empirical results derived strictly from the executed CIA benchmark</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {['ALL', 'NUMERICAL', 'TEXT', 'IMAGE'].map(m => (
                <button
                  key={m}
                  onClick={() => setFilterModality(m)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterModality === m ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {['ALL', 'EVASION', 'POISONING', 'DL'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStage(s)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterStage === s ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Attack Name</th>
                <th className="py-3 px-3">Modality</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Target Model</th>
                <th className="py-3 px-3">Clean Acc</th>
                <th className="py-3 px-3">Attacked Acc</th>
                <th className="py-3 px-3">ASR</th>
                <th className="py-3 px-3">Defense Name</th>
                <th className="py-3 px-3">Defended Acc</th>
                <th className="py-3 px-3">Recovery</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredData.map(item => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectAttack(item.id)}
                >
                  <td className="py-3 px-3 font-bold text-slate-400">{item.id}</td>
                  <td className="py-3 px-3 font-sans font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {item.attack_name}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.modality === 'Numerical' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      item.modality === 'Text' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {item.modality}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-300">
                    {item.attack_category.includes('Poisoning') ? (
                      <span className="text-rose-400">Poisoning</span>
                    ) : (
                      <span className="text-sky-400">Evasion</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-400">{item.target_model}</td>
                  <td className="py-3 px-3 text-emerald-400">{(item.clean_accuracy * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-red-400">{(item.attacked_accuracy * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 font-bold text-amber-400">
                    {item.attack_success_rate !== null ? `${(item.attack_success_rate * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">{item.defense_name}</td>
                  <td className="py-3 px-3 text-emerald-400">
                    {item.defended_accuracy !== null ? `${(item.defended_accuracy * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    {item.accuracy_recovery !== null ? (
                      <span className={item.accuracy_recovery > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {item.accuracy_recovery > 0 ? '+' : ''}{(item.accuracy_recovery * 100).toFixed(1)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAttack(item.id);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded transition-colors text-[10px]"
                    >
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
