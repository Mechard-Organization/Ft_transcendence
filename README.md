<h1 align="center">🏓 ft_transcendence 🏓</h1>

---

<h1 align="center">👨‍💻 le groupe 👨‍💻</h1>

<p align="center">
<img src=".img/ft_transcendence_avatars_banner_42_n1.png" width="900" alt="Équipe ft_transcendence">
<img src=".img/ft_transcendence_avatars_banner_42_n2.png" width="900" alt="Équipe ft_transcendence">
</p>

---

<h1 align="center">📝 Résumé du projet 📝</h1>

**ft_transcendence** est le dernier projet du **tronc commun de l’école 42**.  
Il consiste à concevoir **un site web complet et sécurisé** permettant de jouer au jeu culte **Pong** dans un environnement moderne, extensible et collaboratif.

L’objectif est de démontrer notre capacité à :  
- Maîtriser des **technologies nouvelles** (Typescript, Node.js, Docker, Websockets, etc.).  
- Gérer un **projet d’équipe complexe**, en suivant une organisation claire et modulaire.  
- Produire un **site fonctionnel, sécurisé et maintenable**, conforme aux contraintes du sujet.

### 🎮 Fonctionnalités principales
- Jeu **Pong en temps réel** (2 joueurs locaux ou distants).  
- **Système de tournois** avec matchmaking et gestion des alias.  
- **Chat en direct** (DM, rooms, invitations à jouer, blocklist).  
- **Profils utilisateurs** avec statistiques, historique des matchs et avatars.  
- Possibilité de jouer contre une **IA** (adversaire simulant un joueur réel).  
- **Sécurité renforcée** : HTTPS, JWT + 2FA, OAuth2, hashage des mots de passe, protection XSS/SQLi.  
- **Architecture microservices** : chaque composant (auth, chat, game, matchmaking) est indépendant et scalable.  
- **Monitoring & observabilité** via Prometheus et Grafana.  
- **Frontend moderne** : Single Page Application (SPA) en TypeScript + TailwindCSS.

### ⚙️ Stack technique
- **Frontend** : TypeScript, TailwindCSS, SPA.  
- **Backend** : Node.js (Fastify), SQLite, Websockets.  
- **Sécurité** : HTTPS (Nginx reverse proxy), JWT, 2FA, OAuth2.  
- **DevOps** : Docker, docker-compose, microservices, monitoring Prometheus/Grafana.  
- **Gameplay** : Canvas/WebGL, protocole WS temps réel, IA basique (vision limitée).  

### 🚀 Lancement
```bash
make up

```

---

<h1 align="center">📂 Structure du projet 📂</h1>

---