import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import Footer from "../ts/Footer";
import { isAuthenticated } from "../access/authenticator";
import { Link, useLocation } from "react-router-dom";
import { Gamepad2, MessageCircle, User } from "lucide-react";


interface Message {
  id: number;
  content: string;
  username: string;
  timestamp: string;
}

interface Group {
  id: number;
  name: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const isActive = (path: string) => location.pathname === path;
  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: "Discussion générale" },
  ]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- WEBSOCKET ---------------- */
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connecté");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "new_message") {
          setMessages((prev) => [...prev, msg.data]);
        }
      } catch (err) {
        console.error("Erreur WS:", err);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket fermé");
    };

    return () => ws.close();

  }, []);

  /* ---------------- FETCH MESSAGES ---------------- */
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_group: selectedGroup }),
        });
        const data: Message[] = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Erreur fetch messages:", err);
      }
    }

    if (selectedGroup) fetchMessages();
  }, [selectedGroup]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const auth = await isAuthenticated();
    const id = auth?.id ?? null;

    try {
      await fetch("/api/hello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          id,
          id_group: selectedGroup,
        }),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
      {/* CONTENU */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto gap-6 p-6">
        {/* ---------------- LEFT PANEL ---------------- */}
        <div className="w-1/3 bg-white/80 rounded-2xl p-4 shadow-md">
          <h2 className="text-xl font-bold text-[#8B5A3C] mb-4">
            Discussions

          <Link to="/friends">
                      <div
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                isActive("/chat")
                ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
              }`}
              >
              <MessageCircle className="w-6 h-6" />
            </div>
          </Link>
              </h2>
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all mb-2
                ${
                  selectedGroup === group.id
                    ? "bg-[#FEE96E]"
                    : "hover:bg-yellow-200"
                }`}
            >
              {group.name}
            </div>
          ))}
        </div>

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="w-2/3 flex flex-col bg-white/80 rounded-2xl shadow-md overflow-hidden">
          {/* HEADER CHAT */}
          <div className="bg-[#FEE96E] p-4">
            <h2 className="text-xl font-bold text-[#8B5A3C]">
              {groups.find((g) => g.id === selectedGroup)?.name}
            </h2>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  className={`max-w-md px-5 py-3 rounded-3xl ${
                    msg.username === "user"
                      ? "bg-[#FEE96E] text-[#8B5A3C]"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
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

          {/* INPUT */}
          <div className="p-4 flex gap-2 border-t border-yellow-300">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Tape ton message..."
              className="flex-1 px-4 py-2 rounded-full border-2 border-[#FEE96E]"
            />
            <button
              onClick={sendMessage}
              className="px-5 py-2 rounded-full bg-[#FEE96E] border-2 border-[#FEE96E] hover:scale-105 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
