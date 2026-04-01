const raw = import.meta.env.VITE_BASE_URL;
const origin = (typeof raw === "string" ? raw : "").trim().replace(/\/$/, "");

if (!origin) {
  console.warn(
    "[apiBase] Set VITE_BASE_URL in frontend/.env (backend origin, no trailing slash)."
  );
}

/** Full axios base URL including `/api` (e.g. `${VITE_BASE_URL}/api`). */
export const API_BASE = origin ? `${origin}/api` : "";
