
export async function adminPage(header: string, footer: string) {
  const app = document.getElementById("app");

  if (!app) return;

  app.innerHTML = `
    ${header}
    <main id="mainContent">
      <h1>Messages</h1>
      <div>
        <input type="text" id="table" placeholder="Table" />
        <input type="text" id="colonne" placeholder="Colonne" />
        <input type="text" id="type" placeholder="Type" />
        <button id="sendMessage">Envoyer</button>
      </div>
      <ul id="messagesList"></ul>
    </main>
    ${footer}
  `;

  const sendMessageButton = document.getElementById("sendMessage") as HTMLButtonElement;
  const tableInput = document.getElementById("table") as HTMLInputElement;
  const colonneInput = document.getElementById("colonne") as HTMLInputElement;
  const typeInput = document.getElementById("type") as HTMLInputElement;

    sendMessageButton.onclick = async () => {
	  const tableContent = tableInput.value.trim();
	  const colonneContent = colonneInput.value.trim();
	  const typeContent = typeInput.value.trim();

	  if (!tableContent || !colonneContent || !typeContent) return;

	  try {
		const res = await fetch("/api/alterADD", {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({ tableContent,  colonneContent, typeContent})
		});
		const data = await res.json();
		console.log("Message envoyé :", data);

		tableInput.value = "";
		colonneInput.value = "";
		typeInput.value = "";
	  } catch (err) {
		console.error(err);
	  }
	};
}
