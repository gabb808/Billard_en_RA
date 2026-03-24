# 🎯 GUIDE DE RÉSOLUTION: Détection des Boules de Billard

## 📋 RÉSUMÉ DU PROBLÈME

- ✅ Background.jpg a été mis à jour par la calibration
- ✅ Calibration_data.json a été mis à jour 
- ❌ **MAIS** vous avez bougé la caméra → **les boules changent de taille en pixels**
- ❌ Les seuils de détection n'ont pas été ré-ajustés pour la nouvelle distance
- ❌ Résultat: Les seuils sont trop stricts = aucune boule détectée

---

## 🔧 ÉTAPES DE RÉSOLUTION

### ÉTAPE 1: Lancer le diagnostic (5 minutes)

```bash
# Dans le terminal du projet:
python debug_ball_detection.py
```

**Ce que fait le script:**
1. Charge la calibration sauvegardée
2. Vous demande de placer les boules
3. Capture une frame avec les boules
4. Analyse chaque étape du traitement:
   - AbsDiff (soustraction with background)
   - Warped projection (perspective)
   - Blurred (flou)
   - Thresholded (seuil)
   - Contours (détection)
5. **Mesure la taille réelle des boules en pixels**
6. **Génère des recommandations automatiques**

**Output attendu:**
- `home/debug_detection/01_absdiff.jpg` → ce qui change depuis le background
- `home/debug_detection/02_warped.jpg` → après projection perspective
- `home/debug_detection/03_blurred.jpg` → après flou
- `home/debug_detection/04_threshold.jpg` → image binaire
- `home/debug_detection/05_detected_balls.jpg` → boules détectées (cercles verts)
- `home/debug_detection/RECOMMENDED_PARAMETERS.txt` → **paramètres à appliquer**

---

### ÉTAPE 2: Examiner les résultats

**Dans le terminal, vous verrez:**

```
✅ BOULES DÉTECTÉES: 15   (exemple: doit être > 10)

📊 STATISTIQUES:
Aire (pixels²):
  • Min: 1200      ← Importante! Votre plus petite boule
  • Max: 1800
  • Moyenne: 1500

Circularité (écart-type):
  • Min: 0.5
  • Max: 12.0      ← Importante! Votre forme la moins circulaire

✅ PARAMÈTRES RECOMMANDÉS:
  • DEFAULT_MIN_MOMENT_00 = np.pi * 18 ** 2    (valeur: ~1018 au lieu de 5026)
  • DEFAULT_MIN_DISTANCE = 15
    (valeur: ~15 au lieu de 25)
```

---

### ÉTAPE 3: Appliquer les paramètres recommandés

**Ouvrir le fichier:**  
`core/hal/drivers/ball/ball.py`

**Localiser (vers ligne 22-23):**
```python
DEFAULT_MIN_MOMENT_00 = np.pi * 35 ** 2  # De 15 à 35 (5026 au lieu de 706 pixels)
DEFAULT_MIN_DISTANCE = 25  # De 10 à 25 pour être plus strict sur la circularité
```

**Remplacer par les valeurs du fichier RECOMMENDED_PARAMETERS.txt**  
Par exemple:
```python
DEFAULT_MIN_MOMENT_00 = np.pi * 18 ** 2  # Basé sur diagnostic réel
DEFAULT_MIN_DISTANCE = 15                # Basé sur diagnostic réel
```

---

### ÉTAPE 4: Tester les changements

**Relancer l'application:**
```bash
# Redémarrer le service ou l'application pool interactive
```

**Vérifier:**
- Les boules apparaissent-elles dans le dashboard?
- Avez-vous le bon nombre de boules détectées?

---

## 🔍 DIAGNOSTIC AVANCÉ (si ça ne marche pas)

### Si aucune boule n'est détectée:

**Le problème vient probablement du seuil du threshold (150):**

```python
# Dans detect_balls(), ligne 56:
_, frame = cv2.threshold(frame, 150, 255, cv2.THRESH_BINARY)
#                               ^^^
#                        Essayer: 120, 100, 80
```

1. Réduisez le seuil à 120
2. Relancez le diagnostic
3. Vérifiez l'image `04_threshold.jpg`
   - Si noire → seuil trop élevé
   - Si couronnée de bruits → seuil trop bas

### Si trop de faux positifs détectés:

Vous détectez des bruits au lieu de boules. Remédier:

```python
# Augmenter les seuils progressivement:
DEFAULT_MIN_MOMENT_00 = np.pi * 20 ** 2  # Au lieu de 18
DEFAULT_MIN_DISTANCE = 18                 # Au lieu de 15
```

---

## 📊 COMPRENDRE LES PARAMÈTRES

| Paramètre | Rôle | Si augmente | Si diminue |
|-----------|------|-----------|----------|
| **MIN_MOMENT_00** | Taille mini d'une boule |Rejette les petites boules| Accepte les bruits|
| **MIN_DISTANCE** | Circularité requise | Accepte formes bizarres | Rejette même cercles |
| **Threshold** | Sensibilité à la différence | Moins sensible | Plus sensible |

**Pour la caméra bougée (boules plus petites/grandes):**
- Si boules plus petites → **diminuer MIN_MOMENT_00**
- Si boules plus éloignées → **augmenter MIN_MOMENT_00**

---

## 📝 CHECKLIST FINALE

- [ ] Script `debug_ball_detection.py` créé ✓
- [ ] Boules placées sur la table
- [ ] Script exécuté: `python debug_ball_detection.py`
- [ ] Images de debug examinées
- [ ] `RECOMMENDED_PARAMETERS.txt` lu
- [ ] Valeurs appliquées dans `ball.py`
- [ ] Application redémarrée
- [ ] Boules détectées ✓

---

## 🆘 AIDE SUPPLÉMENTAIRE

Si les problèmes persistent:

**Questions de diagnostic:**
1. Combien de boules voyez-vous dans `05_detected_balls.jpg`?
2. Quelle est la taille généralement affichée dans les stats?
3. L'image `04_threshold.jpg` est-elle bien contrастée (noir/blanc)?
4. Y a-t-il du bruit dans `04_threshold.jpg`?

**Importer ces images dans le debug pour que je puisse mieux les analyser.**
