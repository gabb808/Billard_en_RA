# ⚡ QUICK START - Commandes Rapides

## 🚀 Pour Résoudre le Problème en 10 Minutes

### Étape 1: Lancer le diagnostic (5 min)

**Terminal:**
```bash
cd c:\Users\hugoj\OneDrive\Documents\projet-billard
python debug_ball_detection.py
```

**Attendez → Le script vous demandera de placer les boules sur la table**

### Étape 2: Observer les résultats

Le terminal affichera quelque chose comme:

```
✅ BOULES DÉTECTÉES: 16

📈 STATISTIQUES:
Aire (pixels²):
  • Min: 1200
  • Max: 1850
  • Moyenne: 1500

Circularité (écart-type):
  • Min: 0.8
  • Max: 12.5

✅ PARAMÈTRES RECOMMANDÉS:
  • DEFAULT_MIN_MOMENT_00 = np.pi * 18 ** 2
  • DEFAULT_MIN_DISTANCE = 15
```

### Étape 3: Appliquer les changements

**Fichier à éditer:**
```
core/hal/drivers/ball/ball.py
```

**À modifier (autour ligne 22-23):**
```python
# AVANT:
DEFAULT_MIN_MOMENT_00 = np.pi * 35 ** 2  # 5026
DEFAULT_MIN_DISTANCE = 25

# APRÈS (remplacer par les valeurs du diagnostic):
DEFAULT_MIN_MOMENT_00 = np.pi * 18 ** 2  # 1018 (EXEMPLE!)
DEFAULT_MIN_DISTANCE = 15                 # (EXEMPLE!)
```

### Étape 4: Redémarrer l'app

```bash
# Arrêter et redémarrer votre service/application
```

### Étape 5: Vérifier

Vérifier dans le dashboard que les boules sont détectées ✅

---

## 🔍 Si Ça N'a Pas Marché...

### Test avancé multi-seuil (2 min):

```bash
python test_ball_detection_thresholds.py
```

**Cela testera automatiquement:**
- 7 différents threshold values
- Distribution réelle des aires
- Distribution réelle des circularités
- Recommandations optimales

### Debug images (regarder ces fichiers):

```
home/debug_detection/
├── 01_absdiff.jpg           ← Différences avec background
├── 02_warped.jpg            ← Après correction perspective
├── 03_blurred.jpg           ← Après lissage
├── 04_threshold.jpg         ← Image binaire (noir/blanc)
└── 05_detected_balls.jpg    ← Boules détectées (cercles verts)
```

**À vérifier:**
- `04_threshold.jpg`: Doit avoir du blanc clair pour les boules
- `05_detected_balls.jpg`: Doit voir les cercles verts sur les boules

---

## 📋 Paramètres Typiques par Distance Caméra

| Distance | Rayon (px) | Formula | MIN_MOMENT_00 |
|----------|-----------|---------|--------------|
| **Très proche** | 12-15 | `π * 12²` | ~450 |
| **Proche** | 15-20 | `π * 17²` | ~900 |
| **Normal** | 20-30 | `π * 25²` | ~1960 |
| **Éloigné** | 30-40 | `π * 35²` | **5026** (courant) |
| **Très loin** | 40+ | `π * 45²` | ~6360 |

**Comment choisir:** Regarder l'image `05_detected_balls.jpg`
- Les cercles verts doivent être légèrement plus petits que les boules réelles

---

## 🛑 Cas Spéciaux

### Si encore aucune boule après appliquer les paramètres:

**Essayer de réduire le threshold:**

```python
# Ligne 56 dans ball.py:
# AVANT:
_, frame = cv2.threshold(frame, 150, 255, cv2.THRESH_BINARY)

# ESSAYER:
_, frame = cv2.threshold(frame, 100, 255, cv2.THRESH_BINARY)  # Plus sensible
```

Puis relancer le diagnostic.

### Si trop de faux positifs:

**Augmenter progressivement:**

```python
# Augmenter l'une ou les deux:
DEFAULT_MIN_MOMENT_00 = np.pi * 20 ** 2  # De 18 à 20 par ex
DEFAULT_MIN_DISTANCE = 18                 # De 15 à 18 par ex
```

---

## 📞 Besoin d'Aide?

Si les boules ne sont **toujours pas** détectées:

1. Prenez une capture de `home/debug_detection/04_threshold.jpg`
2. Décrivez ce que vous voyez:
   - Noire? → Threshold trop haut
   - Bruyante? → Threshold trop bas
   - Normal? → Problème ailleurs

3. Nombre de boules visibles vs détectées dans `05_detected_balls.jpg`

---

## ✅ Checklist Finale

- [ ] Scripts créés dans le répertoire racine
- [ ] `python debug_ball_detection.py` exécuté
- [ ] Paramètres appliqués dans `ball.py`
- [ ] App redémarrée
- [ ] Boules détectées dans le dashboard ✓

