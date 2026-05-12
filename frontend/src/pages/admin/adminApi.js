const API = "https://friforum-production.up.railway.app";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: "Bearer " + getToken(),
});

export const adminFetch = async (url, options = {}) => {
  const res = await fetch(API + url, {
    ...options,
    headers: {
      ...headers(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("API error:", data);
    return null;
  }

  return data;
};