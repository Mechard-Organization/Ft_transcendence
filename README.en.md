<h1 align="center">🏓 ft_transcendence 🏓</h1>

<div align="center">
  <strong>💾 Version 💾</strong><br><br>
  🇯🇵 <a href="./README.jp.md">日本語</a> • 
  🇫🇷 <a href="./README.md">Français</a>
</div>

---

<h2 align="center">Commands to clone the transcendence repository</h2>

<details><summary> 🌍 From github</summary>

```bash
git clone git@github.com:Mechard-Organization/Ft_transcendence.git

```

</details>

<details><summary> 🏫 From intra</summary>

```bash
git clone git@vogsphere.42paris.fr:vogsphere/intra-uuid-1b74ffcb-2a75-4cc1-a276-c47ee8672993-7191380-mechard

```

</details>

---

<h2 align="center">👨‍💻 le groupe 👨‍💻</h2>

<p align="center"><a href="https://github.com/Mechard-Organization/Ft_transcendence/tree/jeanne"><img src=".assets/imgs/ft_transcendence_avatars_banner_42_n1_left.png" width="33.333%" alt="Jeanne" /></a><a href="https://github.com/Mechard-Organization/Ft_transcendence/tree/lylou"><img src=".assets/imgs/ft_transcendence_avatars_banner_42_n1_center.png" width="33.333%" alt="Lylou" /></a><a href="https://github.com/Mechard-Organization/Ft_transcendence/tree/maxime"><img src=".assets/imgs/ft_transcendence_avatars_banner_42_n1_right.png" width="33.333%" alt="Maxime" /></a></p>

<p align="center"><a href="https://github.com/Mechard-Organization/Ft_transcendence/tree/medhi"><img src=".assets/imgs/ft_transcendence_avatars_banner_42_n2_left.png" width="50%" alt="medhi" /></a><a href="https://github.com/Mechard-Organization/Ft_transcendence/tree/abdul"><img src=".assets/imgs/ft_transcendence_avatars_banner_42_n2_right.png" width="50%" alt="abdul" /></a></p>

<h2 align="center">📝 Project Overview 📝</h2>

**ft_transcendence** is a full-stack web application developed as the final project of the 42 Common Core curriculum.

The project consists of a real-time multiplayer Pong platform enhanced with:

- Secure authentication system (JWT + OAuth 2.0 + 2FA)
- Real-time multiplayer game using WebSockets
- Social features (friends, chat, profiles)
- Administrative tools
- Monitoring and observability stack
- Secure infrastructure using HTTPS and reverse proxy

The objective was to build a production-ready web application combining modern web technologies, cybersecurity principles, DevOps practices, and real-time systems.

---

## Instructions

### Prerequisites

- Docker version >= 24
- Docker Compose v2
- Make
- Node.js >= 18 (for local development)

---

### Environment Variables

Create a `.env` file at the root with:

```bash
###   GRAFANA   ###

GF_SECURITY_ADMIN_USER=admin-grafana
GF_SECURITY_ADMIN_PASSWORD=password-grafana
GF_SERVER_HTTP_PORT=5000
GF_INSTALL_PLUGINS=frser-sqlite-datasource

###   ADMIN   ###

ADMIN=admin_username
ADMIN_PASSWORD=strong_password
ADMIN_MAIL=admin@example.com

### OAuth Google ###

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://localhost/api/auth/google/callback
OAUTH_SUCCESS_REDIRECT=path-redirection
```


---

<details><summary>### 🚀 Launch</summary>

```bash
make

```
or
```bash
make start

```
</details>
### 🏥 Commands list
Stop:
```bash
make down

```
Rebuild completely:
```bash
make rebirth

```
Logs:
```bash
make logs

```
for a complete list of available make commande, please make :
```bash
make help

```
Access

Main application (HTTPS via Nginx):

https://localhost:8443

Available routes:

    Frontend: /

    API: /api/...

    WebSockets: /ws/

    Grafana: /grafana

    Prometheus: /prometheus

---

<h2 align="center">👨‍💻 Team Information 👨‍💻</h2>

mechard — Project Manager + Developer

    Global architecture coordination

    Backend API integration

    Authentication system integration

    Monitoring stack setup

    DevOps orchestration

mel-yand — Cybersecurity Developer

    2FA implementation (TOTP)

    OAuth 2.0 (Google OpenID Connect)

    Password validation and security policies

    Input validation & security hardening

abutet — Technical Lead + WebSockets

    Backend architecture (Fastify)

    WebSocket server implementation

    Real-time synchronization

    Reverse proxy WebSocket routing

ajamshid — Game Logic Developer

    Pong gameplay engine

    Collision system

    Scoring and match state management

    Match history logic

jealefev — Product Owner + Developer

    Feature definition and validation

    UI/UX coherence

    Frontend implementation

    Social features integration

<h2 align="center"> Project Management</h2>

    Weekly sprint planning

    Feature-based branching strategy

    Pull Requests with mandatory review

    Clear commit history from all members

    GitHub Issues for task tracking

    Discord for daily communication

---

<p align="right">written by <i><b>mechard</b></i></p>