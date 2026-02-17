import { useEffect, useState } from "react";
import { isAuthenticated } from "../access/authenticator";
import { ShieldPlus, ShieldMinus, Users } from "lucide-react";

type AdminUser = {
  id: number;
  username: string;
};

export default function AdminPage() {
  const [addUsername, setAddUsername] = useState("");
  const [removeUsername, setRemoveUsername] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  useEffect(() => {
    (async () => {
      const auth = await isAuthenticated();
      if (!auth?.id) return;
      setUserId(auth.id);
      fetchAdmins();
    })();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/getAdmins");
      const data = await res.json();
      if (res.ok) setAdmins(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateAdminStatus = async (username: string, status: boolean) => {
    if (!username.trim() || !userId) return;

    try {
      const userRes = await fetch("/api/getuserbyname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const user = await userRes.json();

      if (!user?.id) {
        alert("Utilisateur introuvable");
        return;
      }

      if (user.id === userId) {
        alert("Impossible de modifier votre propre statut");
        return;
      }

      const res = await fetch("/api/updateUserAdmin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur serveur");
        return;
      }

      status ? setAddUsername("") : setRemoveUsername("");
      alert("Action réussie ✅");

      fetchAdmins();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#FFF9E5] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm
                      rounded-3xl shadow-2xl border-4 border-[#FEE96E] p-10">

        <h1 className="text-4xl font-bold text-center text-[#8B5A3C] mb-10 flex items-center justify-center gap-3">
          <ShieldPlus className="w-9 h-9" />
          Administration
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <section className="bg-[#FFF9E5] rounded-3xl p-6 border-2 border-[#FEE96E]">
            <h2 className="text-2xl text-[#8B5A3C] mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Admins actuels
            </h2>

            {admins.length === 0 ? (
              <p className="text-[#A67C52]">Aucun admin trouvé</p>
            ) : (
              <ul className="space-y-2">
                {admins.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between px-4 py-2 bg-white/70 rounded-xl shadow-sm border border-[#FEE96E]"
                  >
                    <span className="font-medium text-[#8B5A3C]">{a.username}</span>
                    {a.id !== userId && (
                      <button
                        onClick={() => updateAdminStatus(a.username, false)}
                        className="p-2 rounded-full hover:bg-red-200"
                        title="Supprimer admin"
                      >
                        <ShieldMinus className="w-5 h-5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-[#FFF9E5] rounded-3xl p-6 border-2 border-[#FEE96E]">
            <h2 className="text-2xl text-[#8B5A3C] mb-4 flex items-center gap-2">
              <ShieldPlus className="w-6 h-6" />
              Ajouter un admin
            </h2>

            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={addUsername}
              onChange={(e) => setAddUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateAdminStatus(addUsername, true)}
              className="w-full text-[#8B5A3C] px-5 py-3 rounded-full border-2 border-[#FEE96E] mb-4"
            />

            <button
              onClick={() => updateAdminStatus(addUsername, true)}
              className="w-full py-3 rounded-full bg-[#FEE96E] text-[#8B5A3C]
                         font-semibold hover:scale-105 transition"
            >
              Ajouter
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
