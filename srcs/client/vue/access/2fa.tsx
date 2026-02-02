import { useState } from "react";

type TwoFAProps = {
  userId: number;
  twofaEnabled: boolean;
  onEnable2FA: () => void;
  onDisable2FA: () => void;
};

export default function TwoFA({ userId, twofaEnabled, onEnable2FA, onDisable2FA }: TwoFAProps) {
  const [twofaQr, setTwofaQr] = useState<string | null>(null);
  const [twofaCode, setTwofaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setup2FA = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Erreur 2FA");
      setTwofaQr(data.qr);
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
    }
  };

  const enable2FA = async () => {
    if (!twofaCode) return setError("Code requis");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, code: twofaCode }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Code invalide");
      onEnable2FA();
      setTwofaQr(null);
      setTwofaCode("");
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });
      if (!res.ok) return setError("Erreur 2FA");
      onDisable2FA();
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
    }
  };

  return (
    <div className="mb-8 max-w-md mx-auto p-6 bg-white/70 rounded-3xl border-4 border-[#FEE96E] text-center">
      <h2 className="text-xl text-[#8B5A3C] mb-2">2FA</h2>
      <p>Status: {twofaEnabled ? "Active" : "Inactive"}</p>

      {!twofaEnabled && !twofaQr && (
        <button onClick={setup2FA} className="mt-2 px-4 py-2 bg-[#FEE96E] rounded-full">
          Activer 2FA
        </button>
      )}

      {twofaQr && (
        <div className="mt-2">
          <img src={twofaQr} alt="QR 2FA" className="mx-auto mb-2" />
          <input
            type="text"
            placeholder="Code de vérification"
            value={twofaCode}
            onChange={(e) => setTwofaCode(e.target.value)}
            className="px-4 py-2 rounded-full border-2 border-[#FEE96E]"
          />
          <button
            onClick={enable2FA}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-[#FEE96E] rounded-full"
          >
            Vérifier
          </button>
        </div>
      )}

      {twofaEnabled && (
        <button onClick={disable2FA} className="mt-2 px-4 py-2 bg-[#FEE96E] rounded-full">
          Désactiver 2FA
        </button>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
