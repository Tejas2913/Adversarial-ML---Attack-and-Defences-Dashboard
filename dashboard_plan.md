# Adversarial ML Attack & Defense Lab — Project Analysis & Dashboard Plan

## 1. Existing Notebook Structure

- **Notebook Filename**: `2548560_Tejas_R_M_Adversarial_ML_Smart_Agriculture_CIA.ipynb`
- **Total Cells**: 243 cells (fully executed with outputs, tables, and visualization artifacts).
- **Organization**:
  - **Front Matter & Threat Model** (Cells 0–13): Problem statement, CIA objectives, threat models, 20 attack distribution, 20 attack-to-defense mapping, reusable evaluation utilities.
  - **PART A — Numerical Smart Agriculture Data** (Cells 14–116):
    - Dataset: Crop Recommendation (N, P, K, Temperature, Humidity, pH, Rainfall; 22 crop classes; 2,200 records).
    - Classifiers: Logistic Regression, Support Vector Machine (RBF kernel), Random Forest, Multi-Layer Perceptron (MLP).
    - Attacks 1–8: Decision-Time / Evasion attacks.
    - Dedicated Clustering Defense Analysis (Cells 88–92): K-Means Centroid Distance & DBSCAN Density-Based Outlier Detection.
    - Attacks 9–12: Training-Time Poisoning attacks (Random Label-Flipping, Targeted Class Poisoning, Feature Poisoning, Outlier Injection).
  - **PART B — Agricultural Text Data** (Cells 117–150):
    - Dataset: Farmer Query & Agricultural Advisory Intent Classification (10 intent classes, 450 farmer queries).
    - Classifier: TF-IDF Vectorizer + Logistic Regression.
    - Attacks 13–16: Text Decision-Time / Evasion attacks (Synonym Substitution, Character-Level Typo, Important Token Removal, Keyword Dilution).
  - **PART C — Plant Image / Deep Learning Data** (Cells 151–204):
    - Dataset: PlantVillage Bean Leaf Dataset (3 classes: Angular Leaf Spot, Bean Rust, Healthy).
    - Classifier: Lightweight CNN (Conv2D, BatchNormalization, MaxPooling2D, Dropout, Dense, Softmax).
    - Attacks 17–18: Image Decision-Time / Evasion attacks (FGSM, Localized Adversarial Patch).
    - Attacks 19–20: Deep Learning Training-Time Data Poisoning (CNN Label Poisoning, CNN Backdoor-Style Trigger Poisoning).
  - **PART D — Final Comparative Analysis & CIA Demonstration** (Cells 205–243):
    - Comprehensive master attack table (Cell 207) and defense table (Cell 209).
    - Attack-Defense Matrix (Cells 211–212).
    - Classifier Vulnerability Comparison (Cell 214).
    - Modality & Stage Comparisons (Cells 216–220).
    - Aggregate Visualizations & Automated Result Analysis (Cells 221–227).
    - CIA Live Demonstration section with concrete before/after/defended examples for all modalities (Cells 228–240).
    - Discussion, Security Insights, and Conclusions (Cells 241–243).

---

## 2. Complete List of 20 Attacks

