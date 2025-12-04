export async function isAuthenticated() {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include", // ⚠️ OBLIGATOIRE pour envoyer le cookie HttpOnly
  });
  
  const data = await res.json();
  return data as { authenticated: boolean; id?: number | string; username?: string; reason?: string };
}