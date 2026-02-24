export async function isAuthenticated() {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });
  
  const data = await res.json();
  return data as { authenticated: boolean; id?: number };
}