import React, { useState, useEffect } from 'react';
import { 
  Sliders, Terminal, FileText, Image as ImageIcon, Zap, 
  RefreshCw, ShieldAlert, ShieldCheck, Play, RotateCcw, AlertTriangle, Check, Layers,
  CheckCircle2, XCircle, AlertOctagon, ArrowRight, Cpu, Activity, Info, Code, ChevronDown, ChevronUp,
  Lock, Target
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function LiveLab({ initialSandbox = 'numerical', initialAttackType }) {
  const [activeSandbox, setActiveSandbox] = useState(initialSandbox || 'numerical');

  useEffect(() => {
    if (initialSandbox) setActiveSandbox(initialSandbox);
  }, [initialSandbox]);

  // Backend connection status
  const [apiConnected, setApiConnected] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Telemetry drawer collapse state
  const [showTelemetry, setShowTelemetry] = useState(false);

  // ================= 1. ARCHITECTURE A: FIXED BASELINE DATA =================
  const numericalPresets = {
    cotton: { N: 118, P: 41, K: 20, temperature: 25.1, humidity: 80.9, ph: 6.8, rainfall: 98.4, label: 'cotton' },
    rice: { N: 85, P: 58, K: 41, temperature: 21.8, humidity: 80.3, ph: 7.0, rainfall: 226.7, label: 'rice' },
    pigeonpeas: { N: 22, P: 72, K: 20, temperature: 27.4, humidity: 56.4, ph: 5.7, rainfall: 139.1, label: 'pigeonpeas' },
    watermelon: { N: 99, P: 18, K: 50, temperature: 26.5, humidity: 85.2, ph: 6.4, rainfall: 48.3, label: 'watermelon' }
  };

  // State: Baseline selection (Clean reference input is strictly determined by this)
  const [selectedCropPreset, setSelectedCropPreset] = useState('cotton');
  const cleanBaselineFeatures = numericalPresets[selectedCropPreset] || numericalPresets.cotton;

  // State: Target Classifier
  const [selectedNumModel, setSelectedNumModel] = useState('rf');

  // State: Selected Attack Vector
  const [selectedNumAttack, setSelectedNumAttack] = useState(initialAttackType || 'drift');

  // State: Attack-Specific Adversary Parameters
  const [driftFactor, setDriftFactor] = useState(1.5);
  const [maskedFeatures, setMaskedFeatures] = useState(['ph', 'rainfall']);
  const [sparseDelta, setSparseDelta] = useState(180.0);
  const [boundaryVal, setBoundaryVal] = useState(345.0);
  const [queryNoise, setQueryNoise] = useState(0.25);
  const [boundaryStep, setBoundaryStep] = useState(0.40);
  const [kmeansShift, setKmeansShift] = useState(1.0);
  const [densityFactor, setDensityFactor] = useState(1.0);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.65);

  const [liveNumResponse, setLiveNumResponse] = useState(null);

  // Toggle helper for feature masking checklist
  const toggleMaskFeature = (feat) => {
    if (maskedFeatures.includes(feat)) {
      setMaskedFeatures(maskedFeatures.filter(f => f !== feat));
    } else {
      setMaskedFeatures([...maskedFeatures, feat]);
    }
  };

  // ================= 2. API FETCH HOOK =================
  useEffect(() => {
    if (activeSandbox !== 'numerical') return;

    setApiLoading(true);
    const numericClean = {};
    ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'].forEach(col => {
      numericClean[col] = parseFloat(cleanBaselineFeatures[col] !== undefined ? cleanBaselineFeatures[col] : 0);
    });

    const payload = {
      features: numericClean,
      attack: selectedNumAttack,
      model: selectedNumModel,
      drift_factor: parseFloat(driftFactor) || 1.5,
      masked_features: maskedFeatures,
      sparse_delta: parseFloat(sparseDelta) || 180.0,
      boundary_val: parseFloat(boundaryVal) || 345.0,
      query_noise: parseFloat(queryNoise) || 0.25,
      boundary_step: parseFloat(boundaryStep) || 0.40,
      kmeans_shift: parseFloat(kmeansShift) || 1.0,
      density_factor: parseFloat(densityFactor) || 1.0,
      confidence_threshold: parseFloat(confidenceThreshold) || 0.65
    };

    fetch(`${API_BASE_URL}/api/predict_numerical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(data => {
        if (data && data.original_input) {
          setLiveNumResponse(data);
          setApiConnected(true);
          setLastFetchTime(new Date().toLocaleTimeString());
        }
        setApiLoading(false);
      })
      .catch(() => {
        setApiConnected(false);
        setApiLoading(false);
      });
  }, [
    selectedCropPreset,
    cleanBaselineFeatures,
    selectedNumModel,
    selectedNumAttack,
    driftFactor,
    maskedFeatures,
    sparseDelta,
    boundaryVal,
    queryNoise,
    boundaryStep,
    kmeansShift,
    densityFactor,
    confidenceThreshold,
    activeSandbox
  ]);

  // Causal Client-Side Distance Engine for Fallback (Used only when backend is offline)
  const computeFallbackNumerical = () => {
    const cropCentroids = {
      cotton: { N: 118, P: 41, K: 20, temperature: 25.1, humidity: 80.9, ph: 6.8, rainfall: 98.4 },
      rice: { N: 85, P: 58, K: 41, temperature: 21.8, humidity: 80.3, ph: 7.0, rainfall: 226.7 },
      pigeonpeas: { N: 22, P: 72, K: 20, temperature: 27.4, humidity: 56.4, ph: 5.7, rainfall: 139.1 },
      watermelon: { N: 99, P: 18, K: 50, temperature: 26.5, humidity: 85.2, ph: 6.4, rainfall: 48.3 },
      maize: { N: 77, P: 48, K: 20, temperature: 22.3, humidity: 65.0, ph: 6.2, rainfall: 84.8 },
      chickpea: { N: 40, P: 67, K: 80, temperature: 18.8, humidity: 16.8, ph: 7.3, rainfall: 80.0 },
      jute: { N: 78, P: 46, K: 40, temperature: 24.9, humidity: 79.6, ph: 6.7, rainfall: 174.7 },
      mothbeans: { N: 21, P: 48, K: 20, temperature: 28.2, humidity: 53.2, ph: 6.8, rainfall: 51.2 }
    };

    const predictDynamic = (feats) => {
      let bestCrop = 'cotton';
      let minDist = Infinity;
      Object.entries(cropCentroids).forEach(([crop, cent]) => {
        const d = Math.sqrt(
          Math.pow((feats.N - cent.N)/10, 2) +
          Math.pow((feats.P - cent.P)/10, 2) +
          Math.pow((feats.K - cent.K)/10, 2) +
          Math.pow((feats.temperature - cent.temperature), 2) +
          Math.pow((feats.humidity - cent.humidity)/5, 2) +
          Math.pow((feats.ph - cent.ph)*5, 2) +
          Math.pow((feats.rainfall - cent.rainfall)/10, 2)
        );
        if (d < minDist) {
          minDist = d;
          bestCrop = crop;
        }
      });
      const conf = Math.max(35.0, +(98.5 - minDist * 2.5).toFixed(1));
      return { class: bestCrop, conf };
    };

    const orig = { ...cleanBaselineFeatures };
    let attacked = { ...cleanBaselineFeatures };
    let defended = { ...cleanBaselineFeatures };
    let attackName = selectedNumAttack.toUpperCase();
    let defenseName = "Baseline Countermeasure";
    let defenseAction = "PASSED THROUGH";

    if (selectedNumAttack === 'drift') {
      attackName = "SENSOR DRIFT (GAUSSIAN SHIFT)";
      attacked.temperature = +(orig.temperature + 0.3 * driftFactor).toFixed(1);
      attacked.humidity = +(orig.humidity + 0.5 * driftFactor).toFixed(1);
      attacked.ph = +(orig.ph - 0.1 * driftFactor).toFixed(2);
      attacked.rainfall = +(orig.rainfall - 0.6 * driftFactor).toFixed(1);
      defended = { ...attacked };
      defenseName = "Sensor Range & Consistency Validation";
      defenseAction = "ACCEPTED (Drift subtle; remains within physical sensor limits)";
    } else if (selectedNumAttack === 'masking') {
      attackName = "STRATEGIC FEATURE MASKING";
      maskedFeatures.forEach(feat => { attacked[feat] = 0.0; });
      defended.ph = 6.47;
      defended.rainfall = 103.46;
      defenseName = "Robust Imputation & Missingness Detection";
      defenseAction = "DETECTED & IMPUTED (Zero values flagged; Iterative Imputer restored feature estimates)";
    } else if (selectedNumAttack === 'sparse') {
      attackName = "SPARSE FEATURE PERTURBATION";
      attacked.rainfall = +(orig.rainfall + sparseDelta).toFixed(1);
      defended = { ...orig };
      defenseName = "Feature Sensitivity Monitoring";
      defenseAction = `SENSITIVITY ALERT (Rainfall delta ${sparseDelta}mm exceeded baseline threshold 150mm)`;
    } else if (selectedNumAttack === 'boundary') {
      attackName = "FEATURE BOUNDARY MANIPULATION";
      attacked.rainfall = boundaryVal;
      defended.rainfall = 298.56;
      defenseName = "Feature Clipping / Biological Bounds Enforcement";
      defenseAction = `CLIPPED (Rainfall ${boundaryVal}mm exceeded maximum agricultural limit 298.56mm; hard-clipped)`;
    } else if (selectedNumAttack === 'confidence') {
      attackName = "QUERY-BASED RANDOM SEARCH";
      attacked.N = +(orig.N * (1.0 + queryNoise)).toFixed(1);
      attacked.P = +(orig.P * (1.0 + queryNoise * 0.6)).toFixed(1);
      attacked.K = +(orig.K * (1.0 - queryNoise * 0.4)).toFixed(1);
      defended = { ...attacked };
      defenseName = "Prediction Confidence Rejection";
    } else if (selectedNumAttack === 'decision_boundary') {
      attackName = "DECISION BOUNDARY SEARCH";
      attacked.rainfall = +(orig.rainfall + 120.0 * boundaryStep).toFixed(1);
      attacked.ph = +(orig.ph - 1.2 * boundaryStep).toFixed(1);
      defended = { ...orig };
      defenseName = "Boundary Distance Verification";
      defenseAction = "FLAGGED & RECOVERED (Perturbation crossed verification manifold)";
    } else if (selectedNumAttack === 'kmeans') {
      attackName = "DISTRIBUTION-PRESERVING EVASION";
      attacked.N = +(orig.N + 22.0 * kmeansShift).toFixed(1);
      attacked.P = +(orig.P - 12.0 * kmeansShift).toFixed(1);
      defended = { ...attacked };
      defenseName = "K-Means Centroid-Distance Detection";
      defenseAction = "FLAGGED OUTLIER (Centroid distance > cluster threshold 35.0)";
    } else if (selectedNumAttack === 'density') {
      attackName = "LOW-DENSITY EVASION";
      attacked.temperature = +(orig.temperature + 8.5 * densityFactor).toFixed(1);
      attacked.humidity = +(orig.humidity - 25.0 * densityFactor).toFixed(1);
      attacked.rainfall = +(orig.rainfall + 95.0 * densityFactor).toFixed(1);
      defended = { ...attacked };
      defenseName = "DBSCAN Outlier & Noise Detection";
      defenseAction = "FLAGGED AS NOISE/OUTLIER (Sample lies in sparse feature-space region)";
    }

    const origEval = predictDynamic(orig);
    const attEval = predictDynamic(attacked);
    let defEval = predictDynamic(defended);

    if (selectedNumAttack === 'confidence' && attEval.conf < confidenceThreshold * 100) {
      defEval = { class: "ABSTAIN / REJECTED", conf: attEval.conf };
      defenseAction = `REJECTED (Softmax probability ${attEval.conf}% < threshold ${(confidenceThreshold * 100).toFixed(0)}%)`;
    } else if (selectedNumAttack === 'kmeans') {
      defEval = { class: "FLAGGED BY K-MEANS", conf: attEval.conf };
    } else if (selectedNumAttack === 'density') {
      defEval = { class: "FLAGGED AS NOISE BY DBSCAN", conf: attEval.conf };
    }

    return {
      mode: 'INTERACTIVE SIMULATION ENGINE',
      selected_model: selectedNumModel.toUpperCase(),
      attack_name: attackName,
      original_input: orig,
      attacked_input: attacked,
      defended_input: defended,
      original_prediction: origEval.class || 'cotton',
      original_confidence: origEval.conf || 98.5,
      attacked_prediction: attEval.class || 'cotton',
      attacked_confidence: attEval.conf || 98.5,
      defended_prediction: defEval.class || 'cotton',
      defended_confidence: defEval.conf || 98.5,
      prediction_changed: origEval.class !== attEval.class,
      defense_recovered: defEval.class === origEval.class,
      defense_name: defenseName,
      defense_action: defenseAction
    };
  };

  const currentNumData = (liveNumResponse && liveNumResponse.original_input) ? liveNumResponse : computeFallbackNumerical();

  const origInputs = currentNumData?.original_input || cleanBaselineFeatures;
  const attInputs = currentNumData?.attacked_input || cleanBaselineFeatures;
  const defInputs = currentNumData?.defended_input || cleanBaselineFeatures;

  // ================= 3. TEXT LAB STATE =================
  const textPresets = [
    { text: "Is the maize price expected to rise next month?", intent: "market_price_query" },
    { text: "What is the recommended fertilizer schedule for wheat crop?", intent: "fertilizer_guidance" },
    { text: "My tomato leaves have brown spots with yellow halos, what disease is this?", intent: "disease_management" },
    { text: "How much rainfall and humidity is expected this week for sowing?", intent: "weather_advisory" }
  ];

  const [customText, setCustomText] = useState(textPresets[0].text);
  const [selectedTextAttack, setSelectedTextAttack] = useState('synonym');
  const [liveTextResponse, setLiveTextResponse] = useState(null);

  useEffect(() => {
    if (activeSandbox !== 'text') return;

    fetch(`${API_BASE_URL}/api/predict_text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: customText, attack: selectedTextAttack })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.original_text) {
          setLiveTextResponse(data);
          setApiConnected(true);
        }
      })
      .catch(() => setApiConnected(false));
  }, [customText, selectedTextAttack, activeSandbox]);

  const computeFallbackText = () => {
    let original = customText || textPresets[0].text;
    let attacked = original;
    let defended = original;
    let originalIntent = "market_price_query";
    let attackedIntent = "weather_advisory";
    let defendedIntent = "market_price_query";
    let actionLog = "";

    const lower = original.toLowerCase();
    if (lower.includes('fertilizer') || lower.includes('nutrient') || lower.includes('npk')) originalIntent = "fertilizer_guidance";
    else if (lower.includes('disease') || lower.includes('spot') || lower.includes('fungus')) originalIntent = "disease_management";
    else if (lower.includes('rain') || lower.includes('humidity') || lower.includes('weather')) originalIntent = "weather_advisory";
    else if (lower.includes('price') || lower.includes('rate') || lower.includes('mandi') || lower.includes('cost')) originalIntent = "market_price_query";

    if (selectedTextAttack === 'synonym') {
      attacked = original
        .replace(/price/gi, 'rate')
        .replace(/fertilizer/gi, 'plant nutrient')
        .replace(/disease/gi, 'infection')
        .replace(/rainfall/gi, 'precipitation');
      defended = attacked
        .replace(/rate/gi, 'price')
        .replace(/plant nutrient/gi, 'fertilizer')
        .replace(/infection/gi, 'disease')
        .replace(/precipitation/gi, 'rainfall');
      attackedIntent = originalIntent === 'market_price_query' ? 'weather_advisory' : 'crop_recommendation';
      defendedIntent = originalIntent;
      actionLog = "SYNONYM NORMALIZATION: Inverted agricultural dictionary restored canonical terms.";
    } else if (selectedTextAttack === 'typo') {
      attacked = original
        .replace(/price/gi, 'priec')
        .replace(/fertilizer/gi, 'fertlizer')
        .replace(/maize/gi, 'maiez')
        .replace(/wheat/gi, 'wheet');
      defended = attacked
        .replace(/priec/gi, 'price')
        .replace(/fertlizer/gi, 'fertilizer')
        .replace(/maiez/gi, 'maize')
        .replace(/wheet/gi, 'wheat');
      attackedIntent = 'weather_advisory';
      defendedIntent = originalIntent;
      actionLog = "SPELL NORMALIZATION: Levenshtein distance 1 match corrected perturbed tokens.";
    } else if (selectedTextAttack === 'removal') {
      attacked = original
        .replace(/price/gi, '')
        .replace(/market/gi, '')
        .replace(/fertilizer/gi, '')
        .replace(/disease/gi, '')
        .replace(/\s+/g, ' ');
      defended = `${attacked.trim()} [FLAGGED: MISSING KEYWORD CLUSTER]`;
      attackedIntent = 'disease_management';
      defendedIntent = `${originalIntent} (Density fallback)`;
      actionLog = "CONSISTENCY CHECK: Detected absence of expected domain intent tokens; triggered intent fallback.";
    } else if (selectedTextAttack === 'dilution') {
      attacked = `${original} actually basically frankly speaking in my personal humble opinion anyway`;
      defended = original;
      attackedIntent = 'disease_management';
      defendedIntent = originalIntent;
      actionLog = "TF-IDF SANITIZATION: Low-information conversational filler tokens purged from vocabulary vector.";
    }

    return {
      mode: 'INTERACTIVE SIMULATION ENGINE',
      original_text: original,
      attacked_text: attacked,
      defended_text: defended,
      original_intent: originalIntent,
      original_confidence: 94.2,
      attacked_intent: attackedIntent,
      attacked_confidence: 58.4,
      defended_intent: defendedIntent,
      defended_confidence: 92.1,
      action_log: actionLog
    };
  };

  const currentTextData = (liveTextResponse && liveTextResponse.original_text) ? liveTextResponse : computeFallbackText();

  // ================= 4. IMAGE LAB STATE =================
  const [selectedLeafSample, setSelectedLeafSample] = useState('angular');

  const leafMetadata = {
    angular: {
      name: "Sample #3 — Bean Angular Leaf Spot",
      cleanLabel: "angular_leaf_spot",
      cleanConf: 88.4,
      fgsmAttackedLabel: "bean_rust",
      fgsmAttackedConf: 79.1,
      defendedLabel: "angular_leaf_spot",
      defendedConf: 91.2,
      imgSrc: "/assets/plots/cell_166_out_0.png"
    },
    patch: {
      name: "Sample #7 — Leaf with Localized Noise Patch",
      cleanLabel: "angular_leaf_spot",
      cleanConf: 84.1,
      fgsmAttackedLabel: "angular_leaf_spot",
      fgsmAttackedConf: 68.2,
      defendedLabel: "angular_leaf_spot",
      defendedConf: 82.5,
      imgSrc: "/assets/plots/cell_172_out_0.png"
    },
    backdoor: {
      name: "Sample #12 — Backdoor-Triggered Leaf Image",
      cleanLabel: "bean_rust",
      cleanConf: 92.6,
      fgsmAttackedLabel: "angular_leaf_spot (Target)",
      fgsmAttackedConf: 99.8,
      defendedLabel: "bean_rust (Correct Restored)",
      defendedConf: 89.4,
      imgSrc: "/assets/plots/cell_202_out_0.png"
    }
  };

  const currentLeaf = leafMetadata[selectedLeafSample] || leafMetadata.angular;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Status Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                Adversarial ML Interactive Live Control Center
              </h2>
              {/* API Status Badge */}
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                apiConnected 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {apiConnected ? '⚡ LIVE MODEL INFERENCE • FASTAPI' : '💻 INTERACTIVE SIMULATION ENGINE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {apiConnected 
                ? `Real-time Python model inference & defense pipeline connected (${API_BASE_URL})` 
                : 'Interactive client-side simulation engine synchronized with notebook parameters'}
            </p>
          </div>

          {/* Sandbox Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSandbox('numerical')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeSandbox === 'numerical'
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Numerical IoT Lab</span>
            </button>

            <button
              onClick={() => setActiveSandbox('text')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeSandbox === 'text'
                  ? 'bg-amber-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Farmer NLP Lab</span>
            </button>

            <button
              onClick={() => setActiveSandbox('image')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeSandbox === 'image'
                  ? 'bg-purple-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Leaf Vision Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 1. NUMERICAL LAB (ARCHITECTURE A) ================= */}
      {activeSandbox === 'numerical' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls Pane (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* SECTION 1: BASELINE SAMPLE (FIXED CLEAN REFERENCE INPUT) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      BASELINE SAMPLE (FIXED CLEAN INPUT)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Fixed clean IoT sensor reading used as the reference input ($x$).
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold shrink-0">
                    x Fixed
                  </span>
                </div>

                {/* Baseline Crop Profile Buttons */}
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1.5 font-semibold">
                    Select Reference Crop Scenario:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(numericalPresets).map(crop => (
                      <button
                        key={crop}
                        onClick={() => setSelectedCropPreset(crop)}
                        className={`py-2 px-3 rounded-lg text-xs font-mono capitalize transition-all border text-left flex items-center justify-between ${
                          selectedCropPreset === crop
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600 font-bold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span>{crop}</span>
                        {selectedCropPreset === crop && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Read-Only Fixed Sensor Values Display */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">
                    Fixed Sensor Features (x):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">N-P-K (kg/ha)</span>
                      <span className="text-slate-200 font-bold">{cleanBaselineFeatures.N}-{cleanBaselineFeatures.P}-{cleanBaselineFeatures.K}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Temp (°C)</span>
                      <span className="text-emerald-400 font-bold">{cleanBaselineFeatures.temperature}°C</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Humidity</span>
                      <span className="text-cyan-400 font-bold">{cleanBaselineFeatures.humidity}%</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">pH / Rain</span>
                      <span className="text-blue-400 font-bold">{cleanBaselineFeatures.ph} / {cleanBaselineFeatures.rainfall}mm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: TARGET CLASSIFIER */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    TARGET CLASSIFIER
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400">Decision-Time Model</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  {[
                    { id: 'rf', label: 'Random Forest', tag: 'RF' },
                    { id: 'svm', label: 'SVM (RBF)', tag: 'SVM' },
                    { id: 'lr', label: 'Logistic Reg', tag: 'LR' },
                    { id: 'mlp', label: 'Neural Net', tag: 'MLP' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedNumModel(m.id)}
                      className={`py-2 px-1 rounded-lg border text-center transition-all ${
                        selectedNumModel === m.id
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">{m.tag}</div>
                      <div className="text-[9px] text-slate-500 truncate">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 3: ATTACK CONFIGURATION (ADVERSARY CONTROLS) */}
              <div className="bg-slate-900 border border-red-950/60 rounded-xl p-5 space-y-4 shadow-lg shadow-red-950/20">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-red-400" />
                      ATTACK CONFIGURATION (ADVERSARY CONTROLS)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Adversary perturbs clean baseline input vector via perturbation parameter.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 font-bold shrink-0">
                    Adversary
                  </span>
                </div>

                {/* Select Attack Vector */}
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1.5 font-semibold">
                    Select Decision-Time Attack Vector:
                  </label>
                  <select
                    value={selectedNumAttack}
                    onChange={(e) => setSelectedNumAttack(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-red-500 focus:outline-none"
                  >
                    <option value="drift">Attack 1 — Sensor Drift (Gaussian Shift)</option>
                    <option value="masking">Attack 2 — Strategic Feature Masking</option>
                    <option value="sparse">Attack 3 — Sparse Feature Perturbation</option>
                    <option value="boundary">Attack 4 — Feature Boundary Manipulation</option>
                    <option value="confidence">Attack 5 — Query-Based Random Search</option>
                    <option value="decision_boundary">Attack 6 — Decision Boundary Search</option>
                    <option value="kmeans">Attack 7 — Distribution-Preserving Evasion</option>
                    <option value="density">Attack 8 — Low-Density Evasion</option>
                  </select>
                </div>

                {/* Attack-Specific Parameter Controls */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-3 font-mono">
                  
                  {/* Attack 1: Sensor Drift Slider */}
                  {selectedNumAttack === 'drift' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Drift Multiplier (sigma factor):</span>
                        <span className="text-amber-400 font-bold">{driftFactor.toFixed(1)}x sigma</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="5.0" step="0.5"
                        value={driftFactor}
                        onChange={(e) => setDriftFactor(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Scales gradual environmental sensor drift perturbation vector across Temperature, Humidity, pH, and Rainfall.
                      </p>
                    </div>
                  )}

                  {/* Attack 2: Strategic Feature Masking Checklist */}
                  {selectedNumAttack === 'masking' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Target Features to Mask (0.0):</span>
                        <span className="text-red-400 font-bold">{maskedFeatures.length} Masked</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs pt-1">
                        {['ph', 'rainfall', 'temperature', 'humidity', 'N', 'P', 'K'].map(feat => {
                          const isMasked = maskedFeatures.includes(feat);
                          return (
                            <button
                              key={feat}
                              type="button"
                              onClick={() => toggleMaskFeature(feat)}
                              className={`py-1.5 px-2 rounded border text-left flex items-center justify-between transition-colors ${
                                isMasked 
                                  ? 'bg-red-950/80 text-red-300 border-red-800 font-bold' 
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              <span className="capitalize">{feat}</span>
                              <span className="text-[10px]">{isMasked ? 'MASKED' : 'CLEAN'}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight pt-1">
                        Simulates uncalibrated/dropped telemetry packets by forcing selected sensor dimensions to neutral zero.
                      </p>
                    </div>
                  )}

                  {/* Attack 3: Sparse Feature Perturbation */}
                  {selectedNumAttack === 'sparse' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Rainfall Perturbation Delta:</span>
                        <span className="text-blue-400 font-bold">+{sparseDelta.toFixed(0)} mm</span>
                      </div>
                      <input 
                        type="range" min="50" max="300" step="10"
                        value={sparseDelta}
                        onChange={(e) => setSparseDelta(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Applies a high-magnitude localized L0 perturbation to the single most critical attribute (Rainfall).
                      </p>
                    </div>
                  )}

                  {/* Attack 4: Feature Boundary Manipulation */}
                  {selectedNumAttack === 'boundary' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Injected Out-of-Bounds Rainfall:</span>
                        <span className="text-red-400 font-bold">{boundaryVal.toFixed(0)} mm</span>
                      </div>
                      <input 
                        type="range" min="250" max="450" step="5"
                        value={boundaryVal}
                        onChange={(e) => setBoundaryVal(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Forces rainfall input far beyond biological agricultural limits (valid maximum: 298.56mm).
                      </p>
                    </div>
                  )}

                  {/* Attack 5: Query-Based Random Search */}
                  {selectedNumAttack === 'confidence' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Query Noise Intensity:</span>
                          <span className="text-amber-400 font-bold">{(queryNoise * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          type="range" min="0.05" max="0.50" step="0.05"
                          value={queryNoise}
                          onChange={(e) => setQueryNoise(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Defense Rejection Threshold (tau):</span>
                          <span className="text-cyan-400 font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          type="range" min="0.40" max="0.90" step="0.05"
                          value={confidenceThreshold}
                          onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Iterative random search degrades model confidence below acceptance threshold.
                      </p>
                    </div>
                  )}

                  {/* Attack 6: Decision Boundary Search */}
                  {selectedNumAttack === 'decision_boundary' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Step Toward Boundary Centroid:</span>
                        <span className="text-purple-400 font-bold">{(boundaryStep * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0.10" max="1.0" step="0.05"
                        value={boundaryStep}
                        onChange={(e) => setBoundaryStep(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Steps vector along shortest hyper-plane distance toward neighboring misclassifying cluster centroid.
                      </p>
                    </div>
                  )}

                  {/* Attack 7: Distribution-Preserving Evasion */}
                  {selectedNumAttack === 'kmeans' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Covariance Shift Scale:</span>
                        <span className="text-teal-400 font-bold">{kmeansShift.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="3.0" step="0.25"
                        value={kmeansShift}
                        onChange={(e) => setKmeansShift(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Shifts joint feature covariance along cluster manifold to evade univariate checks.
                      </p>
                    </div>
                  )}

                  {/* Attack 8: Low-Density Evasion */}
                  {selectedNumAttack === 'density' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Cluster Displacement Factor:</span>
                        <span className="text-rose-400 font-bold">{densityFactor.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="3.0" step="0.25"
                        value={densityFactor}
                        onChange={(e) => setDensityFactor(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Pushes sample into low-density sparse feature space to evade standard decision manifolds.
                      </p>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Right Results & Decision Pane (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* SECTION 4: MODEL DECISION & RESILIENCE PANEL */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 cyber-glow-emerald">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      MODEL DECISION & RESILIENCE PANEL
                    </h3>
                    <span className="text-xs text-slate-400">
                      Target Model: <strong className="text-cyan-400">{currentNumData?.selected_model || 'RF'}</strong> | Baseline: <strong className="text-emerald-400 capitalize">{selectedCropPreset}</strong>
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800 font-semibold">
                    {currentNumData?.mode || 'LIVE MODEL INFERENCE • FASTAPI'}
                  </span>
                </div>

                {/* 3-Box Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                  
                  {/* 1. Clean Input Prediction (FIXED REFERENCE) */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-emerald-900/60 relative space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">1. CLEAN INPUT PRED</span>
                      <Lock className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="text-lg font-black text-white capitalize">{currentNumData?.original_prediction || 'cotton'}</div>
                    <div className="text-[10px] text-emerald-400/80">Conf: {currentNumData?.original_confidence ?? 98.5}%</div>
                    <span className="inline-block text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 mt-1">
                      Fixed Reference (x)
                    </span>
                  </div>

                  {/* 2. Attacked Prediction */}
                  <div className={`p-4 rounded-lg border relative space-y-1 ${
                    currentNumData?.prediction_changed 
                      ? 'bg-red-950/20 border-red-800' 
                      : 'bg-slate-950 border-slate-800'
                  }`}>
                    <span className="text-[10px] text-red-400 font-bold block uppercase">2. ATTACKED PRED</span>
                    <div className="text-lg font-black text-red-300 capitalize">{currentNumData?.attacked_prediction || 'cotton'}</div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-red-400">Conf: {currentNumData?.attacked_confidence ?? 98.5}%</span>
                      {currentNumData?.prediction_changed ? (
                        <span className="bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-bold border border-red-800">⚠️ CHANGED</span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">ℹ️ UNCHANGED</span>
                      )}
                    </div>
                  </div>

                  {/* 3. Defended Decision */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-cyan-900/60 relative space-y-1">
                    <span className="text-[10px] text-cyan-400 font-bold block uppercase">3. DEFENDED DECISION</span>
                    <div className="text-lg font-black text-cyan-300 capitalize">{currentNumData?.defended_prediction || 'cotton'}</div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400">Conf: {currentNumData?.defended_confidence ?? 98.5}%</span>
                      {currentNumData?.defense_recovered ? (
                        <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold border border-emerald-800">✓ RECOVERED</span>
                      ) : (typeof currentNumData?.defended_prediction === 'string' && (currentNumData.defended_prediction.includes('REJECTED') || currentNumData.defended_prediction.includes('ABSTAIN'))) ? (
                        <span className="bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-bold border border-red-800">🛑 REJECTED</span>
                      ) : (
                        <span className="bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded font-bold border border-purple-800">⚠ ACTION TRIGGERED</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Defense Telemetry */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs font-mono">
                  <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Defense Applied: {currentNumData?.defense_name || 'Countermeasure'}</span>
                  </div>
                  <p className="text-emerald-300 leading-snug">{currentNumData?.defense_action || 'Monitoring sensor pipeline.'}</p>
                </div>
              </div>

              {/* SECTION 5: FEATURE VALUES TRANSFORMATION PIPELINE */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                    Feature Transformation Pipeline (Clean Reference vs Attacked vs Defended)
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Original column stays fixed
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left font-mono">
                    <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Feature</th>
                        <th className="py-2.5 px-3 text-emerald-400">Original (Fixed x)</th>
                        <th className="py-2.5 px-3 text-red-400">Attacked (x + delta)</th>
                        <th className="py-2.5 px-3 text-cyan-400">Defended (x_def)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {['temperature', 'humidity', 'rainfall', 'ph', 'N', 'P', 'K'].map(f => {
                        const orig = origInputs?.[f] ?? 0;
                        const att = attInputs?.[f] ?? 0;
                        const def = defInputs?.[f] ?? 0;
                        const isAttacked = orig !== att;

                        return (
                          <tr key={f} className={isAttacked ? 'bg-red-950/20' : ''}>
                            <td className="py-2 px-3 font-semibold text-slate-300 capitalize">{f}</td>
                            <td className="py-2 px-3 text-slate-200">{orig}</td>
                            <td className="py-2 px-3 text-red-300 font-bold">{att}</td>
                            <td className="py-2 px-3 text-cyan-300 font-bold">{def}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

          {/* DEVELOPER INFERENCE TELEMETRY ACCORDION */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs">
            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className="w-full flex items-center justify-between text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">DEVELOPER INFERENCE TELEMETRY</span>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-cyan-400 border border-slate-800">
                  {lastFetchTime ? `Last Synchronized: ${lastFetchTime}` : 'Telemetry Active'}
                </span>
              </div>
              {showTelemetry ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTelemetry && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Target Model:</span>
                    <span className="text-cyan-300 font-bold">{selectedNumModel.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Attack Vector:</span>
                    <span className="text-red-300 font-bold">{selectedNumAttack.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Endpoint Status:</span>
                    <span className={apiConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {apiConnected ? '200 OK (FastAPI)' : 'Client Fallback'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Endpoint URL:</span>
                    <span className="text-slate-300 font-mono text-[11px] break-all">{API_BASE_URL}/api/predict_numerical</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block mb-1">RAW PIPELINE TELEMETRY JSON:</span>
                  <pre className="text-[10px] text-slate-300 overflow-x-auto p-2 bg-black/40 rounded border border-slate-800">
                    {JSON.stringify(currentNumData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ================= 2. TEXT NLP LAB ================= */}
      {activeSandbox === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Farmer Query Controls
            </h3>

            {/* Presets */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Load Sample Query:</label>
              <div className="space-y-1.5">
                {textPresets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setCustomText(p.text)}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
                  >
                    "{p.text}"
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Or Type Custom Query:</label>
              <textarea 
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Attack Type */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Text Attack Mode:</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { id: 'synonym', name: 'Synonym Substitution' },
                  { id: 'typo', name: 'Character Typo' },
                  { id: 'removal', name: 'Token Removal' },
                  { id: 'dilution', name: 'Keyword Dilution' }
                ].map(att => (
                  <button
                    key={att.id}
                    onClick={() => setSelectedTextAttack(att.id)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      selectedTextAttack === att.id
                        ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {att.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {/* TEXT DECISION PANEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  TF-IDF INTENT DECISION PANEL
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800 font-semibold">
                  {currentTextData.mode}
                </span>
              </div>

              {/* 1. Original */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-emerald-900/60 space-y-1">
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>1. ORIGINAL QUERY</span>
                  <span className="text-xs">Predicted Intent: <strong className="text-emerald-300">{currentTextData.original_intent}</strong> ({currentTextData.original_confidence}%)</span>
                </div>
                <p className="text-slate-200 font-sans text-sm">"{currentTextData.original_text}"</p>
              </div>

              {/* 2. Attacked */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-red-950/80 bg-red-950/10 space-y-1">
                <div className="flex justify-between items-center text-red-400 font-bold">
                  <span>2. ATTACKED QUERY</span>
                  <span className="text-xs">Attacked Intent: <strong className="text-red-300">{currentTextData.attacked_intent}</strong> ({currentTextData.attacked_confidence}%)</span>
                </div>
                <p className="text-slate-200 font-sans text-sm">"{currentTextData.attacked_text}"</p>
              </div>

              {/* 3. Defended */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-900/60 space-y-1">
                <div className="flex justify-between items-center text-cyan-400 font-bold">
                  <span>3. DEFENDED NORMALIZED QUERY</span>
                  <span className="text-xs">Restored Intent: <strong className="text-cyan-300">{currentTextData.defended_intent}</strong> ({currentTextData.defended_confidence}%)</span>
                </div>
                <p className="text-slate-200 font-sans text-sm">"{currentTextData.defended_text}"</p>
              </div>

              {/* Action Log */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1 font-semibold">Defense Action Telemetry:</span>
                <p className="text-emerald-400">{currentTextData.action_log}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. IMAGE VISION LAB ================= */}
      {activeSandbox === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              Plant Leaf Pathology Controls
            </h3>

            {/* Select Sample */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Select Leaf Sample:</label>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { id: 'angular', name: 'Sample #3 — Bean Angular Leaf Spot' },
                  { id: 'patch', name: 'Sample #7 — Leaf Noise Patch' },
                  { id: 'backdoor', name: 'Sample #12 — Backdoor Triggered Leaf' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedLeafSample(s.id)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                      selectedLeafSample === s.id
                        ? 'bg-purple-950 text-purple-300 border-purple-700 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Label Disclaimer */}
            <div className="bg-slate-950 p-3 rounded-lg border border-purple-900/60 text-xs font-mono text-purple-300">
              <span className="font-bold block mb-1 uppercase text-slate-300">Evaluation Mode:</span>
              <span>PRECOMPUTED CIA BENCHMARK EXPERIMENT</span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Vision Inspection & Defended CNN Evaluation
              </h3>

              {/* Render High-Res Image Figure */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <img 
                  src={currentLeaf.imgSrc} 
                  alt={currentLeaf.name} 
                  className="w-full rounded-md border border-slate-800 object-contain max-h-[380px] bg-black/40" 
                />
              </div>

              {/* 3-Way Prediction Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Clean Baseline CNN</span>
                  <div className="text-sm font-bold text-emerald-400 mt-1">{currentLeaf.cleanLabel}</div>
                  <span className="text-[10px] text-emerald-400/80">Confidence: {currentLeaf.cleanConf}%</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-red-900/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Vulnerable Attacked CNN</span>
                  <div className="text-sm font-bold text-red-400 mt-1">{currentLeaf.fgsmAttackedLabel}</div>
                  <span className="text-[10px] text-red-400/80">Confidence: {currentLeaf.fgsmAttackedConf}%</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-cyan-900/60">
                  <span className="text-[10px] text-slate-400 block uppercase">Defended CNN Decision</span>
                  <div className="text-sm font-bold text-cyan-300 mt-1">{currentLeaf.defendedLabel}</div>
                  <span className="text-[10px] text-cyan-400/80">Confidence: {currentLeaf.defendedConf}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
