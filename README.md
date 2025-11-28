# 🎮 Nemonzia - Gestionnaire d'équipe LoL

Application web complète pour gérer votre équipe League of Legends : champions, drafts, scrims, synergies, disponibilités et statistiques.

---

## 📋 Table des matières

- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Lancement de l'application](#-lancement-de-lapplication)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Support](#-support)

---

## 🔧 Prérequis

Avant de commencer, vous devez installer les logiciels suivants sur votre ordinateur :

### 1. **Node.js** (version 18 ou supérieure)

Node.js est nécessaire pour exécuter l'application.

#### Sur Windows :
1. Téléchargez Node.js depuis [nodejs.org](https://nodejs.org/)
2. Choisissez la version **LTS** (recommandée)
3. Lancez l'installateur et suivez les étapes
4. Vérifiez l'installation en ouvrant **PowerShell** ou **CMD** et tapez :
   ```bash
   node --version
   npm --version
   ```
   Vous devriez voir les numéros de version s'afficher.

#### Sur macOS :
1. Téléchargez Node.js depuis [nodejs.org](https://nodejs.org/)
2. Ou installez via Homebrew (si installé) :
   ```bash
   brew install node
   ```
3. Vérifiez l'installation :
   ```bash
   node --version
   npm --version
   ```

#### Sur Linux :
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm

# Vérifier l'installation
node --version
npm --version
```

### 2. **Git** (optionnel mais recommandé)

Git permet de télécharger et mettre à jour le projet facilement.

#### Sur Windows :
1. Téléchargez Git depuis [git-scm.com](https://git-scm.com/)
2. Installez avec les options par défaut
3. Vérifiez :
   ```bash
   git --version
   ```

#### Sur macOS/Linux :
```bash
# macOS avec Homebrew
brew install git

# Ubuntu/Debian
sudo apt install git

# Vérifier
git --version
```

---

## 📥 Installation

### Étape 1 : Télécharger le projet

#### Option A : Avec Git (recommandé)
Ouvrez un terminal (PowerShell sur Windows, Terminal sur macOS/Linux) et tapez :

```bash
# Cloner le projet
git clone https://github.com/Caotox/Nemonzia.git

# Aller dans le dossier
cd Nemonzia
```

#### Option B : Sans Git
1. Téléchargez le projet en ZIP depuis GitHub
2. Décompressez le fichier
3. Ouvrez un terminal dans le dossier décompressé

### Étape 2 : Installer les dépendances

Dans le terminal, exécutez :

```bash
npm install
```

⏳ **Cette étape peut prendre 2-5 minutes.** Attendez que l'installation se termine complètement.

### Étape 3 : Configuration de la base de données (déjà fait)

La base de données est déjà configurée et hébergée en ligne (Neon PostgreSQL). Aucune action nécessaire ! 🎉

---

## 🚀 Lancement de l'application

### 1. Démarrer le serveur

Dans le terminal, exécutez :

```bash
npm run dev
```

Vous devriez voir :

```
> dev
> tsx watch server/index.ts

Server running on http://localhost:7300
```

### 2. Ouvrir l'application

Ouvrez votre navigateur web (Chrome, Firefox, Safari, Edge...) et allez à l'adresse :

```
http://localhost:7300
```

🎉 **L'application est maintenant accessible !**

### 3. Arrêter l'application

Pour arrêter le serveur :
- Appuyez sur **Ctrl + C** dans le terminal
- Ou fermez simplement la fenêtre du terminal

---

## 📖 Utilisation

### Navigation

L'application contient plusieurs sections accessibles via le menu latéral :

#### 🏆 **Champions**
- Voir tous les champions de League of Legends
- Assigner des rôles à chaque champion (TOP, JGL, MID, ADC, SUP)
- Évaluer les champions selon 8 caractéristiques :
  - Prio de Lane
  - Strongside
  - Weakside
  - Engage
  - Peeling
  - Split
  - Hypercarry
  - Contrôle
- **Barre de recherche** : Tapez le nom d'un champion pour le trouver rapidement
- **Filtres par rôle** : Cliquez sur TOP, JGL, MID, ADC ou SUP pour filtrer

#### 🎯 **Drafting**
- Créer des compositions d'équipe (drafts)
- Sélectionner 5 champions pour votre équipe
- Choisir 5 bans
- Sauvegarder et consulter vos drafts

#### 📅 **Disponibilités**
- Ajouter les joueurs de l'équipe
- Gérer les disponibilités de chaque joueur par jour de la semaine
- Voir qui est disponible pour jouer

#### 🤝 **Synergies**
- Vue liste : Voir toutes les synergies entre champions
- Carte mentale : Visualiser les synergies d'un champion spécifique
- Réseau : Organisation des synergies par rôle

#### ⚔️ **Scrims**
- Enregistrer les matchs d'entraînement
- Renseigner l'adversaire, le score, la victoire/défaite
- Lier les drafts utilisés à chaque game
- Ajouter des commentaires

#### 📊 **Statistiques**
- Voir les stats globales de l'équipe
- Winrate par draft utilisé
- Historique des performances

#### 📝 **Patch Notes**
- Suivre les notes de patch de League of Legends
- Ajouter des notes importantes pour l'équipe

---

## 📁 Structure du projet

```
Nemonzia/
├── client/              # Interface utilisateur (React)
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── hooks/       # Hooks React personnalisés
│   │   └── lib/         # Utilitaires
│   └── public/          # Fichiers statiques
│
├── server/              # Backend (Express)
│   ├── index.ts         # Point d'entrée du serveur
│   ├── routes.ts        # Routes API
│   ├── storage.ts       # Accès base de données
│   └── db.ts            # Configuration Drizzle
│
├── shared/              # Code partagé client/serveur
│   └── schema.ts        # Schémas de base de données
│
├── migrations/          # Migrations SQL
├── scripts/             # Scripts utilitaires
└── package.json         # Dépendances du projet
```

---

## 🆘 Support

### Problèmes courants

#### ❌ "Port 7300 is already in use"
Un autre processus utilise déjà le port. Solutions :
1. Fermez tous les terminaux ouverts
2. Ou changez le port dans `server/index.ts` (ligne avec `PORT`)

#### ❌ "Cannot find module"
Les dépendances ne sont pas installées correctement :
```bash
# Supprimer node_modules
rm -rf node_modules

# Réinstaller
npm install
```

#### ❌ "Database connection error"
La base de données est peut-être hors ligne. Contactez l'administrateur du projet.

#### ❌ L'application ne charge pas
1. Vérifiez que le serveur tourne (message "Server running...")
2. Rafraîchissez la page du navigateur (F5)
3. Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

### Mise à jour du projet

Si le projet a été mis à jour sur GitHub :

```bash
# Avec Git
git pull origin main

# Réinstaller les dépendances (si nécessaire)
npm install

# Redémarrer le serveur
npm run dev
```

---

## 🛠 Technologies utilisées

- **Frontend** : React 18, TypeScript, TailwindCSS, Shadcn UI
- **Backend** : Node.js, Express, TypeScript
- **Base de données** : PostgreSQL (Neon serverless)
- **ORM** : Drizzle ORM
- **Build** : Vite
- **Queries** : TanStack Query

---

## 👥 Contribuer

Pour signaler un bug ou proposer une amélioration :
1. Ouvrez une **Issue** sur GitHub
2. Ou contactez directement l'administrateur du projet

---

## 📄 Licence

Ce projet est privé et réservé à l'usage de l'équipe.

---

**Bon jeu ! 🎮⚡**
