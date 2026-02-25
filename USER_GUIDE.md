# 📱 Guide d'Utilisation - Menu Interactif Billard RA

## 🎯 Introduction

Le nouveau menu du projet Billard en Réalité Augmentée a été complètement redessiné pour offrir une meilleure expérience utilisateur. Ce guide vous montrera comment naviguer et utiliser toutes les fonctionnalités.

---

## 🚀 Démarrage Rapide

### 1. Ouvrir le Menu

Pour ouvrir le menu, effectuez ce geste avec vos deux mains:

```
1. Rapprochez vos deux index jusqu'à se toucher (écart < 10cm)
2. Maintenez cette position 
3. Écartez rapidement les deux mains (écart 25-50cm)
4. Le menu s'ouvrira avec une animation fluide ✨
```

**Astuce:** Vous verrez un tutoriel GIF montrant comment faire si aucune application n'est en cours.

---

### 2. Explorer les Applications

Une fois le menu ouvert, vous verrez:

```
┌─────────────────────────────────────┐
│           🎮 MENU                   │
├──────────────────────────────────────┤
│  📚  🎯  ⚡                          │ ← Catégories
├──────────────────────────────────────┤
│  🐰        📐         △      │
│  Rabbits   Affine    Lignes  │
│  Game      Transf.   Remarq. │
│  [ACTIVE]            [HOVER] │
│                                │
│  📚        ⚡         ...     │
│  Cours     Leçon     ...     │
│  Complet   Rapide    ...     │
└──────────────────────────────────────┘
```

---

## 🎮 Utilisation du Menu

### A. Naviguer par Catégories

Pour changer de catégorie:
1. **Cliquez** sur une catégorie en haut du menu
2. La grille se mettra à jour automatiquement
3. Les applications de cette catégorie s'afficheront

**Catégories disponibles:**
- 📚 **Éducation** - Programmes d'apprentissage complets
- 🎮 **Jeux** - Activités amusantes et ludiques
- 📐 **Mathématiques** - Concepts mathématiques
- △ **Géométrie** - Propriétés géométriques

---

### B. Sélectionner une Application

Il y a plusieurs façons de sélectionner une application:

#### Méthode 1: Survol et Sélection (Recommandée)
1. Pointez votre doigt sur une application
2. La cellule se **met en surbrillance** progressivement
3. Maintenez votre doigt dessus
4. La cellule se **remplit** et vire au vert
5. **Attendez** que la cellule soit complètement remplie
6. L'application se **lance** avec un son de confirmation ✓

#### Méthode 2: Zone Rapide
1. Pointez directement sur l'application
2. Si la surbrillance atteint son maximum
3. L'application se lance immédiatement

---

### C. Statuts des Applications

Chaque application affiche son statut:

```
🐰 Rabbits Game
    ▶ Active        ← L'application est en cours d'exécution
```

- **Pas de texte**: L'application est arrêtée
- **▶ Active**: L'application est actuellement en cours

---

### D. Fermer le Menu

Pour fermer le menu, effectuez le geste inverse:

```
1. Si le menu est ouvert, rapprochez vos deux index (écart < 10cm)
2. Maintenez cette position
3. Le menu se fermera progressivement 👍
```

**Important:** Le menu se **ferme automatiquement après 15 secondes** d'inactivité.

---

## 🎨 Fonctionnalités Visuelles

### Icônes et Couleurs

Chaque application a:
- **Un icône unique** (emoji) pour la reconnaître rapidement
- **Une couleur propre** pour la distinigner des autres
- **Une description courte** pour savoir ce qu'elle fait

Exemples:
- 🐰 = Rabbits Game (Rose)
- 📐 = Transformations Affines (Bleu)
- △ = Lignes Remarquables (Vert)
- 📚 = Cours Complet (Orange)
- ⚡ = Leçon Rapide (Vert pomme)

### Animations

