# 🔄 Guide de Migration - Menu v1 → v2

## Pour les Développeurs

Ce guide explique les changements majeurs entre l'ancienne version du menu et la nouvelle, pour vous aider à étendre ou modifier le système.

---

## 📊 Comparaison Architecture

### Ancien Système (v1)
```
Stato global du menu: menu_state (boolean)
Opening animation: opening_menu_percentage (0-100)
Hover detection: basée sur positions X/Y brutes + calculs complexes
Camembert: Un seul timer partagé (pie_chart_time)
Écrans: START (partiel) + SELECT + App running
```

### Nouveau Système (v2)
```
État global: current_screen (string: START|SELECT|DESCRIPTION|PLAYING|PAUSE|IDLE)
Transitions: Gérées par screen_transition_progress
Hover detection: checkPointHover() avec AABB collision
Camembert: Un timer par élément (cell_hover_times, button_hover_times)
Écrans: 6 écrans distincts avec logiques clairement séparées
```

---

## 🔀 Carte de Correspondance Ancienne → Nouvelle

| Concept v1 | Concept v2 | Notes |
|-----------|-----------|-------|
| `show_home_screen` | `current_screen === SCREENS.START` | Bool → État |
| `menu_state` | `current_screen === SCREENS.SELECT` | Inclut aussi DESCRIPTION |
| `opening_menu_percentage` | `screen_transition_progress` | Animation universelle |
| `pie_chart_time` | `cell_hover_times[key]` / `button_hover_times[key]` | Granularité améliorée |
| `hands_position[1][8][0/1]` | Utilise index[0] ou hands_position[1][8] | Plus flexible |
| Inactivité après 15s | Timeout après 2 min (SELECT) + 1 min (PLAYING) | Plus généreux |

---

## 🎯 Fonctions Clés à Comprendre

### State Management

```javascript
// Déterminer quel écran afficher
function determineScreen() {
    // Logique: si condition X, aller à écran Y
    if (current_screen === SCREENS.PLAYING && timeSinceInteraction > idle_timeout) {
        current_screen = SCREENS.IDLE;
    }
}

// Transition douce entre écrans
function goToScreen(screenName) {
    next_screen = screenName;
    screen_transition_progress = 0;  // Réinitialiser animation
}
```

### Hover Detection

```javascript
// Vérifier si hand pointe dans une zone rectangulaire
function checkPointHover(rect_x, rect_y, rect_w, rect_h) {
    let px = hands_position[0][8][0] * width - width/2;
    let py = hands_position[0][8][1] * height - height/2;
    return px > rect_x && px < rect_x + rect_w &&
           py > rect_y && py < rect_y + rect_h;
}
```

### Accumulation Hover Time

```javascript
// Avant d'afficher un élément, accumuler le temps hover
if (is_hovering) {
    const key = `cell_${id}`;
    if (!cell_hover_times[key]) cell_hover_times[key] = 0;
    cell_hover_times[key] += speed_regulator;  // Indépendant du FPS
    hovered_cell_idx = id;
} else {
    cell_hover_times[key] = 0;  // Reset si pas hovering
}

// Puis vérifier si temps écoulé
if (cell_hover_times[key] >= PIE_CHART_DURATION) {
    selectApp(app_name);
    cell_hover_times[key] = 0;
}
```

---

## 🛠️ Comment Ajouter une Nouvelle App

### Étape 1: Ajouter la métadonnée dans `config.json`

```json
{
  "app_metadata": {
    "ma_nouvelle_app": {
      "name": "Ma Nouvelle App",
      "description": "Description courte de l'app",
      "category": "Jeux",  // ou "Mathématiques", "Géométrie", "Éducation"
      "icon": "🎮",
      "color": "#FF6B9D",
      "enabled": true
    }
  },
  "applications": {
    "menu_control": ["ma_nouvelle_app", ...]  // Ajouter ici
  }
}
```

### Étape 2: La grille se met à jour automatiquement ✅
- Les catégories se réorganisent
- La nouvelle app s'affiche dans SELECT
- Aucun changement au menu principal nécessaire

---

## 🎨 Comment Ajouter un Nouvel Écran

Si vous voulez ajouter un écran, par exemple `SETTINGS`:

### Étape 1: Ajouter l'état

```javascript
const SCREENS = {
    // ... écrans existants
    SETTINGS: 'settings'  // Ajouter ici
};
```

### Étape 2: Ajouter la logique de déterminration

```javascript
function determineScreen() {
    // ... conditions existantes
    if (current_screen === SCREENS.SELECT && pressedSettingsButton) {
        goToScreen(SCREENS.SETTINGS);
    }
}
```

### Étape 3: Ajouter le rendu

```javascript
function drawScreenWithTransition() {
    switch (current_screen) {
        // ... cas existants
        case SCREENS.SETTINGS:
            drawSettingsScreen();
            break;
    }
}

function drawSettingsScreen() {
    sketch.push();
    sketch.fill(30, 40, 60);
    sketch.rect(-width/2, -height/2, width, height);
    sketch.pop();
    
    // Votre contenu SETTINGS ici
    // ...
}
```

