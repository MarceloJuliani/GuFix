export type SessionUser = {
  id: string;
  email: string;
  fullName?: string | null;
  role?: "personal" | "student" | null;
};

const TOKEN_KEY = "gufix_token";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function loginWithEmail(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Falha no login");
  const data = await response.json();
  saveToken(data.token);
  return data.user as SessionUser;
}

export async function registerWithEmail(fullName: string, email: string, password: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password, role: "personal" }),
  });
  if (!response.ok) throw new Error("Falha no cadastro");
  const data = await response.json();
  saveToken(data.token);
  return data.user as SessionUser;
}
