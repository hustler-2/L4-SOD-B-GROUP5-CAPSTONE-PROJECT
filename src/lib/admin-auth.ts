// Simple admin credential check — stored in localStorage for session persistence.
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const STORAGE_KEY = "gr_admin_authed";

export function adminLogin(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem(STORAGE_KEY, "1");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAdminAuthed(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "1";
}