| # | Attack Name | Modality | Attack Stage | Target Model | Cell Range | Clean Acc | Attacked Acc | Acc Drop | Attack Success Rate (ASR) | Attacker Action / Perturbation |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | Sensor Drift Attack | Numerical | Decision-Time Evasion | LR, SVM, RF, MLP | Cells 40–45 | 98.64% | 96.50% | 2.14% | 2.39% | Subtle Gaussian sensor drift ($0.15\sigma$) on temp, humidity, pH, rainfall |
| **2** | Strategic Feature Masking Attack | Numerical | Decision-Time Evasion | LR, SVM, RF, MLP | Cells 46–51 | 98.64% | 69.41% | 29.23% | 29.90% | pH & rainfall masked with neutral placeholder values (zeros/medians) |
| **3** | Sparse Feature Perturbation Attack | Numerical | Decision-Time Evasion | LR, SVM, RF, MLP | Cells 52–57 | 98.64% | 53.82% | 44.82% | 45.99% | Single most important feature (rainfall) perturbed maximally |
| **4** | Feature Boundary Manipulation Attack | Numerical | Decision-Time Evasion | LR, SVM, RF, MLP | Cells 58–63 | 98.64% | 56.86% | 41.77% | 42.90% | Rainfall pushed beyond valid agricultural boundaries via boundary search |
| **5** | Query-Based Random Search Attack | Numerical | Decision-Time Evasion (Black-Box) | LR, SVM, RF, MLP | Cells 64–69 | 98.64% | 27.41% | 71.23% | 72.38% | Black-box query iterations adding random noise until decision boundary flips |
| **6** | Decision Boundary Search Attack | Numerical | Decision-Time Evasion | LR, SVM, RF, MLP | Cells 70–75 | 98.64% | 37.45% | 61.18% | 62.23% | Binary search along shortest vector to nearest decision boundary |
| **7** | Distribution-Preserving Evasion Attack | Numerical | Decision-Time Evasion | LR, SVM, RF, MLP | Cells 76–81 | 98.64% | 12.55% | 86.09% | **87.32%** | Perturbation guided within class feature distributions to evade detection |
| **8** | Low-Density Evasion Attack | Numerical | Decision-Time Evasion | LR, SVM, RF, MLP | Cells 82–92 | 98.64% | 71.00% | 27.64% | 28.80% | Adversarial samples crafted into sparse, low-density regions of feature space |
| **9** | Random Label-Flipping Poisoning | Numerical | Training-Time Poisoning | Random Forest | Cells 93–98 | 99.45% | 97.82% | 1.64% | N/A | Random 35% of training labels flipped to random alternative classes |
| **10** | Targeted Class Poisoning | Numerical | Training-Time Poisoning | Random Forest | Cells 99–104 | 99.45% | 98.18% | 1.27% | N/A (Recall: 1.00 $\rightarrow$ 0.72) | All `watermelon` training samples relabeled as `apple` |
| **11** | Feature Poisoning Attack | Numerical | Training-Time Poisoning | Random Forest | Cells 105–110 | 99.45% | 99.27% | 0.18% | N/A | Massive feature noise ($+2.5\sigma$) injected into 10% of training data |
| **12** | Outlier Injection Poisoning | Numerical | Training-Time Poisoning | Random Forest | Cells 111–116 | 99.45% | 99.27% | 0.18% | N/A | 150 synthetic extreme outlier records injected with mismatched crop labels |
| **13** | Agricultural Synonym Substitution | Text | Decision-Time Evasion | TF-IDF + LR | Cells 127–132 | 91.11% | 77.78% | 13.33% | 14.63% | Key domain terms replaced with synonyms (e.g., 'price' $\rightarrow$ 'rate') |
| **14** | Character-Level Typo Attack | Text | Decision-Time Evasion | TF-IDF + LR | Cells 133–138 | 91.11% | 78.89% | 12.22% | 13.41% | Transposition and typo injection into agricultural keywords (e.g., 'priec') |
| **15** | Important Token Removal Attack | Text | Decision-Time Evasion | TF-IDF + LR | Cells 139–144 | 91.11% | 25.56% | 65.56% | **76.83%** | Top-2 most discriminative TF-IDF tokens stripped from farmer query |
| **16** | Keyword Dilution Attack | Text | Decision-Time Evasion | TF-IDF + LR | Cells 145–150 | 91.11% | 45.56% | 45.56% | 56.10% | Irrelevant filler text appended to dilute TF-IDF keyword weights |
| **17** | FGSM (Fast Gradient Sign Method) | Image | Decision-Time Evasion (DL) | CNN (`cnn_clean`) | Cells 161–166 | 67.97% | 10.16% | 57.81% | **85.06%** | Single gradient sign perturbation step ($\epsilon=0.03$) across image pixels |
| **18** | Localized Adversarial Patch | Image | Decision-Time Evasion (DL) | CNN (`cnn_clean`) | Cells 167–172 | 67.97% | 63.28% | 4.69% | 19.54% | $8 \times 8$ high-contrast adversarial noise patch placed on leaf region |
| **19** | CNN Image Label-Poisoning Attack | Image | Training-Time Poisoning (DL) | CNN | Cells 173–186 | 67.97% | 77.34% | -9.38% | N/A | 10% of plant training images assigned corrupted random class labels |
| **20** | CNN Backdoor-Style Image Poisoning | Image | Training-Time Poisoning (DL) | CNN | Cells 187–204 | 67.97% | 75.78% | -7.81% | **100.0%** | $4 \times 4$ yellow trigger square stamped on 8% training images relabeled to target class |

