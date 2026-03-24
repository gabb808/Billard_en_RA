# 🎯 RÉSUMÉ COMPLET: Système de Détection des Boules de Billard

## 🏗️ ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTÈME INTERACTIVE POOL                     │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────┐
        │          COUCHE MATÉRIELLE (HAL)                 │
        └──────────────────────────────────────────────────┘
                    ├─ Camera Driver ←─ Webcam USB (1920×1080)
                    ├─ Ball Driver ←─ Détection boules
                    ├─ Cue Driver ←─ Détection queue
                    └─ [Autres drivers]
                                  ↓
        ┌──────────────────────────────────────────────────┐
        │     COUCHE APPLICATION (apps Python)            │
        └──────────────────────────────────────────────────┘
                    ├─ balls/processing.py ← Récupère positions
                    ├─ menu/processing.py
                    └─ [Autres apps]
                                  ↓
        ┌──────────────────────────────────────────────────┐
        │      SERVEUR WEB (Flask + Socket.io)             │
        └──────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────┐
        │    DASHBOARD (Frontend JavaScript/P5.js)         │
        └──────────────────────────────────────────────────┘
```

---

## 🎥 FLUX DÉTECTION DES BOULES (Détail)

```
FRAME VIDÉO (1920×1080)
    │
    ├─→ [1] SOUSTRACTION: absdiff() avec background.jpg
    │       └─→ Élimine le fond statique
    │           Isole que les changements (boules)
    │
    ├─→ [2] PROJECTION: warp_projection() avec calibration_data.json
    │       └─→ Corrige la perspective
    │           Aligne les pixels avec la vraie table
    │
    ├─→ [3] FLOU: GaussianBlur(5×5)
    │       └─→ Lisse le bruit
    │           Améliore la détection
    │
    ├─→ [4] SEUIL: threshold(150) → Image binaire noir/blanc
    │       └─→ Sépare les objets du background
    │
    ├─→ [5] CONTOURS: findContours()
    │       └─→ Trouve formes dans l'image
    │
    ├─→ [6] FILTRES:
    │       ├─→ Aire >= 5026 px² (DEFAULT_MIN_MOMENT_00)
    │       │   └─→ Rejette les petits bruits
    │       │
    │       └─→ Circularité <= 25 (DEFAULT_MIN_DISTANCE)
    │           └─→ Rejette les formes bizarres
    │
    └─→ RÉSULTAT: Liste des positions (x, y) des boules
```

---

## 📊 FLUX DE DONNÉES - Exemple Réel

```
SITUATION: Vous bougez la caméra
            ↓
La distance caméra-table change
            ↓
Les boules en pixels changent de TAILLE
            ↓
            
┌─ AVANT                          ┌─ MAINTENANT
├─ Boules loin: 50×50 px          ├─ Boules près: 30×30 px
├─ Aire: 2500 px²                 ├─ Aire: 900 px²
├─ Seuil: 5026 px²                ├─ Seuil: 5026 px² ← TROP STRICT!
├─ Résultat: ✅ Détectées         ├─ Résultat: ❌ REJETÉES
└─ Raison: 2500 > 5026 ✓          └─ Raison: 900 < 5026 ✗

                     SOLUTION:
              Réduire le seuil à ~900 px²
              (Rayon de ~17 pixels au lieu de 35)
```

---

## 🔧 LES 3 PARAMÈTRES CLÉS

### 1. `DEFAULT_MIN_MOMENT_00` (Taille minimale d'une boule)

**Calcul:**
```python
# Rayon désiré = R pixels
# Formule: Area = π × R²
DEFAULT_MIN_MOMENT_00 = np.pi * R ** 2
```

**Exemples:**
- `np.pi * 35 ** 2` = 3848 px² ← Boules loin (ancien seuil)
- `np.pi * 20 ** 2` = 1256 px² ← Boules proches (nouveau?)
- `np.pi * 15 ** 2` = 706 px² ← Très proche

**Impacte:** 
- ↑ Augmenter → Rejette petites boules (sûr mais incomplet)
- ↓ Diminuer → Accepte plus (mais risque faux positifs)

---

### 2. `DEFAULT_MIN_DISTANCE` (Circularité requise)

**Calcul:** Écart-type de la distance de chaque pixel du contour au centre

```python
# Plus bas = forme très circulaire
# Plus haut = tolère formes bizarres

