/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   messagesPage.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mechard <mechard@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:50:17 by abutet            #+#    #+#             */
/*   Updated: 2025/12/10 14:42:48 by mechard          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { isAuthenticated } from "../interface/authenticator";

/// messagesPage.ts
export function messagesPage(header: string, footer: string) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = header;
  app.innerHTML += `
    <h1>Messages</h1>
    <div>
      <input type="text" id="newMessage" placeholder="Nouveau message" />
      <button id="sendMessage">Envoyer</button>
    </div>
    <ul id="messagesList"></ul>
  `;
  app.innerHTML += footer;

  const messagesList = document.getElementById("messagesList") as HTMLUListElement;
  const newMessageInput = document.getElementById("newMessage") as HTMLInputElement;
  const sendMessageButton = document.getElementById("sendMessage") as HTMLButtonElement;

  // --- WEBSOCKET ---
  const ws = new WebSocket("/ws/");

  ws.onopen = () => {
    console.log("WebSocket connecté !");
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("WS reçu :", msg);

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
  function addMessageToList(msg: { id: number; content: string }) {
    const li = document.createElement("li");
    const user = fetch("/api/getuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id:msg.id_author })
      });
    console.log("user front: ", user);
    console.log("message front : ", msg);
    li.textContent = `#${msg.id_author}: ${msg.content}`;
    messagesList.appendChild(li);
  }

  // --- RÉCUPÉRATION INITIALE DES MESSAGES ---
  async function fetchMessages() {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();

      messagesList.innerHTML = "";
      data.forEach((msg: { id: number; content: string }) => addMessageToList(msg));
    } catch (err) {
      console.error(err);
      messagesList.innerHTML = "<li>Erreur lors du chargement des messages</li>";
    }
  }

  // --- ENVOI D’UN NOUVEAU MESSAGE VIA L’API ---
  sendMessageButton.onclick = async () => {
    const content = newMessageInput.value.trim();
    const auth = await isAuthenticated();
    const id = auth.id;

    console.log("id: ", id);
    if (!content || !id) return;

    try {
      const res = await fetch("/api/hello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, id })
      });
      const data = await res.json();
      console.log("Message envoyé :", data);

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
