# 🛠️ Guide de Développement - Extension du Système

Ce guide montre comment ajouter de nouvelles applications au menu amélioré du Billard en RA.

---

## 📦 Structure des Métadonnées d'Application

### Format JSON dans `config.json`

```json
{
  "applications": {
    "menu_control": ["nom_app_1", "nom_app_2"]
  },
  "app_metadata": {
    "nom_app_1": {
      "name": "Nom Affiché",
      "description": "Brève description (1 ligne)",
      "category": "Catégorie",
      "icon": "🎯",
      "color": "#FF6B9D",
      "enabled": true
    }
  }
}
```

### Champs Expliqués

| Champ | Type | Exemple | Notes |
|-------|------|---------|-------|
| `name` | String | "Mon App" | Nom affiché dans le menu (max 20 chars) |
| `description` | String | "Fait quelque chose" | Visible au survol (optional) |
| `category` | String | "Éducation" | Groupe l'app avec d'autres |
| `icon` | String | "🎯" | Emoji Unicode (1 seul caractère) |
| `color` | String | "#FF6B9D" | Couleur hexadécimale RGB |
| `enabled` | Boolean | true | `true` = visible, `false` = caché |

---

## 🎨 Palette de Couleurs Recommandées

Pour maintenir la cohérence visuelle:

```json
{
  "Éducation": {
    "primary": "#FF6B9D",
    "secondary": "#F5A623"
  },
  "Jeux": {
    "primary": "#7ED321",
    "secondary": "#B8E986"
  },
  "Mathématiques": {
    "primary": "#4A90E2",
    "secondary": "#357ABD"
  },
  "Géométrie": {
    "primary": "#50E3C2",
    "secondary": "#2DBFAA"
  },
  "Outils": {
    "primary": "#BD10E0",
    "secondary": "#8B0EAE"
  }
}
```

---

## 📱 Icônes Recommandés

Classement par catégorie:

### 🎓 Éducation
- 📚 Livre (Cours/Leçons)
- 🎓 Mortier (Académique)
- 📖 Livre ouvert (Tutoriels)
- 📝 Bloc-notes (Exercices)

### 🎮 Jeux
- 🐰 Lapin (Jeux de vitesse)
- 🎯 Cible (Jeux de précision)
- 🎲 Dés (Jeux aléatoires)
- 🏆 Trophée (Compétitions)

### 📐 Mathématiques
- 📐 Équerre (Géométrie)
- 🔢 Chiffres (Arithmétique)
- 🧮 Boulier (Calculs)
- 📊 Graphique (Données)

### △ Géométrie
- △ Triangle (Formes)
- ⭕ Cercle (Courbes)
- 🔷 Losange (Polygones)
- ✨ Étoile (Propriétés)

### ⚙️ Outils/Configuration
- ⚙️ Engrenage (Paramètres)
- 🔧 Outils (Maintenance)
- 💾 Sauvegarder (Données)
- 📡 Signal (Réseaux)

---

## 🚀 Ajouter une Nouvelle Application (Tutoriel Complet)

### Étape 1: Créer la Strukture de l'App

```bash
home/apps/mon_app/
├── display.js       # Interface p5.js
├── processing.py    # Logique Python
├── components/      # Ressources (images, sons)
└── README.md        # Documentation spécifique
```

### Étape 2: Créer `processing.py`

```python
from core.application import BaseApplication

class Application(BaseApplication):
    """Description courte de mon app"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        
        # Déclarer les ressources requises
        # self.requires = {
        #     "camera": ["raw_frame"],
        #     "hand_pose": ["raw_data"]
        # }

    def listener(self, source, event, data):
        super().listener(source, event, data)
        
        if source == "camera" and event == "raw_frame":
            # Traiter les données de la caméra
            self.server.send_data(self.name, processed_data)
```

### Étape 3: Créer `display.js`

```javascript
import { BaseApplication } from "./path_to_base.js";

export const mon_app = new p5((sketch) => {
    sketch.name = "mon_app";
    sketch.activated = false;

    // Variables
    let data = {};
    let socket;

    sketch.preload = () => {
        // Charger les ressources (images, fonts, etc)
    };

    sketch.set = (width, height, socket_io) => {
        sketch.createCanvas(width, height, sketch.WEBGL);
        sketch.activated = true;
        socket = socket_io;

        // Écouter les données du serveur
        socket.on("mon_app", (received_data) => {
            data = received_data;
        });

        // Envoyer les événements
        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };
    };

    sketch.show = () => {
        sketch.background(0);
        
        // Dessiner votre interface
        sketch.fill(255);
        sketch.rect(100, 100, 200, 200);
    };
});
```

### Étape 4: Ajouter dans `config.json`

```json
{
    "applications": {
        "menu_control": [
            "rabbits_game",
            "affine",
            "mon_app"  // ← Ajouter ici
        ]
    },
    "app_metadata": {
        "mon_app": {
            "name": "Mon Application",
            "description": "Brève description de ce que fait l'app",
            "category": "Éducation",
            "icon": "🎯",
            "color": "#FF6B9D",
            "enabled": true
        }
    }
}
```

### Étape 5: Redémarrer le Serveur

```bash
python init.py
```