---

## 3. Complete List of 20 Defenses

| # | Defense Name | Defends Against | Defense Type | Cell Range | Detection Rate (Recall) | False Positive Rate (FPR) | Defended Accuracy | Accuracy Recovery | Key Defense Mechanism |
|---|---|---|---|---|---|---|---|---|---|
| **1** | Sensor Range + Consistency Validation | Attack 1 | Input Validation | Cells 42–45 | 0.00% | 0.00% | 96.55% | 0.00% | Validates domain sensor limits; fails against subtle $0.15\sigma$ drift |
| **2** | Robust Imputation + Missingness Detection | Attack 2 | Preprocessing / Imputation | Cells 48–51 | 100.0% | N/A | 83.45% | +0.18% | Detects masked features and applies Iterative/Median Imputer |
| **3** | Feature Change / Sensitivity Monitoring | Attack 3 | Anomaly Detection | Cells 54–57 | 4.91% | 4.91% | 79.16% | -0.84% | Tracks delta from expected baseline distributions |
| **4** | Feature Clipping / Valid Agricultural Bounds | Attack 4 | Input Sanitization | Cells 60–63 | N/A (53 clipped) | N/A | 76.36% | 0.00% | Hard-clips feature values to biological agricultural limits $[min, max]$ |
| **5** | Prediction Confidence Rejection | Attack 5 | Confidence Filtering | Cells 66–69 | 76.73% | 0.36% | 0.00% (Abstain) | 0.00% | Rejects predictions with maximum softmax probability $< \tau$ |
| **6** | Ensemble Voting Defense | Attack 6 | Model Redundancy | Cells 72–75 | 20.91% | 0.73% | 45.27% | **+44.73%** | Hard voting across LR, SVM, RF, and MLP; flags disagreements |
| **7** | K-Means Centroid-Distance Detection | Attack 7 | Unsupervised Clustering | Cells 78–81 | **94.91%** | 6.18% | 32.14% | **+20.32%** | Measures Euclidean distance to nearest cluster center; flags outliers |
| **8** | DBSCAN Outlier/Noise Detection | Attack 8 | Density-Based Clustering | Cells 84–92 | **88.91%** | 8.00% | 83.61% | **+25.79%** | Identifies unclustered noise points in low-density feature space |
| **9** | Label Consistency Filtering | Attack 9 | Training Sanitization | Cells 95–98 | **99.65%** | 4.94% | 98.36% | +0.55% | Cross-validated k-NN agreement check to prune mislabeled training data |
| **10** | Class-Wise Training Data Audit | Attack 10 | Training Sanitization | Cells 101–104 | 60.00% | 4.32% | 97.64% | -0.55% (Target recall: 76%) | Per-class Mahalanobis/centroid distance auditing to remove poisoned labels |
| **11** | RobustScaler + Training Outlier Filtering | Attack 11 | Training Sanitization | Cells 107–110 | **92.12%** | 8.35% | 90.18% | -9.09% | Median/IQR scaling and Interquartile Range outlier removal |
| **12** | Isolation Forest Training Sanitization | Attack 12 | Anomaly Detection | Cells 113–116 | 14.67% | 6.30% | 99.27% | 0.00% | Isolation Forest trained on clean distribution to prune injected points |
| **13** | Agricultural Text Normalization | Attack 13 | Text Preprocessing | Cells 129–132 | N/A | N/A | 91.11% | **+13.33%** | Inverted agricultural synonym dictionary maps variations back to root canonical terms |
| **14** | Spell Correction / Token Normalization | Attack 14 | Text Preprocessing | Cells 135–138 | N/A | N/A | 88.89% | **+10.00%** | Levenshtein distance spell corrector restoring corrupted characters |
| **15** | Text Consistency / Missing-Keyword Detection | Attack 15 | Text Anomaly Detection | Cells 141–144 | **87.78%** | 12.22% | 63.64% | **+38.08%** | Checks for presence of expected domain keyword clusters; flags truncated text |
| **16** | TF-IDF Input Sanitization / Suspicious Filtering | Attack 16 | Text Sanitization | Cells 147–150 | N/A | N/A | 91.11% | **+45.56%** | Stopword/frequency thresholding stripping generic diluting tokens |
| **17** | FGSM Adversarial Training | Attack 17 | Robust Training (DL) | Cells 163–166 | N/A | N/A | 80.47% | **+70.31%** | CNN retrained on 50/50 mix of clean and online FGSM perturbed images |
| **18** | Image Preprocessing + Randomized Transform | Attack 18 | Image Defense (DL) | Cells 169–172 | N/A | N/A | 54.69% | -8.59% | Random crop, Gaussian blur, and jitter to destroy localized patch high-frequency signals |
| **19** | CNN Label Consistency + Sanitization | Attack 19 | Training Sanitization (DL) | Cells 179–186 | 29.31% | 2.38% | 78.12% | +0.78% | Feature extractor embedding distance check to remove mislabeled images |
| **20** | Trigger Anomaly Detection + Sanitized Retraining | Attack 20 | Trigger Defense (DL) | Cells 195–204 | **100.0%** | 9.59% | 74.22% (ASR: 100% $\rightarrow$ 29.4%) | -1.56% | Spatial channel-variance patch detector locates triggers; prunes poisoned training images |

