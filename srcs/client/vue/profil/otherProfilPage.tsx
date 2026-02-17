import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../access/authenticator";

type User = {
  id: number;
  username: string;
  avatarUrl: string | null;
};

type Match = {
  date: string;
  name_player1: string;
  name_player2: string;
  score1: number;
  score2: number;
};

type Props = {
  header: React.ReactNode;
  footer: React.ReactNode;
};

export default function OtherProfilPage({ header, footer }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [matchs, setMatchs] = useState<Match[]>([]);
  const [loadingMatchs, setLoadingMatchs] = useState(true);

  const usernameFromHash = location.hash.split("#")[2];

  /* =====================
     FETCH USER + ME
  ===================== */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = await isAuthenticated();
        const id = auth.authenticated && auth.id ? auth.id : 0;

        const resUser = await fetch("/api/getuserbyname", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: usernameFromHash }),
        });

        if (!resUser.ok) throw new Error("Failed to fetch user");
        const userData: User = await resUser.json();
        setUser(userData);

        const resMe = await fetch("/api/getuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!resMe.ok) throw new Error("Failed to fetch me");
        const meData: User = await resMe.json();
        setMe(meData);
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    fetchUsers();
  }, [usernameFromHash]);

  /* =====================
     FETCH MATCHS
  ===================== */
  useEffect(() => {
    if (!user) return;

    const loadMatchs = async () => {
      try {
        setLoadingMatchs(true);

        const res = await fetch("/api/getMatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name_player: user.username }),
        });

        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) {
          setMatchs([]);
          return;
        }

        setMatchs(data);
      } catch (err) {
        console.error(err);
        setMatchs([]);
      } finally {
        setLoadingMatchs(false);
      }
    };

    loadMatchs();
  }, [user]);

  /* =====================
     CHAT
  ===================== */
  const handleChat = async () => {
    if (!me || !user) return;

    try {
      const res = await fetch("/api/creatGroup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: me.id, user }),
      });

      if (!res.ok) throw new Error("Chat creation failed");

      const data = await res.json();
      window.location.hash = `#messages#${data.group}`;
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <>{header}<main>Chargement...</main>{footer}</>;

  const avatarSrc = user.avatarUrl ?? "/uploads/avatars/default.png";

  return (
    <>
      {header}

      <main id="mainContent" className="min-h-[calc(100vh-8rem)]">
        <h1>Profil</h1>

        <section style={{ marginBottom: 20 }}>
          <img
            src={avatarSrc}
            alt="Avatar"
            width={128}
            height={128}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
              marginBottom: 10,
            }}
          />
        </section>

        <div>
          <button className="btn-secondary" onClick={handleChat}>
            chat
          </button>
        </div>

        <h1>Liste des matchs</h1>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Adversaire</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {loadingMatchs && (
                <tr>
                  <td colSpan={3}>Chargement...</td>
                </tr>
              )}

              {!loadingMatchs && matchs.length === 0 && (
                <tr>
                  <td colSpan={3}>Aucun match</td>
                </tr>
              )}

              {!loadingMatchs &&
                matchs.map((match, index) => {
                  const isPlayer1 = match.name_player1 === user.username;

                  const userScore = isPlayer1
                    ? match.score1
                    : match.score2;

                  const advScore = isPlayer1
                    ? match.score2
                    : match.score1;

                  const advName = isPlayer1
                    ? match.name_player2
                    : match.name_player1;

                  return (
                    <tr key={index}>
                      <td>{match.date}</td>
                      <td>
                        <a href={`#profil#${advName}`}>{advName}</a>
                      </td>
                      <td>
                        {userScore} - {advScore}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </main>

      {footer}
    </>
  );
}
