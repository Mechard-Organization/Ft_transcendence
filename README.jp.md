<h1 align="center">🏓 ft_transcendence 🏓</h1>

---

<h2 align="center">👨‍💻 チーム 👨‍💻</h2>

<p align="center">
<img src=".img/ft_transcendence_avatars_banner_42_n1.png" width="900" alt="ft_transcendence チーム">
<img src=".img/ft_transcendence_avatars_banner_42_n2.png" width="900" alt="ft_transcendence チーム">
</p>

---

<h2 align="center">💾 Version 💾</h2>
<p align="center">
  <a href="./README.en.md">🇬🇧 English</a> • 
  <a href="https://github.com/Mechard-Organization/Ft_transcendence/tree/main">🇫🇷 Français</a>
</p>

---

<h2 align="center">📝 プロジェクト概要 📝</h2>

**ft_transcendence** は、**42スクールのコアカリキュラム（共通課程）最後のプロジェクト**です。  
このプロジェクトでは、伝説的なゲーム **Pong** をプレイできる **完全で安全なウェブアプリケーション** を、  
モダンで拡張可能、かつ協働的な環境で設計・開発することが目的です。

本プロジェクトの目的は次の通りです：  
- **新しい技術**（TypeScript、Node.js、Docker、WebSocketなど）を習得すること。  
- **明確でモジュール化された組織構成**のもとで、**複雑なチーム開発プロジェクト**を管理すること。  
- **機能的で、安全かつ保守性の高いウェブサイト**を作成し、課題の要件をすべて満たすこと。

### 🎮 主な機能
- **リアルタイムPongゲーム**（ローカルまたはリモートの2人対戦）。  
- **トーナメントシステム**（マッチメイキングとエイリアス管理）。  
- **リアルタイムチャット**（DM、ルーム、ゲーム招待、ブロックリスト）。  
- **ユーザープロフィール**（統計、試合履歴、アバター）。  
- **AI対戦相手**（実際のプレイヤーの動きを模倣するAI）とのプレイが可能。  
- **強化されたセキュリティ**：HTTPS、JWT + 2FA、OAuth2、パスワードハッシュ化、XSS/SQLi保護。  
- **マイクロサービスアーキテクチャ**：各コンポーネント（auth、chat、game、matchmaking）は独立してスケーラブル。  
- **監視と可観測性**：Prometheus と Grafana によるモニタリング。  
- **モダンなフロントエンド**：TypeScript + TailwindCSS を用いた Single Page Application (SPA)。

### ⚙️ 技術スタック
- **フロントエンド**：TypeScript、TailwindCSS、SPA。  
- **バックエンド**：Node.js（Fastify）、SQLite、WebSocket。  
- **セキュリティ**：HTTPS（Nginxリバースプロキシ）、JWT、2FA、OAuth2。  
- **DevOps**：Docker、docker-compose、マイクロサービス、Prometheus/Grafana モニタリング。  
- **ゲームプレイ**：Canvas/WebGL、リアルタイムWSプロトコル、基本的なAI（限定的な視界）。  

### 🚀 起動方法
```bash
make up

```

---

<h2 align="center">📂 プロジェクト構造 📂</h2>

<p align="center">
<img src=".img/tree.png" width="900" alt="tree">
</p>

<p align="right">作成<i><b>mechard</b></i></p>