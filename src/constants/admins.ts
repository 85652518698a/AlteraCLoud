export const ADMIN_EMAILS = [
  "anujmhatre125@gmail.com",
  "nehapatil0045@gmail.com",
  "anujmhatre345@gmail.com",
  "mhatre.anuj0855.csmu.ac.in"
];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