Le menu utilise plusieurs animations pour meilleure expérience:
- **Ouverture progressive** du menu
- **Surbrillance fluide** au passage de la main
- **Feedback sonore** (sons de clic et d'ouverture/fermeture)
- **Transitions de couleurs** lisses

---

## ⚙️ Paramètres et Personnalisation

### Configuration par l'Administrateur

Si vous êtes administrateur, vous pouvez personnaliser:

1. **Temps d'auto-fermeture**: Modifier dans `config.json`
   ```json
   "automatic_menu_closing_time": 15000  // en millisecondes
   ```

2. **Ajouter une nouvelle catégorie**: Ajouter simplement une app avec une nouvelle catégorie

3. **Changer les couleurs**: Éditer la valeur `color` pour chaque app

4. **Modifier les icônes**: Remplacer la valeur `icon` (support emoji)

---

## 📊 Performances et Fluidité

Le menu affiche le **nombre de FPS** en bas à droite:

```
FPS: 60
```

- **60 FPS** = Performance excellente ✅
- **30-50 FPS** = Bon
- **<30 FPS** = Peut avoir du lag

---

## 🆘 Troubleshooting

### Le menu n'ouvre pas

**Possible:** Vous faites le mauvais geste
- Vérifiez que vous **rapprochez les doigts d'abord**
- Assurez-vous que vos **deux mains** sont visibles
- Essayez de faire le geste plus **lentement**

### Le menu répond lentement

**Solutions:**
1. Vérifiez le **FPS** en bas à droite
2. Si FPS < 30: Réduisez la complexité d'autres applications
3. Assurez-vous que la **détection des mains** fonctionne bien

### La sélection ne marche pas

**Vérifiez:**
1. Votre doigt est bien détecté (point blanc visible)
2. Vous maintenez le doigt longtemps sur l'application
3. La surbrillance atteint son maximum (cellule complètement remplie)

### Le son ne joue pas

**Solutions:**
1. Vérifiez les **paramètres audio** de votre système
2. Augmentez le **volume** de l'ordinateur
3. Redémarrez l'application

---

## 💡 Conseils d'Utilisation

1. **Soyez précis**: Gardez votre doigt stable sur l'application
2. **Soyez patient**: Attendez que la surbrillance soit complète
3. **Écoutez**: Les sons de feedback vous aident à confirmer les actions
4. **Regardez les couleurs**: Utilisez les couleurs pour naviguer plus rapidement
5. **Explorez**: Toutes les catégories pour découvrir nouvelles features

---

## 📋 Raccourcis Disponibles

Geste bien particulier | Résultat
--------------------------|----------
Doigts rapprochés + écart | ✅ Ouvrir le menu
Menu ouvert + doigts rapprochés | ✅ Fermer le menu
Survol application + maintien | ✅ Lancer l'application
Clic catégorie | ✅ Changer de catégorie

---

## 🎓 Cas d'Usage

### Pour les Étudiants

1. Ouvrir le menu
2. Sélectionner une **catégorie Éducation**
3. Choisir un **cours**
4. Apprendre les maths via les **exercices interactifs**

### Pour les Formateurs

1. Ouvrir le menu
2. Sélectionner une **catégorie Jeux**
3. Lancer une activity ludique
4. Les étudiants apprennent tout en s'amusant

### Pour les Administrateurs

1. Ouvrir le menu
2. Arrêter les apps **inutiles** (en mode "Active")
3. Lancer les apps **nécessaires**

---

## 📞 Support

Si vous avez des questions ou trouvez un bug:

1. Vérifiez ce guide
2. Consultez `UX_IMPROVEMENTS.md` pour les changements techniques
3. Vérifiez les **logs système** (`core/logs/`)
4. Contactez l'équipe de support

---

## ✨ Généralités

Le menu du Billard en RA est maintenant:
- ✅ Plus intuitif
- ✅ Plus rapide
- ✅ Plus beau
- ✅ Plus efficace

Profitez de cette meilleure expérience! 🚀
