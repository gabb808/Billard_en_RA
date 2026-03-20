# ⚡ Quick Reference - UX v2.0

## 🎯 30-Second Summary

Vu qu'il y a BEAUCOUP de documentation, voici l'essentiel :

```
START (Bouton)
   ↓ 2s hover
SELECT (Grille 2×2)
   ↓ 2s hover sur app
DESCRIPTION (Play/Retour)
   ↓ Play button
PLAYING
   ↓ Écarter mains → PAUSE
   ↓ 1min inactivité → IDLE
IDLE (30s countdown)
   ↓ Timeout ou Menu → START
```

**À retenir**: Tout utilise le même système (camembert 2s) = SIMPLE et SMOOTH ✅

---

## 🧪 Tests Essentiels

```
1. START → hover bouton (2s) → ok?
2. SELECT → grille visible? Catégories ok?
3. DESC → Play button visible?
4. PAUSE → écarter les mains, menu apparaît?
5. IDLE → 1min inactivité, compte à rebours?
```

**Si ok**: 🟢 Production ready
**Si bug**: Voir UX_TEST_GUIDE.md → dépannage

---

## 🔧 Modifier Quelque Chose

### Changer durée camembert
```javascript
// Fichier: home/apps/menu/display.js, Ligne ~60
const PIE_CHART_DURATION = 2000;  // → 3000 pour 3s
```

### Changer timeout SELECT
```javascript
let select_timeout = 120000;  // actuellement 2 min
// → 180000 pour 3 min
```

### Changer taille grille
```javascript
let grid_cols = 2;  // → 3 pour 3 colonnes
let grid_rows = 2;  // → 3 pour 3 rangées
```

---

## 📂 Fichiers à Connaître

| Fichier | Quand le lire |
|---------|--------|
| display.js | Comprendre le code / modifier |
| UX_IMPLEMENTATION_v2.md | Comprendre le concept |
| UX_TEST_GUIDE.md | Tester / déboguer |
| MIGRATION_GUIDE.md | Ajouter feature |
| INDEX_DOCUMENTATION.md | Naviguer la doc |

---

## ⚠️ Bugs Courants

| Bug | Solution |
|-----|----------|
| Main pas détectée | Vérifier camera + caméras dans display.js |
| Camembert ne se remplit pas | Vérifier `checkPointHover()` |
| Pause ne s'ouvre pas | Vérifier `hands_position.length >= 2` |
| Transition écran figée | Vérifier `last_interaction_time` |

**Plus de détails**: UX_TEST_GUIDE.md → Dépannage

---

## 📞 Besoin d'Aide

- **Quoi tester?** → UX_TEST_GUIDE.md
- **Comment ça marche?** → UX_IMPLEMENTATION_v2.md  
- **Comment modifier?** → MIGRATION_GUIDE.md
- **Je suis perdu.e** → INDEX_DOCUMENTATION.md

---

## 🚀 Comando Rapide

### Copier le backup
```bash
cp display_backup.js display.js
```

### Voir la config
```bash
cat home/config.json | grep app_metadata -A 50
```

### Lancer l'app
```bash
python init.py
```

---

**Créé le**: 20 Mars 2026
**Durée de lecture**: 2 minutes
**Utilité**: Très haute si vous êtes occupé(e) ⚡