✅ Votre application apparaîtra maintenant dans le menu!

---

## 🎯 Recommandations de Conception

### Pour une Bonne Intégration

1. **Taille de la Fenêtre**
   - Utiliser `sketch.WEBGL` pour 3D
   - Supporter la fullscreen (1920×1080)
   - Responsive aux changements de taille

2. **Gestion des Données**
   - Envoyer les données minimales
   - Utiliser Redis pour la communication
   - Implémenter des cooldowns pour les actions

3. **Performance**
   - Viser 60 FPS minimum
   - Optimiser les rendus p5.js
   - Utiliser le GPU si possible

4. **Accessibilité**
   - Utiliser des couleurs contrastées
   - Supporter la détection de mains
   - Fournir du feedback auditif

### Code de Base - Application Simple

```javascript
export const mon_app = new p5((sketch) => {
    sketch.name = "mon_app";
    sketch.activated = false;

    let hands = [];
    let selected_item = 0;

    sketch.set = (width, height, socket) => {
        sketch.createCanvas(width, height);
        sketch.activated = true;

        socket.on("mon_app", (data) => {
            hands = data.hands_landmarks || [];
        });

        sketch.emit = (name, data) => socket.emit(name, data);
    };

    sketch.draw = () => {
        sketch.background(20);
        
        // Détection des mains
        if (hands.length > 0) {
            let hand_x = hands[0][8][0] * width;
            let hand_y = hands[0][8][1] * height;
            
            sketch.fill(255, 0, 0);
            sketch.circle(hand_x, hand_y, 30);
        }
    };

    sketch.show = () => sketch.draw();
});
```

---

## 🔌 Intégration avec les Drivers HAL

Pour utiliser les capteurs:

```python
class Application(BaseApplication):
    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        
        # Demander les données de caméra
        self.requires = {
            "camera": ["raw_frame"],
            "hand_pose": ["raw_data"],
            "ball": ["position"]
        }

    def listener(self, source, event, data):
        if source == "hand_pose" and event == "raw_data":
            # Traiter les positions des mains
            processed = process_hand_data(data)
            self.server.send_data(self.name, processed)
```

---

## 📊 Bonnes Pratiques

### 1. Nommage des Applications

- ✅ Bon: `triangles_remarkable_lines`, `rabbits_game`
- ❌ Mauvais: `app1`, `test_thing`
- Utiliser snake_case (pas d'espaces ni de majuscules)

### 2. Structure des Fichiers

```
home/apps/mon_app/
├── display.js          # L'interface (requise)
├── processing.py       # La logique (requise)
├── components/
│   ├── icon.svg
│   ├── sound.mp3
│   └── data.json
├── utils/
│   ├── helpers.js
│   └── math.js
└── README.md           # Documentation
```

### 3. Configuration Minimale

Au minimum, vous avez besoin de:
- Ajouter à `menu_control` dans `config.json`
- Ajouter à `app_metadata` avec métadonnées complètes
- Créer `display.js` et `processing.py`

### 4. Gestion des États

```python
# Bon
def listener(self, source, event, data):
    if not self.started:
        return
    
    if source == "hand_pose":
        self.process_hand_data(data)
```

---

## 🧪 Test et Débogage

### Vérifier que l'App Charge

1. Ouvrir la console du navigateur (F12)
2. Chercher des erreurs JavaScript
3. Vérifier que le module `mon_app` est chargé

### Logs de Debugging

```python
def listener(self, source, event, data):
    self.log(f"Reçu: {source}_{event}", 1)  # Info
    self.log(f"Erreur: {error}", 4)         # Erreur critique
```

### Monitorer les Performances

```javascript
sketch.show = () => {
    let start = performance.now();
    // Code à tester
    let duration = performance.now() - start;
    console.log(`Frame: ${duration.toFixed(2)}ms`);
};
```

---

## 📈 Extension Future

Le système supporte:
- ✅ Ajout d'applications illimitées
- ✅ Catégories dynamiques
- ✅ Icônes et couleurs flexibles
- ✅ Communication par WebSocket
- ✅ Intégration matérielle (capteurs)

---

## 🆘 Troubleshooting pour Développeurs

### Mon app ne s'affiche pas
1. Vérifier qu'elle est dans `menu_control`
2. Vérifier que les métadonnées sont correctes
3. Recharger la page

### L'app lance mais rien ne s'affiche
1. Vérifier que `sketch.show()` est implémentée
2. Vérifier l'absence d'erreurs JS (console)
3. Tester avec un rectangle simple d'abord

### Les données ne reçoivent pas
1. Vérifier le nom du socket (doit matcheravec `sketch.name`)
2. Vérifier les `requires` dans `processing.py`
3. Tester la connexion Redis

### Performance faible
1. Réduire la complexité du rendu
2. Limiter la taille des données envoyées
3. Optimiser l'algorithme de traitement

---

## 📚 Ressources Supplémentaires

- [Documentation p5.js](https://p5js.org/)
- [Flask-SocketIO](https://flask-socketio.readthedocs.io/)
- [Redis Python](https://redis-py.readthedocs.io/)
- [Code existant](../home/apps/) pour des exemples

---

**Maintenant, vous êtes prêt à créer de nouvelles applications! 🚀**