---

## 4. Dataset / Modality Mapping

1. **Numerical Modality (Crop Recommendation)**:
   - *Features*: Nitrogen (N), Phosphorus (P), Potassium (K), Temperature (°C), Humidity (%), pH, Rainfall (mm).
   - *Classes*: 22 crop types (rice, maize, chickpea, kidneybeans, pigeonpeas, mothbeans, mungbean, blackgram, lentil, pomegranate, banana, mango, grapes, watermelon, muskmelon, apple, orange, papaya, coconut, cotton, jute, coffee).
   - *Total Samples*: 2,200 rows (1,650 train / 550 test).
   - *Applied Attacks*: Attacks 1–8 (Decision-Time Evasion), Attacks 9–12 (Data Poisoning).

2. **Text Modality (Farmer Query Intent)**:
   - *Inputs*: Synthesized realistic agricultural queries and advisory texts.
   - *Classes*: 10 intent categories (`crop_recommendation`, `fertilizer_guidance`, `pest_identification`, `disease_management`, `irrigation_scheduling`, `market_price_query`, `weather_advisory`, `soil_testing`, `organic_farming`, `harvest_postharvest`).
   - *Total Samples*: 450 farmer queries (360 train / 90 test).
   - *Applied Attacks*: Attacks 13–16 (Decision-Time Evasion).

3. **Image Modality (PlantVillage Leaf Disease)**:
   - *Inputs*: $64 \times 64 \times 3$ RGB leaf images.
   - *Classes*: 3 leaf categories (`angular_leaf_spot`, `bean_rust`, `healthy`).
   - *Total Samples*: 1,280 samples (1,152 train / 128 test).
   - *Applied Attacks*: Attacks 17–18 (Decision-Time Evasion), Attacks 19–20 (Data Poisoning & Backdoor).

