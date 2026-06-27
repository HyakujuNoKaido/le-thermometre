# le-thermometre

Le Thermomètre 🌡️

Une web app multijoueur de jeu d'alcool où une IA (Google Gemini) génère des questions sur mesure pour cibler les joueurs de la soirée.

📂 Architecture du Projet (Monorepo)

Voici la structure exacte des dossiers de ce dépôt :

le-thermometre/
│
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml    # Script de déploiement auto sur GitHub Pages
│
├── backend/                       # Serveur Node.js & WebSockets
│   ├── .env.example               # Modèle des variables d'environnement (à commiter)
│   ├── .env                       # Tes VRAIES clés API (⚠️ ignoré par Git)
│   ├── package.json               # Dépendances Backend (express, socket.io...)
│   └── src/
│       ├── index.js               # Serveur principal (logique Socket.io)
│       └── services/
│           └── ai.service.js      # Configuration de l'API Google Gemini & Prompts
│
├── frontend/                      # Application Client (React + Vite + Tailwind)
│   ├── index.html                 # Point d'entrée HTML
│   ├── package.json               # Dépendances Frontend (react, lucide...)
│   ├── tailwind.config.js         # Configuration du design
│   ├── vite.config.js             # Configuration du bundler
│   └── src/
│       ├── App.jsx                # Logique du jeu, UI et interface
│       ├── index.css              # Styles globaux
│       └── main.jsx               # Point d'entrée React
│
├── .gitignore                     # Bloque les fichiers sensibles (ex: .env, node_modules)
└── README.md                      # Ce fichier


🚀 Comment lancer le projet en local ?

Ce projet est divisé en deux parties qui doivent tourner simultanément sur ton ordinateur.

1. Démarrer le Backend (Serveur & IA)

Ouvre un terminal et place-toi dans le dossier backend :

cd backend
npm install


Note : Crée un fichier .env dans ce dossier en copiant .env.example et ajoutes-y ta clé GEMINI_API_KEY.
Puis lance le serveur :

npm run dev


Le serveur tournera sur http://localhost:3001.

2. Démarrer le Frontend (Interface)

Ouvre un deuxième terminal et place-toi dans le dossier frontend :

cd frontend
npm install
npm run dev


L'interface s'ouvrira dans ton navigateur (généralement sur http://localhost:5173).

🔒 Sécurité (Dépôt Privé)

Ce projet est conçu pour être hébergé sur un dépôt privé. Assurez-vous que le fichier .env contenant les clés API ne soit jamais commité grâce au fichier .gitignore situé à la racine.
