import { useEffect, useState } from "react";
import { isAuthenticated } from "../access/authenticator";

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

    return () => ws.close();
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
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-[#8B5A3C] text-3xl mb-6">👥 Amis</h1>

      <form
        className="form-container flex flex-col items-center gap-4 mb-8"
        onSubmit={addFriend}
      >
        <div className="text-[#8B5A3C] bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#FEE96E] mb-6 flex justify-between p-2 border rounded-full mb-2">
          <label className="block mb-1"></label>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="mx-auto block px-6 py-3 rounded-full border-2 border-[#FEE96E]"
          />
        </div>
        <button type="submit" className="text-[#8B5A3C] flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] bg-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]">
          Ajouter
        </button>
      </form>

      <h2 className="text-[#8B5A3C]  mb-2 ">Requêtes d’amis</h2>
      <div  className="text-[#8B5A3C] bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#FEE96E] mb-6 flex justify-between p-2 border rounded-full mb-2">
      {requests.length === 0 && <p>Aucune requête</p>}
      {requests.map((r) => (
        <div key={r.id}>
          <span>{r.username}</span>
          <div className="flex gap-2">
          {r.id_sender !== userId ? (
            <>
              <button onClick={() => acceptFriend(r.id)}>✅</button>
              <button onClick={() => rejectFriend(r.id)}>❌</button>
            </>
          ) : (
            <button onClick={() => rejectFriend(r.id)}>❌</button>

          )}
          </div>
        </div>
      ))}
      </div>
      <h2 className="text-[#8B5A3C] mt-6 mb-2">Liste d’amis</h2>
      <div  className="text-[#8B5A3C] bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#FEE96E] mb-6 flex justify-between p-2 border rounded-full mb-2">
      {friends.length === 0 && <p>Aucun ami</p>}
      {friends.map((f) => (
        <div key={f.id}>
          <span>{f.username}</span>
          <button onClick={() => blockfriends(r.id)}> [bloquer]</button>
          <button onClick={() => rejectFriend(f.id)}>❌</button>
        </div>
      ))}
      </div>
    </main>
  );
}