# Exemples:
# - Cercle parfait: ~1-2
# - Cercle légèrement aplati: ~5-10
# - Forme irrégulière: ~20+
```

**Impacte:**
- ↑ Augmenter → Accepte formes bizarres (bruits!)
- ↓ Diminuer → Strictement circulaire (peut rejeter vraies boules)

---

### 3. `Threshold` (Sensibilité au changement)

**Localisation:** [Ligne 56](core/hal/drivers/ball/ball.py#L56)

```python
_, frame = cv2.threshold(frame, 150, 255, cv2.THRESH_BINARY)
#                               ^^^
#                        Valeur actuelle
```

**Gamme recommandée:** 80 à 150

**Impacte:**
- ↑ Augmenter → Moins sensible (demande plus de changement)
- ↓ Diminuer → Plus sensible (capture plus de variations)

---

## 🚀 STRATÉGIE DE DÉBOGAGE

### PHASE 1: Diagnostic Automatique
```bash
python debug_ball_detection.py
```
→ Génère: `RECOMMENDED_PARAMETERS.txt`

### PHASE 2: Test Multi-Seuil (si PHASE 1 échoue)
```bash
python test_ball_detection_thresholds.py
```
→ Teste 7 différents seuils automatiquement

### PHASE 3: Application des Paramètres
Éditer `core/hal/drivers/ball/ball.py`:
- Ligne 22: `DEFAULT_MIN_MOMENT_00`
- Ligne 23: `DEFAULT_MIN_DISTANCE`
- Ligne 56: `threshold` value

### PHASE 4: Teste et Itère
- Relancer l'app
- Observer le dashboard
- Ajuster si besoin

---

## 📁 FICHIERS IMPORTANTS

| Fichier | Rôle |
|---------|------|
| [core/hal/drivers/ball/ball.py](core/hal/drivers/ball/ball.py) | **Logique principale** - Détection |
| [home/calibration_data.json](home/calibration_data.json) | Matrices de projection (mise à jour par calibration) |
| [home/background.jpg](home/background.jpg) | Image de référence (table vide) |
| [home/config.json](home/config.json) | Config caméra (numéro, résolution) |
| [home/apps/balls/processing.py](home/apps/balls/processing.py) | Application qui affiche les boules |
| [core/server/templates/display/main.js](core/server/templates/display/main.js) | Frontend qui dessine les boules |

---

## 🎨 PIPELINE VISUAL

```
╔════════════════════════════════════════════════════════════╗
║             FRAME VIDÉO BRUTE (1920×1080)                  ║
║  [Contient caméra, boules, mains, queue, etc.]             ║
╚════════════════════════════════════════════════════════════╝
                          ↓↓↓ Step 1 ↓↓↓
╔════════════════════════════════════════════════════════════╗
║         ABSDIFF (Soustraction avec background)             ║
║  [Seulement les changements - isolé les boules]            ║
╚════════════════════════════════════════════════════════════╝
                          ↓↓↓ Step 2 ↓↓↓
╔════════════════════════════════════════════════════════════╗
║    PROJECTION PERSPECTIVE (Calibration appliquée)          ║
║  [Aligne les pixels avec la vraie position table]          ║
╚════════════════════════════════════════════════════════════╝
                          ↓↓↓ Step 3 ↓↓↓
╔════════════════════════════════════════════════════════════╗
║              GAUSSIAN BLUR (Lissage)                       ║
║  [Réduit le bruit, améliore contours]                      ║
╚════════════════════════════════════════════════════════════╝
                          ↓↓↓ Step 4 ↓↓↓
╔════════════════════════════════════════════════════════════╗
║         THRESHOLD → IMAGE BINAIRE (Noir/Blanc)             ║
║  [Seuil: 150] → Objectes isolés                            ║
╚════════════════════════════════════════════════════════════╝
                          ↓↓↓ Step 5 ↓↓↓
╔════════════════════════════════════════════════════════════╗
║              FIND CONTOURS                                 ║
║  [Détecte toutes formes]                                   ║
╚════════════════════════════════════════════════════════════╝
                          ↓↓↓ Step 6 ↓↓↓
╔════════════════════════════════════════════════════════════╗
║            APPLIER FILTRES DE SÉLECTION                    ║
║  Filter 1: Aire >= 5026 px²   [Rejette bruits petits]     ║
║  Filter 2: Circulité <= 25    [Accepte cercles]           ║
╚════════════════════════════════════════════════════════════╝
                          ↓↓↓ RÉSULTAT ↓↓↓
╔════════════════════════════════════════════════════════════╗
║         LISTE DE POSITIONS (x, y) DES BOULES              ║
║  [(234, 456), (789, 123), (567, 890), ...]                ║
╚════════════════════════════════════════════════════════════╝
                          ↓↓↓ ENVOI ↓↓↓
╔════════════════════════════════════════════════════════════╗
║         SERVEUR → DASHBOARD → VISUALISATION                ║
║  [Cercles tracés aux positions détectées]                  ║
╚════════════════════════════════════════════════════════════╝
```

---

## 💡 CONSEILS DE DÉPANNAGE

### ✅ Détection fonctionne parfaitement
Rien à faire! Les paramètres sont bons.

### ❌ Aucune boule détectée
**Ordre de diagnostic:**
1. Vérifier `04_threshold.jpg` dans le debug
   - Noir = Threshold trop haut
   - Bruyant = Threshold trop bas
2. Réduire `DEFAULT_MIN_MOMENT_00`
3. Réduire le `threshold` value

### ⚠️ Beaucoup de faux positifs
**Solutions:**
1. Augmenter `DEFAULT_MIN_MOMENT_00`
2. Augmenter `DEFAULT_MIN_DISTANCE` 
3. Augmenter le `threshold` value

### 🔴 Détection instable / Boules sautent
**Cause probable:** Les paramètres sont trop stricts/lâches
**Solution:** Utiliser `test_ball_detection_thresholds.py`

---

## 📞 SUPPORT

Si les problèmes persistent, fournir:
1. Output du script de diagnostic
2. Images de `home/debug_detection/`
3. Nombre de boules visibles vs détectées
4. Description du comportement (boules manquantes, faux positifs, etc.)
