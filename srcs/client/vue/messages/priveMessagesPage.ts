/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   priveMessagesPage.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: abutet <abutet@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:50:17 by abutet            #+#    #+#             */
/*   Updated: 2026/01/23 15:27:16 by abutet           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { isAuthenticated } from "../interface/authenticator";

/// messagesPage.ts
export function priveMessagesPage(header: string, footer: string) {
  const app = document.getElementById("app");
  const currentHref = location.hash.slice(1);
  const subHref = currentHref.split('#');
  if (!app) return;
  const id_group: string = subHref[1] && !isNaN(Number(subHref[1])) ? String(Number(subHref[1])) : "0";
  if (!id_group) return; 
  async function connect() {
    try {
      const auth = await isAuthenticated();
      const id = auth ? auth.id : null;
      const res = await fetch("/api/UserInGroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_group: subHref[1], id })
      });

      if (!res.ok) {
        console.error("Logout failed");
        return;
      }

      const group = await res.json();

      if (!Array.isArray(group) || group.length === 0)
      {
        alert("you need to be invite in this chat");
        window.location.hash = "#messages";
      }
    } catch (err) {
      console.error(err);
    }
  }
  connect();

  app.innerHTML = `
    ${header}
    <main id="mainContent">
      <h1>Messages</h1>
      <div>
        <input type="text" id="newMessage" placeholder="Nouveau message" />
        <button id="sendMessage">Envoyer</button>
      </div>
      <h1>Add user</h1>
      <div>
        <input type="text" id="newUser" placeholder="Nouveau user" />
        <button id="addUser">ADD</button>
      </div>
      <ul id="messagesList"></ul>
    </main>
    ${footer}
  `;

  const messagesList = document.getElementById("messagesList") as HTMLUListElement;
  const newMessageInput = document.getElementById("newMessage") as HTMLInputElement;
  const sendMessageButton = document.getElementById("sendMessage") as HTMLButtonElement;

  const newUserInput = document.getElementById("newUser") as HTMLInputElement;
  const addUserButton = document.getElementById("addUser") as HTMLButtonElement;

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
    li.textContent = `#${msg.username}: ${msg.content}`;
    messagesList.appendChild(li);
  }

  // --- RÉCUPÉRATION INITIALE DES MESSAGES ---
  async function fetchMessages() {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_group })
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

    if (!content) return;

    try {
      const res = await fetch("/api/hello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, id, id_group })
      });

      newMessageInput.value = "";
    } catch (err) {
      console.error(err);
    }
  };

  addUserButton.onclick = async () => {
    const user = newUserInput.value.trim();
    const auth = await isAuthenticated();
    const id = auth ? auth.id : null;

    if (!user) return;

    try {
      const resin = await fetch("/api/UserInGroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_group: subHref[1], id })
      });

      if (!resin.ok) {
        console.error("Logout failed");
        return;
      }

      const group = await resin.json();

      if (group.length != 0)
      {
        alert("already in this chat");
      }
      else
      {
        const res = await fetch("/api/addUserToGroup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user, id, id_group })
        });
      }

      newUserInput.value = "";
    } catch (err) {
      console.error(err);
    }
  };

  // --- CHARGEMENT INITIALE ---
  fetchMessages();
}
