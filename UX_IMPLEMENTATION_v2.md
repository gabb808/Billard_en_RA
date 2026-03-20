# 🎯 UX/UI Refactor - Interactive Pool v2.0

## 📋 Vue d'ensemble

Refonte complète du système de menu avec une UX smooth et intuitive basée sur les interactions tactiles. Le nouveau système permet une navigation fluide entre 5 écrans principaux avec des animations de sélection via "camembert" (pie chart).

---

## 🎨 Architecture des Écrans

### **Écran 1: START (Accueil)**
- **Affichage**: Titre "Interactive Pool" centré et imposant
- **Interaction**: Bouton "START" que l'utilisateur doit hover pendant 2 secondes
- **Animation**: Camembert qui se remplit pour indiquer la progression
- **Exit**: 30 secondes d'inactivité → Retour auto à START (optionnel)
- **Audio**: Musique d'ouverture au lancement

```
┌─────────────────────────────────┐
│                                 │
│      INTERACTIVE POOL           │
│                                 │
│          [ START ]◆             │  ◆ = camembert qui se remplit
│                                 │
│  Passez votre main au-dessus... │
│                                 │
└─────────────────────────────────┘
```

### **Écran 2: SELECT (Sélection d'App)**
- **Bannière catégories**: En haut, affiche la catégorie courante
- **Boutons navigation**: ◀ et ▶ pour changer de catégorie
- **Grille 2×2**: Affiche 4 applications avec icône et nom
- **Statut app**: Indication "(Actif)" si l'app tourne déjà
- **Sélection**: Hover + camembert 2s pour sélectionner
- **Timeout**: 2 minutes d'inactivité → Retour à START
- **Feedback**: Décompte visible si < 30s avant timeout

```
┌──────────────────────────────────┐
│  Catégorie: [Jeux]  ◀ Jeux ▶     │  ← Bannière catégorie
│                                  │
│  ┌────────────┐  ┌────────────┐ │
│  │  🐰 Rabbits│  │  📐 Affine │ │
│  │  [Game]    │  │  [Geom]    │ │
│  └────────────┘  └────────────┘ │
│  ┌────────────┐  ┌────────────┐ │
│  │  △ Tri. 1  │  │  📚 Tri. 2 │ │
│  │  [Lesson]  │  │  [Lesson]  │ │
│  └────────────┘  └────────────┘ │
│                                  │
│         Retour dans 120s        │  ← Timeout warning
└──────────────────────────────────┘
```

### **Écran 3: DESCRIPTION (Détail App)**
- **Gauche**: Titre + Description textuelle (wrap auto)
- **Droite**: Image/Icône de l'app
- **Bouton Retour**: ◄ Retour (hover 2s) → SELECT
- **Bouton Play**: Play ► (hover 2s) → Lance l'app
- **Animation**: Camembert sur tous les boutons

```
┌────────────────────────────────────┐
│ Rabbits Game        │    🐰 Icon   │
│                     │               │
│ Jeu éducatif        │               │
│ amusant pour        │ [App Image]   │
│ apprendre les       │               │
│ mathématiques       │               │
│                     │               │
│  [◄ Retour]        [Play ►]        │
└────────────────────────────────────┘
```

### **Écran 4: PAUSE (Menu En-Jeu)**
- **Trigger**: Écarter les deux mains horizontalement (>300px de distance)
- **Menu**: 3 boutons empilés
  - **Reprendre**: Continue le jeu (retour PLAYING)
  - **Redémarrer**: Relance l'app depuis le début
  - **Menu**: Retour à SELECT
- **Backdrop**: Fond semi-transparent pour focus

```
╔════════════════════════╗
║     == PAUSE ==        ║
║                        ║
║  [ Reprendre ] ◆       ║
║  [ Redémarrer ] ◆      ║
║  [ Menu ] ◆            ║
║                        ║
╚════════════════════════╝
```

### **Écran 5: IDLE (Inactivité)**
- **Trigger**: >1 minute sans interaction pendant l'app
- **Message**: "Êtes-vous toujours là ?"
- **Boutons**: 
  - **Continuer**: Reprend l'app
  - **Retour Menu**: Retour à SELECT
