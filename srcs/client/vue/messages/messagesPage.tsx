import { useEffect, useRef, useState } from "react";
import { Send, Users } from "lucide-react";
import Footer from "../ts/Footer";
import { isAuthenticated } from "../access/authenticator";
import { Link, useLocation } from "react-router-dom";
import { Gamepad2, MessageCircle, User } from "lucide-react";
import { username } from "../game/Meshes";


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

interface Conversation {
  id: number;
  username: string;
}

type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl?: string;
  winRate: number;
  gamesPlayed: number;
  gamesWon: number,
  highScore: number;
   twofaEnabled?: boolean;
};


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const isActive = (path: string) => location.pathname === path;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation>();

  const [selectedGroup, setSelectedGroup] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const selectedConversationRef = useRef<number | null>(null);
    const [userStats, setUserStats] = useState<UserStats>({
      id: 0,
      username: "",
      mail: "",
      avatarUrl: "./uploads/profil/default.jpeg",
      winRate: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      highScore: 0
    });
    const [otherStats, setOtherStats] = useState<UserStats>({
      id: 0,
      username: "",
      mail: "",
      avatarUrl: "./uploads/profil/default.jpeg",
      winRate: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      highScore: 0
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket(`/ws/`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connecté");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.data)
        {
          const idGroup = msg.data.id_group ?? null;
          console.log("mm", idGroup, selectedConversationRef.current)
          if (msg.type === "new_message" && idGroup === selectedConversationRef.current) {
            console.log("msg : ", msg)
            setMessages((prev) => [...prev, msg.data.saved]);
          }
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


  useEffect(() => {
    async function fetchMessages() {
      let res;
      if (!selectedConversation)
      {
          res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_group: undefined,
          }),
        });
      }
      else
      {
        res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_group: selectedConversation.id,
          }),
        });
      }
      selectedConversationRef.current =
        !selectedConversation || selectedConversation?.id === 0 ? null : selectedConversation?.id;
      setMessages(await res.json());
    }
    fetchMessages();
  }, [selectedConversation]);

  useEffect((): void =>{
    console.log("aaaaaa:", messages)
}, [messages])
/* ---------------- SEND MESSAGE ---------------- */
const sendMessage = async () => {
  if (!newMessage.trim()) return;

  const auth = await isAuthenticated();
  const id = auth?.id ?? null;



  try {
    const id_group = selectedConversation.id === 0 ? undefined : selectedConversation.id;
    const res = await fetch("/api/hello", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newMessage,
        id,
        id_group,})
      });
      setNewMessage("");
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };


  useEffect(() => {
    async function getGroups() {
      const auth = await isAuthenticated();
      if (!auth?.id) return;

        const res = await fetch("/api/getAllUserGroup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: auth.id }),
        });

        const data = await res.json();
        setConversations([
          { id: 0, username:"general" },
          ...data.map((f: any) => ({
            id: f.id_group,
            username: f.groupname
          })),
        ]);
      }
      getGroups();
    }, []);

  useEffect(() => {
    console.log("✅ conversations mis à jour :", conversations);
  }, [conversations]);


    useEffect(() => {
    async function fetchUser() {
      try {
        const auth = await isAuthenticated();
        if (!auth?.id) return;

        const resUser = await fetch("/api/getuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: auth.id }),
        });
        const userData = await resUser.json();

        setUserStats({
          id: userData.id,
          username: userData.username,
          mail: userData.mail,
          avatarUrl: userData.avatarUrl ?? "./uploads/profil/default.jpeg",
          winRate: userData.winRate,
          gamesPlayed: userData.gamesPlayed,
          gamesWon: userData.gamesWon,
          highScore: userData.highScore
        });
      } catch (err) {
        console.error("Erreur récupération profil :", err);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
      <div className="flex flex-1 w-full max-w-7xl mx-auto gap-6 p-6">
        <div className="w-1/3 h-200 bg-white/80 rounded-2xl p-4 shadow-md">
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
                      {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-3 rounded-xl cursor-pointer transition-all mb-2 flex items-center gap-3
                  ${
                    selectedConversation === conv
                      ? "bg-[#FEE96E]"
                      : "hover:bg-yellow-200"
                  }`}
                  >
                <User className="w-5 h-5 text-[#8B5A3C]" />
                <span className="font-medium ">{conv.username}</span>
              </div>
            ))}
        </div>

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="w-2/3 h-200 flex flex-col bg-white/80 rounded-2xl shadow-md overflow-hidden">
          {/* HEADER CHAT */}
          <div className="bg-[#FEE96E] p-4">
            <Link to={`/friendsProfil/${otherStats.id}`}>
             <h2 className="text-xl font-bold text-[#8B5A3C]">
              {selectedConversation === null
                ? "Sélectionne une discussion"
                : selectedConversation?.id === 0
                  ? "Discussion générale"
                  : selectedConversation?.username || "Chargement..."}
            </h2>
            </Link>
          </div>



          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.username === userStats.username
                  ? "justify-end"
                  : "justify-start"
                }`}
              >
                <div
                  className={`max-w-md px-5 py-3 rounded-3xl ${
                    msg.username === userStats.username
                    ? "bg-gray-200 text-gray-800"
                    : "bg-[#FEE96E] text-[#8B5A3C]"
                  }`}
                >
                <div className="flex-1 overflow-y-auto justify-end [#FEE96E]">
                  <Link to={`/friendsProfil/${msg.id}`}>{msg.username}</Link>
                  </div>
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
