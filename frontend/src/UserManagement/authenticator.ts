export async function isAuthenticated(): Promise<boolean> {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include", // ⚠️ OBLIGATOIRE pour envoyer le cookie HttpOnly
  });
  
  const data = await res.json();
  return res.ok;
}