- **Countdown**: Compte à rebours 30s
- **Auto-exit**: Après 30s → Retour START

```
┌──────────────────────────┐
│                          │
│  Êtes-vous toujours là ? │
│                          │
│ [Continuer] ◆  [Menu] ◆  │
│                          │
│ Retour à l'accueil dans 30s │
│                          │
└──────────────────────────┘
```

---

## 🎮 Système d'Interaction

### Gestures

| Geste | Durée | Effet | Écran |
|-------|-------|-------|-------|
| Hover hand over element | 2s | Camembert qui se remplit | Sélect, Desc, Pause, Idle |
| Écarter les mains horizontalement | 0.25s | Ouve menu PAUSE | Playing |

### Animation Camembert
- **Durée**: 2 secondes (configurable via `PIE_CHART_DURATION`)
- **Visuel**: Arc en PIE qui se remplit de 0° à 360°
- **Couleur**: Vert translucide (100, 200, 100, 150)
- **Feedback**: L'utilisateur voit la progression en temps réel

### Timeouts

| Écran | Action | Durée |
|-------|--------|-------|
| SELECT | Retour START | 2 minutes (120s) |
| IDLE | Auto-exit vers START | 30 secondes |
| Hover any button | Sélection | 2 secondes |

---

## 🔧 Implémentation Technique

### Architecture d'État
```javascript
const SCREENS = {
    START: 'start',              // Accueil
    SELECT: 'select',            // Sélection app
    DESCRIPTION: 'description',  // Détail app
    PLAYING: 'playing',          // App en cours
    PAUSE: 'pause',              // Menu pause
    IDLE: 'idle'                 // Inactivité
};
```

### Gestion du Hovering

**Avant** (ancien système):
```javascript
// Accumulation maladroite du pie_chart_time
pie_chart_time += speed_regulator * (1000 / 50);
```

**Après** (nouveau système):
```javascript
// Dictionnaire par élément avec tracking précis
cell_hover_times[`cell_${idx}`] += speed_regulator;
button_hover_times[button_id] += speed_regulator;
```

**Bénéfices**:
- ✅ Plusieurs éléments hitables simultanément
- ✅ Pas de conflits entre cellules de grille et boutons
- ✅ Reset automatique lors du unhover

### Détection Main

```javascript
function checkPointHover(rect_x, rect_y, rect_w, rect_h) {
    // Récupère position normalisée (0-1) de la main
    let px = hands_position[0][8][0] * width;
    let py = hands_position[0][8][1] * height;
    
    // Convertit pour système WEBGL (-width/2 à width/2)
    px = px - width/2;
    py = py - height/2;
    
    // Rectangle collision check
    return px > rect_x && px < rect_x + rect_w &&
           py > rect_y && py < rect_y + rect_h;
}
```

### Détection Geste Pause

```javascript
function checkPauseGesture() {
    // Distance horizontale entre index des 2 mains
    const distance = Math.abs(hand1_x - hand2_x);
    
    if (distance > 300) {  // Seuil: 300 pixels
        pause_gesture_frames++;
        if (pause_gesture_frames > 15) {  // ~0.25s à 60fps
            current_screen = SCREENS.PAUSE;
        }
    }
}
```

---

## 📊 Nouvelle Grille d'Applications

### Configuration
| Param | Valeur | Notes |
|-------|--------|-------|
| grid_cols | 2 | Au lieu de 3 |
| grid_rows | 2 | Au lieu de 2 |
| Total cellules | 4 | Affichage par catégorie |
| Camembert durée | 2000ms | Identique pour tous les éléments |

### Avantages
- ✅ Écran moins encombré
- ✅ Cellules plus grandes → easier to target
- ✅ Catégories mieux organisées
- ✅ Meilleur spacing

---

## 🌍 Catégories d'Applications

Du `config.json`:
```json
"app_metadata": {
    "rabbits_game": {
        "category": "Jeux",
        "icon": "🐰"
    },
    "affine": {
        "category": "Mathématiques",
        "icon": "📐"
    },
    "triangles_remarkable_lines": {
        "category": "Géométrie",
        "icon": "△"
    },
    "triangles_full_lesson": {
        "category": "Éducation",
        "icon": "📚"
    }
}
```

