/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   messages.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: abutet <abutet@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:50:17 by abutet            #+#    #+#             */
/*   Updated: 2025/11/20 12:51:16 by abutet           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// messagesPage.ts
export function messagesPage() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <h1>Messages</h1>
    <div>
      <input type="text" id="newMessage" placeholder="Nouveau message" />
      <button id="sendMessage">Envoyer</button>
    </div>
    <ul id="messagesList"></ul>
  `;

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
