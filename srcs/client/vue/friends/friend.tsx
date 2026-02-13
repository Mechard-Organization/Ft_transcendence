import { useEffect, useState } from "react";
import { isAuthenticated } from "../access/authenticator";
import { X, Check, UserMinus2, UserSearch, UserPlus, UserCheck, MailMinus, UserMinus, UserX, MailPlus, BellPlus } from "lucide-react";

type Friend = {
  id: number;
  username: string;
  mail?: string;
  id_sender?: number;
};

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // 🔐 Auth + load data
  useEffect(() => {
    (async () => {
      const auth = await isAuthenticated();
      if (!auth?.authenticated) return;
      setUserId(auth.id);
      loadFriends(auth.id);
      loadRequests(auth.id);
    })();
  }, []);

  // 🌐 WebSocket
  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket("/ws/");
    ws.onopen = () => ws.send(JSON.stringify({ type: "wsFriend" }));

    ws.onmessage = () => {
      loadFriends(userId);
      loadRequests(userId);
    };
  }, [userId]);

  const loadFriends = async (id: number) => {
    const res = await fetch("/api/friend/getFriendV", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setFriends(await res.json());
  };

  const loadRequests = async (id: number) => {
    const res = await fetch("/api/friend/getFriendNV", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRequests(await res.json());
  };

  const acceptFriend = async (id_friend: number) => {
    if (!userId) return;
    await fetch("/api/friend/acceptFriend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_user: userId, id_friend }),
    });
    loadFriends(userId);
    loadRequests(userId);
  };

  const rejectFriend = async (id_friend: number) => {
    if (!userId) return;
    await fetch("/api/friend/delFriend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_user: userId, id_friend }),
    });
    loadFriends(userId);
    loadRequests(userId);
  };

  const addFriend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!usernameInput || !userId) return;

    const userRes = await fetch("/api/getuserbyname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameInput }),
    });
    const friend = await userRes.json();

    if (!friend?.id || friend.id === userId) {
      alert("Utilisateur invalide");
      return;
    }

    await fetch("/api/friend/friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_user: userId,
        id_friend: friend.id,
        id_sender: userId,
      }),
    });

    setUsernameInput("");
    loadRequests(userId);
  };

  return (
    <div className="flex flex-col relative">
<main className="flex-grow w-full max-w-6xl mx-auto px-6 py-10">
  <h1 className="text-[#8B5A3C] text-3xl mb-10 flex items-center justify-center gap-2"><UserCheck/> Amis</h1>

  {/* Ajouter un ami */}
  <form
    onSubmit={addFriend}
    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#FEE96E]
               p-6 mb-10 flex flex-col sm:flex-row gap-4 items-center justify-center"
  >
    <input
      type="text"
      placeholder="Nom d'utilisateur"
      value={usernameInput}
      onChange={(e) => setUsernameInput(e.target.value)}
      className="flex-1 px-6 py-3 bg-[#FFF9E5] sfs rounded-xl border-2 border-[#FEE96E] text-[#8B5A3C]"
      />
    <button
      type="submit"
      className="px-7 py-4 rounded-full bg-[#FEE96E] text-[#8B5A3C] font-medium hover:scale-100 transitiontext-[#8B5A3C] text-1xl flex items-center justify-center gap-2"
    >
      Ajouter
      <UserPlus className="w-6 h-6"/>
    </button>
  </form>

  {/* Listes */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Requêtes */}
    <section className="bg-white/80 rounded-3xl p-6 shadow-xl border-2 border-[#FEE96E]">
      <h2 className="text-[#8B5A3C] text-xl mb-4">
         <BellPlus className="text-[#8B5A3C] text-xl mb-4">
          </BellPlus>
         </h2>

      {requests.length === 0 && (
        <p className="flex items-center justify-between text-[#8B5A3C] bg-[#FFF9E5] px-4 py-3 rounded-xl">
            Aucune requête
        </p>
      )}

      <ul className="space-y-3">
        {requests.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between bg-[#FFF9E5]
                       px-4 py-3 rounded-xl"
          >
            <span className="font-medium text-[#8B5A3C]">{r.username}</span>

            <div className="flex gap-2">
              {r.id_sender !== userId && (
                <button
                  onClick={() => acceptFriend(r.id)}
                  className="p-2 rounded-full hover:bg-green-200"
                >
                  <MailPlus className="w-5 h-5 text-[#8B5A3C]" />
                </button>
              )}
              <button
                onClick={() => rejectFriend(r.id)}
                className="p-2 rounded-full hover:bg-red-200"
              >
                <MailMinus className="w-5 h-5 text-[#8B5A3C]" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>

    {/* Amis */}
    <section className="bg-white/80 rounded-3xl p-6 shadow-xl border-2 border-[#FEE96E]">
      <h2 className="text-[#8B5A3C] text-xl mb-4"> <UserCheck/></h2>

      {friends.length === 0 && (
        <p className="flex items-center text-[#8B5A3C] justify-between bg-[#FFF9E5] px-4 py-3 rounded-xl">
            Aucun ami
        </p>
      )}

      <ul className="space-y-3">
        {friends.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between bg-[#FFF9E5]
                       px-4 py-3 rounded-xl"
          >
            <span className="font-medium text-[#8B5A3C]">{f.username}</span>

            <div className="flex gap-2">
              <button onClick={() => rejectFriend(f.id)} className="p-2 rounded-full hover:bg-red-200 text-[#8B5A3C]"><UserMinus className="w-5 h-5" /> </button>
              <button onClick={() => blockFriend(f.id)} className="p-2 rounded-full hover:bg-red-200 text-[#8B5A3C]"><UserX className="w-5 h-5" /> </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  </div>
</main>

    </div>
  );
}