---

## 5. Model Mapping

- **Baseline Numerical Classifiers**:
  - `LogisticRegression(max_iter=2000)`: Clean Acc = 97.05%, Mean Attacked Acc = 53.95%, Mean ASR = 45.12%
  - `SVC(kernel='rbf', probability=True)`: Clean Acc = 97.95%, Mean Attacked Acc = 54.57%, Mean ASR = 44.20% *(Most Robust)*
  - `RandomForestClassifier(n_estimators=200)`: Clean Acc = 99.45%, Mean Attacked Acc = 50.79%, Mean ASR = 49.09% *(Most Vulnerable)*
  - `MLPClassifier(hidden_layer_sizes=(64, 32))`: Clean Acc = 97.50%, Mean Attacked Acc = 50.59%, Mean ASR = 47.55%
- **Text Classifier**:
  - `TfidfVectorizer` + `LogisticRegression(max_iter=2000)`: Clean Acc = 91.11%
- **Image Classifier**:
  - Lightweight CNN (2 Conv2D blocks + BatchNorm + MaxPool + Dropout + Dense): Clean Acc = 67.97%
  - Adversarially Trained CNN (Defense 17): Clean Acc = 80.47%, Defended Attacked Acc = 80.47%
  - Backdoored CNN (Attack 20): Clean Acc = 75.78%, Trigger ASR = 100.0%
  - Sanitized Retrained CNN (Defense 20): Clean Acc = 74.22%, Trigger ASR = 29.41%

---

## 6. Available Metrics

The executed notebook provides full metrics logged across variables `all_attack_results`, `all_defense_results`, `attack_defense_matrix`, and `classifier_vulnerability_records`:
- **Accuracy**: Clean, Attacked, Defended, Accuracy Drop, Accuracy Recovery.
- **Attack Effectiveness**: Attack Success Rate (ASR), Label Flip Rate, Targeted Class Recall Drop, Triggered Test ASR.
- **Defense Effectiveness**: Detection Rate (Recall), False Positive Rate (FPR), Number of Outliers Flagged / Mislabeled Removed / Features Clipped.
- **Model Comparisons**: Per-classifier vulnerability breakdown across all numerical attacks.
- **Modality & Stage Rollups**: Mean ASR and Accuracy Drops aggregated by Modality (Numerical: 30.6%, Text: 34.2%, Image: 11.3%) and Stage (Decision-Time: 45.5% mean ASR vs Data Poisoning: -2.3% mean accuracy drop).

---

## 7. Available Visualization & Data Artifacts

1. **Embedded PNG Renderings in Cell Outputs**:
   - 4-Classifier Clean Confusion Matrices (Cell 35).
   - Attack 8: 2D PCA Scatter Plot of Normal vs Adversarial Outliers detected by DBSCAN (Cell 91).
   - Attack 17: 4-Panel FGSM Visualizer (Clean Image, Perturbation Amplified, Attacked Image, Defended Image) (Cell 165).
   - Attack 18: 3-Panel Localized Patch Visualizer (Original Leaf, Patched Leaf, Transformed Defended Leaf) (Cell 171).
   - Attack 19: 10-Image Label-Poisoning Training Grid (Cell 175).
   - Attack 19: 3-Way Confusion Matrix (Clean vs Poisoned vs Defended CNN) (Cell 185).
   - Attack 20: 10-Image Backdoor Triggered Training Set Grid (Cell 189).
   - Attack 20: 6-Image Clean vs Triggered Test Grid (Cell 193).
   - Defense 20: 5-Image Trigger Anomaly Detection Bounding Grid (Cell 197).
   - Defense 20: Side-by-Side Backdoored vs Defended Prediction on Triggered Image (Cell 201).
   - Master Aggregate Charts: Clean vs Attacked Accuracy, Attack Success Rate across all 20, Defended Accuracy, and Accuracy Recovery (Cells 222–225).

