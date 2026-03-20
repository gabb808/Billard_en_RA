# 🧪 Guide de Test - UX/UI v2.0

## ✅ Checklist de Vérification

### Écran START
- [ ] Affichage du titre "Interactive Pool" bien centré
- [ ] Bouton START visible et clickable
- [ ] Hover du bouton START durant 2s → Transition vers SELECT
- [ ] Camembert se remplit progressivement pendant 2s
- [ ] Audio "opening_menu" joue lors du démarrage

### Écran SELECT
- [ ] Grille 2×2 d'applications affichée
- [ ] Bannière catégorie en haut avec le nom "Jeux", "Mathématiques", etc.
- [ ] Boutons ◀ et ▶ pour naviguer les catégories
- [ ] Icônes + noms des apps affichés correctement
- [ ] Apps en cours marquées "(Actif)" en vert
- [ ] Hover app durant 2s → Transition vers DESCRIPTION
- [ ] Timeout affiche un avertissement "Retour dans Xs" si < 30s
- [ ] **2 min d'inactivité** → Retour automatique à START

### Écran DESCRIPTION
- [ ] Titre de l'app affiché
- [ ] Description textuelle avec wrap auto
- [ ] Icône/image de l'app affichée à droite
- [ ] Bouton "◄ Retour" → Retour à SELECT
- [ ] Bouton "Play ►" → Lance l'app
- [ ] Camembert se remplit sur les boutons

### Pendant le Jeu (PLAYING)
- [ ] Menu n'apparaît pas automatiquement
- [ ] **Écarter les mains >300px horizontalement** → Menu PAUSE s'ouvre
- [ ] **1 min d'inactivité** → Menu IDLE s'affiche

### Menu PAUSE (en jeu)
- [ ] Trigger: écarter les 2 mains horizontalement
- [ ] 3 boutons affichés:
  - "Reprendre" → Retour au jeu
  - "Redémarrer" → Relance l'app
  - "Menu" → Retour SELECT
- [ ] Fond semi-transparent pour meilleur focus
- [ ] Camembert sur chaque bouton

### Menu IDLE (après 1 min inactivité)
- [ ] Message "Êtes-vous toujours là ?" affiché
- [ ] 2 boutons: "Continuer" et "Retour Menu"
- [ ] Compte à rebours 30s affiché clairement
- [ ] **30s d'inactivité** → Retour automatique à START

---

## 🐛 Dépannage

### Problème: Hover ne détecte pas la main
**Possible cause**: Les coordonnées de la main ne sont pas correctement normalisées
**Solution**: Vérifier que `hands_position[0][8]` retourne (0-1, 0-1)

### Problème: Camembert ne s'accumule pas
**Possible cause**: La condition de hover n'est pas continue
**Solution**: Vérifier `checkPointHover()` renvoie true pendant 2s

### Problème: Pause ne s'ouvre pas
**Possible cause**: `hands_position` n'a que 1 main
**Solution**: Vérifier que 2 mains sont détectées dans `hands_position.length >= 2`

### Problème: Timeout SELECT ne fonctionne pas
**Possible cause**: `select_inactivity_start` n'est pas réinitialisé
**Solution**: Vérifier `select_inactivity_start = millis()` dans START→SELECT

---

## 🎯 Cas de Test Complets

### Test 1: Navigation Complète
1. Voir START
2. Hover START 2s → SELECT
3. Voir grille 2×2
4. Hover app 2s → DESCRIPTION
5. Hover Play 2s → App lance
6. ✅ Si OK, continue avec Test 2

### Test 2: Geste Pause
1. App en cours
2. Écarter les 2 mains horizontalement
3. Menu PAUSE
4. Hover "Reprendre" → retour jeu
5. ✅ Gesture OK

### Test 3: Timeout IDLE
1. App en cours
2. Ne rien faire pendant 1min02s
3. Menu IDLE s'affiche
4. Timeout affiche 00:30
5. Attendre 30s ou hover un bouton
6. ✅ Timeout OK

### Test 4: Navigation Catégories
1. SELECT écran
2. Hover bouton ▶ 2s
3. Catégorie change (ex: "Jeux" → "Mathématiques")
4. Grille se met à jour
5. ✅ Categories OK

---

## 📊 Métriques de Performance

| Métrique | Cible | OK? |
|----------|-------|-----|
| FPS stable | 60 fps | ⏳ À vérifier |
| Latence hover→camembert | <100ms | ⏳ À vérifier |
| Transition écran | Smooth | ⏳ À vérifier |
| Camembert rempli | 2000ms exact | ⏳ À vérifier |
| Réactivité pause geste | <250ms | ⏳ À vérifier |

---

## 📝 Notes de Test

**Date de test**: _____________
**Testeur**: _____________
**Environnement**: Windows / Linux / Mac

### Observations:
- 

### Bugs trouvés:
- 

### Améliorations suggérées:
- 

---

## 🚀 Prochaines Étapes

### Si tous les tests passent ✅
- Déployer en production
- Collecter feedback utilisateurs
- Planifier v2.1

### Si des bugs sont trouvés 🔴
1. Documenter le bug precisely
2. Débuger avec `drawDebugInfo()` (mettre `true` ligne 696)
3. Corriger et revérifier

### Futures améliorations
- [ ] Transitions fade in/out
- [ ] Sons d'ambiance subtils
- [ ] Animations spray on hover
- [ ] Recherche rapide d'apps
- [ ] Historique des apps récentes