---

## 🔧 Customization Common

### Changer la durée du camembert

```javascript
const PIE_CHART_DURATION = 2000;  // ms - Ligne ~60
// Modifier cette valeur affecte TOUS les éléments hitables
```

### Changer les timeouts

```javascript
let idle_timeout = 60000;          // 1 minute en jeu
let select_timeout = 120000;       // 2 minutes en SELECT
let idle_countdown_max = 30000;    // 30s dans la menu IDLE
```

### Changer le seuil du geste pause

```javascript
let pause_gesture_threshold = 300;  // pixels horizontales
// Si > 300px entre les 2 mains → PAUSE
```

### Changer les couleurs

```javascript
// Fond écrans
sketch.fill(30, 40, 60);  // RGB bleu foncé

// Boutons
sketch.fill(is_hovering ? 100, 150, 200 : 70, 110, 160);  // RGB light/dark

// Camembert
sketch.fill(100, 200, 100, 150);  // RGB + alpha (vert transparent)
```

### Changer la grille

```javascript
let grid_cols = 2;  // Nombre de colonnes
let grid_rows = 2;  // Nombre de rangées
// Modifier ces valeurs pour afficher plus/moins d'apps par page
```

---

## 🐛 Points de Débogage Utiles

### Afficher les informations de debug

```javascript
function drawDebugInfo() {
    if (true) { // Mettre false pour masquer
        sketch.push();
        sketch.fill(100);
        sketch.textSize(12);
        sketch.textAlign(LEFT);
        sketch.text(`Screen: ${current_screen}`, -width/2 + 10, -height/2 + 20);
        sketch.text(`Hands: ${hands_position.length}`, -width/2 + 10, -height/2 + 40);
        sketch.pop();
    }
}
```

### Logger les transitions d'écran

Ajouter au début de `goToScreen()`:
```javascript
console.log(`Transition: ${current_screen} → ${screenName}`);
```

### Logger les hoverings

Ajouter dans `drawAppCell()`:
```javascript
if (is_hovering) {
    console.log(`Hovering ${app_name}: ${hover_time.toFixed(0)}ms / ${PIE_CHART_DURATION}ms`);
}
```

---

## 📚 Structure du Code

```
display.js (v2.0 - ~750 lignes)
├── Export de la sketch p5
├── Déclaration de variables (50+ variables)
├── preload() - Charger config.json
├── set() - Initialiser canvas, sockets
├── show() - Boucle principale
├── determineScreen() - Logique d'état
├── drawScreenWithTransition() - Dispatcher écrans
├── drawStartScreen()
├── drawSelectScreen()
│   ├── drawCategoryBanner()
│   └── drawAppGrid()
│       └── drawAppCell()
├── drawDescriptionScreen()
├── drawPauseMenu()
├── drawIdleScreen()
├── drawButton() - Bouton réutilisable avec camembert
├── drawPieChart() - Animation du camembert
├── checkPointHover() - Collision main/bouton
├── setupPauseGestureDetection() - Initialiser pause
├── checkPauseGesture() - Détecter geste d'écart
├── organizeByCategories() - Parser metadata
├── selectApp() - Transition vers DESCRIPTION
├── updateTimings() - Gérer les timeouts
└── drawDebugInfo() - Afficher debug
```

---

## 🔗 Flux de Données

```
config.json
  └─→ app_metadata (dict)
      └─→ organizeByCategories()
          └─→ categories (dict by category)
              └─→ drawSelectScreen()
                  └─→ drawAppGrid()
                      └─→ drawAppCell() ×4

hands_position (socket)
  └─→ checkPointHover()
      └─→ cell_hover_times += speed_regulator
          └─→ drawPieChart()
              └─→ Sélection si temps écoulé
                  └─→ selectApp()
                      └─→ goToScreen(DESCRIPTION)
```

---

## 🚀 Performance Tips

### Optimiser les calculs de collision
```javascript
// Mauvais: Recalculer rect à chaque frame
const rect = {x: cell_x - w/2, y: cell_y - h/2, w, h};

// Bon: Stocker les rects une fois
const cell_rect = {x: cell_x - w/2, y: cell_y - h/2, w, h};
const is_hovering = checkPointHover(cell_rect.x, cell_rect.y, cell_rect.w, cell_rect.h);
```

### Éviter les allocations à chaque frame
```javascript
// Mauvais: Nouvelle array chaque frame
let apps = categories[current_cat].map(a => ({...}));

// Bon: Réutiliser la référence du config
const apps_in_category = categories[current_cat] || [];
```

---

## 📖 Ressources Complémentaires

- Documentation complète: [UX_IMPLEMENTATION_v2.md](UX_IMPLEMENTATION_v2.md)
- Guide de test: [UX_TEST_GUIDE.md](UX_TEST_GUIDE.md)
- Code source: [home/apps/menu/display.js](home/apps/menu/display.js)
- Backup v1: [home/apps/menu/display_backup.js](home/apps/menu/display_backup.js)

---

**Créé le**: 20 Mars 2026
**Version**: Migration Guide v1.0
**Status**: 🟢 Complete
