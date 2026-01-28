import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import Footer from "../ts/Footer";
import { isAuthenticated } from "../interface/authenticator";

interface Message {
  id: number;
  content: string;
  username: string;
  timestamp: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  useEffect(() => {
    // --- WEBSOCKET ---
    const ws = new WebSocket("/ws/");
    ws.onopen = () => {
      console.log("WebSocket connecté !");
      ws.send(JSON.stringify({ type: "wsChat" }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "new_message") {
          setMessages((prev) => [...prev, msg.data]);
        }
      } catch (e) {
        console.error("Erreur WS:", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket déconnecté");
    };

    // --- FETCH MESSAGES INITIAUX --- \\
    async function fetchMessages() {
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_group: undefined }),
        });
        const data: Message[] = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Erreur fetch messages:", err);
      }
    }

    fetchMessages();

    return () => ws.close(); // cleanup WebSocket à la fermeture
  }, []);

  const sendMessage = async () => {
    console.log(newMessage);
    if (!newMessage.trim()) return;

    const auth = await isAuthenticated();
    const id = auth?.id || null;
    console.log(id);

    try {
      await fetch("/api/hello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, id, id_group: undefined }),
      });
      setNewMessage(""); // reset input
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }

  };

  return (
   <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
  {/* Header image */}

  {/* LAYOUT */}
  <div className="page-layout">

    {/* GAUCHE */}
    <div className="left-panel">
      <h2>Pompompuchat</h2>
      <p>ICI LA LISTE DES AMIS / DISCUSSIONS </p>
    </div>

    {/* DROITE */}
    <div className="right-panel">
      <div className="chat-container">

        {/* HEADER CHAT */}
        <div className="bg-[#FEE96E] p-6 flex-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B5A3C] rounded-full flex items-center justify-center text-white">
              P
            </div>
            <div>
              <h2 className="text-xl text-[#8B5A3C]">PompompuFriend</h2>
              <p className="text-sm text-[#A67C52]">En ligne</p>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.username === "user"
                  ? "justify-start"
                  : "justify-end"
              }`}
            >
              <div
                className={`max-w-md px-6 py-3 rounded-3xl ${
                  msg.username === "user"
                    ? "bg-[#FEE96E] text-[#8B5A3C]"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-xs opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
            
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Tapez votre message..."
          />
          <button onClick={sendMessage}>
            <Send size={18} />
            Envoyer
          </button>
        </div>

      </div>
    </div>
  </div>

  <Footer />
</div>
  )
}
