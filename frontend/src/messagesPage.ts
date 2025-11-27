/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   messagesPage.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mechard <mechard@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:50:17 by abutet            #+#    #+#             */
/*   Updated: 2025/11/27 14:49:19 by mechard          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// messagesPage.ts
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

  // Fonction pour récupérer tous les messages
  async function fetchMessages() {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      messagesList.innerHTML = "";
      data.forEach((msg: {id: number, content: string}) => {
        const li = document.createElement("li");
        li.textContent = `#${msg.id}: ${msg.content}`;
        messagesList.appendChild(li);
      });
    } catch (err) {
      console.error(err);
      messagesList.innerHTML = "<li>Erreur lors du chargement des messages</li>";
    }
  }

  // Envoyer un nouveau message
  sendMessageButton.onclick = async () => {
    const content = newMessageInput.value.trim();
    if (!content) return;

    try {
      const res = await fetch("/api/hello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      console.log("Message envoyé :", data);
      newMessageInput.value = "";
      fetchMessages(); // rafraîchir la liste
    } catch (err) {
      console.error(err);
    }
  };

  // Chargement initial des messages
  fetchMessages();
}