---

## 8. Status of Before / After / Defended Data in Notebook

| Attack # | Original Sample | Attacked Sample | Defended Sample | Original Pred | Attacked Pred | Defended Pred | Status |
|---|---|---|---|---|---|---|---|
| **1** | Yes (Sensor values) | Yes (Drifted values) | Yes (Validated) | `cotton` | `jute` | `jute` (Abstain/Accept) | Complete |
| **2** | Yes (Sensor values) | Yes (Masked values) | Yes (Imputed values) | `cotton` | `pigeonpeas` | `cotton` | Complete |
| **3** | Yes (Sensor values) | Yes (Perturbed feature) | Yes (Monitored) | `cotton` | `coconut` | `coconut` | Complete |
| **4** | Yes (Sensor values) | Yes (Boundary shifted) | Yes (Clipped to bounds) | `rice` | `jute` | `rice` | Complete |
| **5** | Yes (Sensor values) | Yes (Adversarial candidate) | Yes (Confidence threshold) | `pigeonpeas` | `chickpea` | `REJECTED (Abstain)` | Complete |
| **6** | Yes (Sensor values) | Yes (Boundary search vector) | Yes (Ensemble consensus) | `pigeonpeas` | `mothbeans` | `pigeonpeas` | Complete |
| **7** | Yes (Sensor values) | Yes (Within-distribution shift) | Yes (Centroid distance) | `pigeonpeas` | `chickpea` | `FLAGGED by K-Means` | Complete |
| **8** | Yes (Sensor values) | Yes (Sparse region point) | Yes (DBSCAN cluster score) | `pigeonpeas` | `mothbeans` | `FLAGGED as NOISE` | Complete |
| **9** | Yes (Clean training labels) | Yes (Flipped training labels) | Yes (Filtered training set) | N/A (Train) | N/A (Train) | Retrained Model Acc | Complete |
| **10** | Yes (Clean `watermelon` labels)| Yes (`apple` poisoned labels) | Yes (Audited dataset) | `watermelon` | `apple` | Retrained Model Acc | Complete |
| **11** | Yes (Standardized features) | Yes (Poisoned features $+2.5\sigma$) | Yes (Outlier pruned set) | N/A (Train) | N/A (Train) | Retrained Model Acc | Complete |
| **12** | Yes (Normal training sample) | Yes (Synthetic injected record) | Yes (Isolation Forest result) | N/A (Train) | N/A (Train) | Retrained Model Acc | Complete |
| **13** | Yes ("maize price expected...")| Yes ("maize rate expected...") | Yes ("maize price expected...") | `market_price_query` | `weather_advisory` | `market_price_query` | Complete |
| **14** | Yes ("maize price expected...")| Yes ("maize priec expected...") | Yes ("maize price expected...") | `market_price_query` | `weather_advisory` | `market_price_query` | Complete |
| **15** | Yes ("banana price in mandi")| Yes ("banana in mandi") | Yes (Token consistency check) | `market_price_query` | `disease_management` | `ACCEPTED (Retained)` | Complete |
| **16** | Yes ("humidity in maize...") | Yes ("humidity in maize [filler]") | Yes ("humidity in maize [clean]")| `weather_advisory` | `disease_management` | `weather_advisory` | Complete |
| **17** | Yes (Clean leaf image) | Yes (FGSM perturbed image) | Yes (Adversarial model pred) | `angular_leaf_spot` | `bean_rust` | `angular_leaf_spot` | Complete |
| **18** | Yes (Clean leaf image) | Yes (Patched leaf image) | Yes (Preprocessed/blurred image)| `angular_leaf_spot` | `angular_leaf_spot` | `angular_leaf_spot` | Complete |
| **19** | Yes (Clean training images) | Yes (Poisoned class labels) | Yes (Sanitized CNN matrices) | N/A (Train) | N/A (Train) | Defended CNN Matrix | Complete |
| **20** | Yes (Clean leaf test image) | Yes (Backdoor-triggered image)| Yes (Sanitized CNN pred) | `bean_rust` | `angular_leaf_spot` | `bean_rust` | Complete |

