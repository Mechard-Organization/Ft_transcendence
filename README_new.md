*This project has been created as part of the 42 curriculum by mechard, mel-yand, abutet, ajamshid, jealefev.*

# ft_transcendence

## Description

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

JWT_SECRET=your_strong_secret
ADMIN=admin_username
ADMIN_PASSWORD=strong_password
ADMIN_MAIL=admin@example.com

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://localhost/api/auth/google/callback


---

### Run the project

```bash
make start

Stop:

make down

Rebuild completely:

make rebirth

Logs:

make logs

Access

Main application (HTTPS via Nginx):

https://localhost:8443

Available routes:

    Frontend: /

    API: /api/...

    WebSockets: /ws/

    Grafana: /grafana

    Prometheus: /prometheus

Team Information
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

Project Management

    Weekly sprint planning

    Feature-based branching strategy

    Pull Requests with mandatory review

    Clear commit history from all members

    GitHub Issues for task tracking

    Discord for daily communication

Each member contributed to both the mandatory part and selected modules.
Technical Stack
Frontend

    React (Vite)

    TypeScript

    TailwindCSS

    Babylon.js (3D rendering)

    Radix UI components

Backend

    Fastify (Node.js framework)

    JWT authentication

    OAuth 2.0 / OpenID Connect (Google)

    TOTP-based 2FA

    WebSocket server (real-time gameplay)

Database

    SQLite (better-sqlite3)

Why SQLite?

    Lightweight

    Reliable

    Easy container integration

    Sufficient relational structure for user/game logic

Infrastructure

    Docker containerization

    Nginx reverse proxy

    HTTPS enforced everywhere

    Prometheus metrics collection

    Grafana dashboards

Database Schema
Users

    id

    username

    password_hash

    mail

    google_sub

    oauth_enabled

    twofa_enabled

    twofa_secret

    admin

    avatarUrl

    created_at

Match

    id

    player1_id

    player2_id

    score

    winner

    played_at

Friends

    id_user

    id_friend

    id_sender

    accept

Messages

    id

    id_author

    id_group

    content

    timestamp

Relations ensure referential integrity and prevent data corruption during concurrent actions.
Features List
Authentication

    Secure signup/login

    JWT-based session management

    Strong password validation

    Email format validation

    Google OAuth 2.0 authentication

    2FA activation/deactivation

    2FA login verification

Real-Time Multiplayer Game

    WebSocket-based synchronization

    Remote 1v1 gameplay

    Reconnection handling

    Live state broadcasting

Social System

    Profile pages

    Avatar management

    Friends system

    Group and private chat

    Block users

Administration

    Admin role

    User moderation tools

Monitoring

    Prometheus metrics endpoint

    Grafana dashboards

    Containerized observability

Modules
Major Modules (2 pts each)

    Web (Fastify + React full-stack framework usage)

    Real-time features (WebSockets)

    Standard user management

    Cybersecurity (OAuth 2.0 + 2FA)

    Gaming (complete web-based game)

    DevOps (monitoring + containerization)

Minor Modules (1 pt each)

    ORM alternative approach with structured DB layer

    Match history & statistics

    Advanced chat features

Total: 14+ points

All modules are functional and demonstrable.
Individual Contributions
mechard

    Authentication integration

    JWT flows

    Monitoring stack

    Docker orchestration

mel-yand

    2FA implementation

    OAuth Google integration

    Security validation logic

abutet

    Fastify server architecture

    WebSocket implementation

    Reverse proxy configuration

ajamshid

    Game engine logic

    Collision detection

    Score management

jealefev

    Product validation

    Frontend UI

    Social features

AI Usage

AI tools were used to:

    Structure documentation

    Improve clarity of explanations

    Suggest refactoring approaches

All technical implementations were written, reviewed, and validated by the team.
Known Limitations

    Optimized primarily for Google Chrome

    AI opponent difficulty balancing can be improved

    Mobile layout can be further refined

License

Educational project developed at 42.


---