### Navigation Catégories
- Boutons ◀ ▶ en haut de la grille
- Navigation circulaire (min/max sur edges)
- Label clair de la catégorie actuelle

---

## 🎵 Audio Feedback

| Action | Fichier | Effet |
|--------|---------|-------|
| Démarrer (START→SELECT) | `opening_menu.mp3` | Jingle d'ouverture |
| Clic de sélection | `click.mp3` | Bip de confirmation |
| Retour menu | `click.mp3` | Même bip |

---

## 🔄 Flux de Navigation

```
┌─────────┐
│  START  │ ← Accueil, Retour inactivité 30s
└────┬────┘
     │ START button (2s hover)
     ↓
┌─────────────────┐
│  SELECT         │ ← Grille 2×2, Catégories
│ + Timeout 2min  │
└────┬──────┬─────┘
     │ Cat◀▶│ 
     │ Hover│ App item (2s hover)
     │      ↓
     │  ┌────────────┐
     │  │ DESCRIPTION│ ← Détail + Play
     │  └────┬───────┘
     │       │ Play button (2s hover)
     │       ↓
     │  ┌───────────┐
     │  │ PLAYING   │ ← App tourne
     │  │+ Geste    │
     │  │Pause      ├──→ [Geste écart mains] → PAUSE
     │  │+ Timeout  ├──→ [>1min inactivité] → IDLE
     │  └───────────┘
     │
     └──→ SELECT (via Retour depuis DESC)
     └──→ SELECT (via Menu depuis PAUSE)
     └──→ SELECT (via Retour Menu depuis IDLE)
```

---

## 📝 Checklist Implémentation

- [x] Architecture d'état à 5 écrans
- [x] Système d'hovering robuste avec tracking par élément
- [x] Animation camembert lisse (PIE chart)
- [x] Écran START avec bouton
- [x] Écran SELECT avec catégories et grille 2×2
- [x] Écran DESCRIPTION avec détails app
- [x] Menu PAUSE à geste horizontal
- [x] Menu IDLE avec countdown
- [x] Timeouts auto (2min SELECT, 1min→IDLE, 30s IDLE→START)
- [x] Audio feedback sur actions
- [x] Gestion des apps déjà en cours (label "Actif")
- [x] Conversion coordonnées main pour WEBGL

---

## ⚡ Performance & Smoothness

| Aspect | Implémentation |
|--------|-----------------|
| Frame-rate adaptation | `speed_regulator = 50 / fps` |
| Hover accumulation | Basée sur frame (independant FPS) |
| Transitions d'écran | Direct (pas de fade pour simplicité) |
| Calculs de collision | Simple AABB rect check |
| État du jeu | Minimal (pas de state complex) |

---

## 📋 Prochaines Améliorations Possibles

1. **Transitions visuelles**: Fade in/out entre écrans
2. **Animations spray**: Effet visuel lors du hover
3. **Son amb ambiant**: Background music subtile
4. **Vibration haptic**: Si disponible sur le hardware
5. **Historique apps**: Suggestion des dernières apps utilisées
6. **Recherche rapide**: Typing geste pour filtrer apps
7. **Thème sombre/clair**: Toggle dans settings

---

## 🚀 Utilisation et Tests

### Pour tester le système en complet:
```bash
# Démarrer l'application
cd /chemin/vers/Billard_en_RA-main
python init.py

# L'écran START s'affiche
# Hover le bouton START pendant 2s → Zoom sur SELECT
# Hover les apps pendant 2s → DESCRIPTION
# Lancer une app → PLAYING
# Écarter les mains horizontalement → PAUSE
# Attendre >1 min → IDLE
```

### Fichiers modifiés:
- ✅ `home/apps/menu/display.js` - Complètement refondu
- `home/apps/menu/processing.py` - Pas de modification
- `home/config.json` - Compatible (pas de changement requis)

---

**Créé le**: 20 Mars 2026
**Version**: 2.0 - Complete UX Refactor
**Status**: 🟢 Ready for Testing
