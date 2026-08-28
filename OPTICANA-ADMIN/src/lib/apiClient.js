const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "/api";


/* =====================================
   GET TOKEN FROM AUTH SESSION
===================================== */

function getToken() {
  try {
    const raw = window.localStorage.getItem("opticana-auth");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}


/* =====================================
   CORE REQUEST FUNCTION
===================================== */

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.success === false) {
    const message =
      data?.error?.message || "Something went wrong";
    const error = new Error(message);
    error.code = data?.error?.code || "UNKNOWN_ERROR";
    error.statusCode = response.status;
    error.details = data?.error?.details || null;
    throw error;
  }

  return data?.data;
}


/* =====================================
   PUBLIC API
===================================== */

export const apiClient = {
  get: (path) => request(path, { method: "GET" }),

  post: (path, body) =>
    request(path, { method: "POST", body }),

  patch: (path, body) =>
    request(path, { method: "PATCH", body }),

  put: (path, body) =>
    request(path, { method: "PUT", body }),

  delete: (path) => request(path, { method: "DELETE" }),
};

export default apiClient;
