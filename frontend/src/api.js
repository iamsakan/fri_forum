export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("uporabnisko_ime");
    localStorage.removeItem("vloga");
    window.location.href = "/login";
    return null;
  }

  return res;
};