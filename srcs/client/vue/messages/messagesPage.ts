/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   messagesPage.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: abutet <abutet@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:50:17 by abutet            #+#    #+#             */
/*   Updated: 2026/01/26 14:20:47 by abutet           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { isAuthenticated } from "../interface/authenticator";

/// messagesPage.ts
export function messagesPage(header: string, footer: string) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    ${header}
    <main id="mainContent">
      <h1>Messages</h1>
      <div>
        <input type="text" id="newMessage" placeholder="Nouveau message" />
        <button id="sendMessage">Envoyer</button>
      </div>
      <ul id="messagesList"></ul>
    </main>
    ${footer}
  `;

  const messagesList = document.getElementById("messagesList") as HTMLUListElement;
  const newMessageInput = document.getElementById("newMessage") as HTMLInputElement;
  const sendMessageButton = document.getElementById("sendMessage") as HTMLButtonElement;

  // --- WEBSOCKET ---
  const ws = new WebSocket("/ws/");

  ws.onopen = () => {
    console.log("WebSocket connecté !");
    ws.send(
      JSON.stringify({
        type: "wsChat"
      })
    );
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (msg.type === "new_message") {
        addMessageToList(msg.data);
      }
    } catch (e) {
      console.error("Erreur WS:", e);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket déconnecté");
  };

  // --- AJOUT D’UN MESSAGE DANS LA LISTE ---
  function addMessageToList(msg: { id: number; content: string; username: string }) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#profil#${msg.username}`;
      a.textContent = msg.username;

      li.append("#");
      li.appendChild(a);
      li.append(`: ${msg.content}`);
      messagesList.appendChild(li);
    messagesList.appendChild(li);
  }

  // --- RÉCUPÉRATION INITIALE DES MESSAGES ---
  async function fetchMessages() {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_group: undefined })
      });
      const data = await res.json();

      messagesList.innerHTML = "";
      data.forEach((msg: { id: number; content: string; username: string }) => addMessageToList(msg));
    } catch (err) {
      console.error(err);
      messagesList.innerHTML = "<li>Erreur lors du chargement des messages</li>";
    }
  }

  // --- ENVOI D’UN NOUVEAU MESSAGE VIA L’API ---
  sendMessageButton.onclick = async () => {
    const content = newMessageInput.value.trim();
    const auth = await isAuthenticated();
    const id = auth ? auth.id : null;
    const id_group =  undefined;

    if (!content) return;

    try {
      console.log({ content, id, id_group });
      const res = await fetch("/api/hello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, id, id_group })
      });
      const data = await res.json();

      newMessageInput.value = "";
      // ❌ plus besoin de fetchMessages() ici
      // la mise à jour se fera automatiquement via WebSocket
    } catch (err) {
      console.error(err);
    }
  };

  // --- CHARGEMENT INITIALE ---
  fetchMessages();
}
