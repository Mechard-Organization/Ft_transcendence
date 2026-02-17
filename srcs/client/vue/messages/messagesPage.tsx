import { useEffect, useRef, useState } from "react";
import { Plus, PlusCircle, Send, Users, UserPlus, Group, Cross, X } from "lucide-react";
import Footer from "../ts/Footer";
import { isAuthenticated } from "../access/authenticator";
import { Link, useLocation } from "react-router-dom";
import { Gamepad2, MessagesSquare, User } from "lucide-react";
import { username } from "../game/Meshes";

interface Message {
  id: number;
  content: string;
  username: string;
  timestamp: string;
  id_author: string;
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

type UserGroup = {
  id: number;
  username: string;
};

type AuthStatus = "loading" | "authenticated" | "anonymous";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const isActive = (path: string) => location.pathname === path;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation>();
  const [showMembers, setShowMembers] = useState(false);
  const [groupMembers, setGroupMembers] = useState<UserGroup[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const selectedConversationRef = useRef<number | null>(null);
  const [showAddUser, setShowAddUser] = useState(false); // afficher/masquer la recherche
  const [searchUsername, setSearchUsername] = useState(""); // nom tapé
  const [userAddGroup, setUserAddGroup] = useState<UserGroup>({
    id: 0,
    username: ""
  })
  const slideRef = useRef<HTMLDivElement | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  (async () => {
      try {
        const auth = await isAuthenticated();
        
        if (!(auth?.authenticated)) {
          setAuthStatus("anonymous")
          console.log("utilisateur non identifie")
        }
        else {
          setAuthStatus("authenticated")
          console.log("utilisateur bien enregistre");
        }
      } catch {
        setAuthStatus("anonymous");
        console.log("AAAAAAAAAAAAAAAAa")
      }
}
)

    const [userStats, setUserStats] = useState<UserStats>({
      id: 0,
      username: "",
      mail: "",
      avatarUrl: "/uploads/profil/default.jpeg",
      winRate: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      highScore: 0
    });
    const [otherStats, setOtherStats] = useState<UserStats>({
      id: 0,
      username: "",
      mail: "",
      avatarUrl: "/uploads/profil/default.jpeg",
      winRate: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      highScore: 0
    });

  async function fetchMessages() {
    const auth = await isAuthenticated();
    const id = auth?.id ?? null;
    let res;
    if (!selectedConversation)
    {
        res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_group: undefined,
          id
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
          id
        }),
      });
    }
    selectedConversationRef.current =
      !selectedConversation || selectedConversation?.id === 0 ? null : selectedConversation?.id;
    setMessages(await res.json());
  }

useEffect(() => {
  function handleClick(event: MouseEvent) {
    if (
      showMembers &&
      slideRef.current &&
      !slideRef.current.contains(event.target as Node)
    ) {
      setShowMembers(false);
    }
  }
  document.addEventListener("mousedown", handleClick);
  return () => {
    document.removeEventListener("mousedown", handleClick);
  };
}, [showMembers]);


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
          console.log("mm", msg.data.saved);
          if (msg.type === "new_message" && idGroup === selectedConversationRef.current) {
            fetchMessages();
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
    const id_group = selectedConversation?.id === 0 ? undefined : selectedConversation?.id;
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
    console.log("group : ", selectedConversation)
  }, [selectedConversation])

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
          avatarUrl: userData.avatarUrl ?? "/uploads/profil/default.jpeg",
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

  const addUsertoGroup = async (user: any, id_group: number) => {
    try {
      const auth = await isAuthenticated();
      const id = auth?.id ?? null;

      const resUser = await fetch("/api/getuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: auth.id }),
      });

      const userData = await resUser.json();

      console.log(id_group);

      const res = await fetch("/api/addUserToGroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, id_group, me: userData }),
      });
      console.log("essai d'ajouter : ", user, id_group);
      if (!res.ok) throw new Error("Impossible d'ajouter l'utilisateur au groupe");

      console.log("Utilisateur ajouté au groupe !");
      const dataGroup = await res.json();

      if (dataGroup.newg)
      {
        setConversations((prev) => [...prev, {
          id: dataGroup.group.id_group,
          username: dataGroup.group.groupname
        }]);
      }
    } catch (err) {
      console.error("Erreur addUsertoGroup:", err);
    }
  };

const handleInviteUser = async () => {
  if (!searchUsername.trim() || !selectedConversation) return;

  try {

    const resUser = await fetch("/api/getuserbyname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: searchUsername.trim() }),
    });

    if (!resUser.ok) throw new Error("Utilisateur introuvable");
    const userToAdd = await resUser.json();

    await addUsertoGroup(userToAdd, selectedConversation.id);

    setSearchUsername("");
    setShowAddUser(false);
  } catch (err) {
    console.error("Erreur invitation :", err);
  }
};

