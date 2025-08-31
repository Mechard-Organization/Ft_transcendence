<p align="center">
	🏓 ft_transcendence
</p>

---

<p align="center">
<table>
  <tr>
    <td align="center" valign="top" border_color="red">
      <img src=".img/jealefev_round.png" width="150"><br/>
      <b>Jeanne</b><br/>
      <sub>Frontend & UX<br/>(SPA TypeScript + Tailwind, intégration chat, profils, tournois)</sub>
    </td>
    <td align="center" valign="top">
      <img src=".img/abutet_round.png" width="150"><br/>
      <b>Lylou</b><br/>
      <sub>Gameplay & Réseau temps réel<br/>(Moteur Pong, WebSockets, Matchmaking, IA)</sub>
    </td>
    <td align="center" valign="top">
      <img src=".img/mechard_round.png" width="150"><br/>
      <b>Mechard</b><br/>
      <sub>Backend, Sécurité & DevOps<br/>(Fastify, Auth, JWT+2FA, OAuth2, Docker, Microservices)</sub>
    </td>
  </tr>
</table>
</p>

---

## 📂 Structure du projet

.
├── Makefile
├── README.md
├── docker
│ ├── grafana
│ ├── nginx
│ └── prometheus
├── docker-compose.yml
├── packages
├── services
│ ├── api-gateway
│ ├── assets
│ ├── auth
│ ├── chat
│ ├── game
│ └── matchmaking
└── webapp


---

## 📝 Résumé du projet

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