---

## 9. Information / Formatting Needed for the Dashboard

To make this dashboard fast, interactive, and self-contained without re-running long training loops in real-time during user interaction, we need:
1. **Extracted Static Dataset & Artifact JSON**:
   - Master metric records for all 20 attacks and 20 defenses.
   - Attack-defense mapping matrix with all quantitative recovery scores.
   - Classifier vulnerability matrix (LR vs SVM vs RF vs MLP).
   - Extracted representative before/after/defended samples for every single attack (1–20) formatted for interactive table / cards.
2. **Pre-extracted Image Assets**:
   - Extract PNG artifacts (FGSM image triples, patched images, backdoor trigger grids, confusion matrices, DBSCAN cluster plot) into high-resolution web-ready image assets.
3. **Interactive Simulation Engine / API**:
   - Lightweight browser-side or Python backend interactive test playground for:
     - Numerical sensor perturbation simulator (adjust sliders for temperature, rainfall, N, P, K, drift factor, confidence threshold $\tau$).
     - Text adversarial playground (type or pick farmer queries, apply synonym/typo/removal/dilution attacks, see live TF-IDF prediction & defense restoration).
     - Image / Deep Learning viewer (toggle between Clean, FGSM, Patch, and Backdoor views with probability confidence gauges).

---

## 10. Recommended Dashboard Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                 Modern Web Frontend (SPA)                   │
│   - Glassmorphism & High-Contrast Cyber-Agricultural Theme  │
│   - Responsive 4-Pillar Layout (Overview, Attacks, Defenses,│
│     Interactive Live Lab)                                   │
│   - Charts: Recharts / Chart.js (ASR, Accuracy, Recovery)  │
│   - Interactive Modality Sandboxes (Numerical, Text, Image) │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON Data & Assets / API
┌──────────────────────────────▼──────────────────────────────┐
│                  Data & Simulation Service                  │
│   - Pre-computed Truth Matrix (20 Attacks x 20 Defenses)    │
│   - Extracted Concrete Samples & Visual Assets (PNGs)       │
│   - Client-Side / Lightweight Interactive ML Simulator      │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Core Modules
1. **Executive Overview / Threat Intel Matrix**:
   - Summary KPIs: 20 Attacks, 20 Defenses, 3 Modalities, 4 Numerical Classifiers, Clean vs Attacked vs Defended overall resilience.
   - Interactive Attack-Defense Matrix with filtering by Modality (Numerical, Text, Image) and Attack Stage (Decision-Time Evasion vs Data Poisoning).
2. **Deep-Dive Attack & Defense Explorer**:
   - Full cards for all 20 attacks and defenses with step-by-step mathematical/procedural explanations, attacker capabilities, metrics, and defense mechanisms.
   - Before $\rightarrow$ Attacked $\rightarrow$ Defended concrete data inspector for every single attack.
3. **Interactive "Live Lab" Sandbox**:
   - **Numerical Sensor Lab**: Real-time slider adjustments (Drift, Boundary, Missingness, Confidence threshold) showing real-time classifier response across LR, SVM, RF, and MLP.
   - **Farmer Text NLP Lab**: Interactive text box allowing user to input custom queries, simulate synonym/typo/token-removal attacks, and see instant defense normalization.
   - **Computer Vision Leaf Lab**: Interactive image viewer inspecting FGSM epsilon perturbations, patch perturbations, and backdoor trigger detection overlays.
4. **Classifier Robustness Benchmark**:
   - Head-to-head comparison of Logistic Regression, SVM, Random Forest, and MLP against all 8 evasion attacks.

---
*Status: Inspection and verification complete. Awaiting user approval to begin dashboard implementation.*