const fetchGroupMembers = async () => {
  if (!selectedConversation || selectedConversation.id === 0) return;

  try {
    const res = await fetch("/api/getGroupMembers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_group: selectedConversation.id }),
    });

    setShowMembers(true);
    if (!res.ok) throw new Error("Erreur récupération membres");

    const data = await res.json();
    setGroupMembers(data);

  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-[#FFF9E5]">
      <div className="flex w-full max-w-7xl mx-auto gap-6 p-6">
        <div className="w-1/3 h-191 bg-white/80 rounded-2xl p-4 shadow-md">
          <h2 className="text-xl font-bold text-[#8B5A3C] mb-4">
            Discussions

          <Link to="/Friends">
                      <div
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                isActive("/chat")
                ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
              }`}
              >
              <UserPlus className="w-6 h-6" />
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
                <Users className="w-5 h-5 text-[#8B5A3C]" />
                <span className="font-medium text-[#8B5A3C]">{conv.username}</span>
              </div>
            ))}
        </div>

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="w-2/3 h-191 flex flex-col bg-white/80 rounded-2xl shadow-md overflow-hidden relative">
          {/* HEADER CHAT */}
          <div className="bg-[#FEE96E] p-4 flex items-center justify-between">
        {/* Left: Titre */}
        <h2 className="text-xl font-bold text-[#8B5A3C]">
          {selectedConversation === null
            ? "Sélectionne une discussion"
            : selectedConversation?.id === 0
              ? "Discussion générale"
              : selectedConversation?.username || "Discussion générale"}
        </h2>

        {/* Right: Boutons */}
        <div className="flex gap-2 items-center">
  {/* Bouton pour afficher la barre de recherche */}
  {selectedConversation && selectedConversation.id !== 0 && (
    <button
      onClick={() => setShowAddUser((prev) => !prev)}
      className="p-2 rounded-full hover:bg-yellow-200 transition"
      title="Ajouter un utilisateur"
    >
      <PlusCircle className="w-6 h-6 text-[#8B5A3C]" />
    </button>
  )}

  {/* Barre de recherche */}
  {showAddUser && (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Nom de l'utilisateur..."
        value={searchUsername}
        onChange={(e) => setSearchUsername(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleInviteUser();
        }}
        className="px-3 py-1 rounded-full border-2 border-[#FEE96E]"
      />
      <button
        onClick={handleInviteUser}
        className="px-3 py-1 rounded-full bg-[#FEE96E] border-2 border-[#FEE96E] hover:scale-105 transition"
      >
        Inviter
      </button>
    </div>
  )}

  {/* Bouton voir les profil */}
  {selectedConversation && selectedConversation.id !== 0 && (
   <button
  onClick={fetchGroupMembers}
  className="p-2 rounded-full hover:bg-yellow-200 transition"
  title="Voir membres"
>
  <User className="w-6 h-6 text-[#8B5A3C]" />
</button>

  )}
</div>

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
                  <Link to={`/FriendsProfil/${msg.id_author}`}>{msg.username}</Link>
                  </div>
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(msg.timestamp).toLocaleDateString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
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
              className="flex-1 px-4 py-2 rounded-full text-[#8B5A3C] border-2 border-[#FEE96E]"
            />
            <button
              onClick={sendMessage}
              className="px-5 py-2 rounded-full bg-[#FEE96E] border-2 border-[#FEE96E] hover:scale-105 transition"
            >
              <Send className="text-[#8B5A3C]" size={18} />
            </button>
          </div>
          {showMembers && (
    <div ref={slideRef} className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl p-6 rounded-l-2xl z-50 animate-slide-in">
      <button
        onClick={() => setShowMembers(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-[#8B5A3C]"
      >
        <X className="text-[#8B5A3C]" />
      </button>

      <h2 className="text-xl font-bold text-[#8B5A3C] mb-4">
        Membres du groupe
      </h2>

      <div className="bg-[#FEE96E]/30 h-165 rounded-2xl space-y-3 overflow-y-auto p-2">
        {groupMembers.map((member) => (
          <div
            key={member.id}
            className="p-3 bg-white rounded-xl flex justify-between items-center shadow-sm"
          >
            <Link
              to={`/FriendsProfil/${member.id}`}
              className="text-[#8B5A3C] font-medium hover:underline"
            >
              {member.username}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )}
        </div>
      </div>
    </div>
  );
}
