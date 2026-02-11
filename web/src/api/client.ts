const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getApiBase() {
  return API_BASE;
}

async function request(path: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (authToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error && typeof body.error === "string") {
        message = body.error;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export const api = {
  requestOtp: (phoneNumber: string) =>
    request("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber })
    }),
  verifyOtp: (
    phoneNumber: string,
    otp: string,
    profile?: {
      name?: string;
      ageRange?: string;
      approximateLocation?: string;
      preferredLanguage?: string;
      accessibilityNeeds?: string;
    }
  ) =>
    request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, otp, ...profile })
    }),
  me: () => request("/users/me"),
  activities: () => request("/activities"),
  createMatch: (activityId: string) =>
    request("/matches", {
      method: "POST",
      body: JSON.stringify({ activityId })
    }),
  listMatches: () => request("/matches"),
  respondMatch: (id: string, decision: "ACCEPTED" | "REJECTED") =>
    request(`/matches/${id}/respond`, {
      method: "POST",
      body: JSON.stringify({ decision })
    }),
  scheduleMatch: (id: string, scheduledFor: string) =>
    request(`/matches/${id}/schedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledFor })
    }),
  listMessages: (matchId: string) => request(`/messages/${matchId}`),
  sendMessage: (matchId: string, content: string) =>
    request(`/messages/${matchId}`, {
      method: "POST",
      body: JSON.stringify({ content })
    }),
  placeOrder: (category: string, items: string[]) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify({ category, items })
    }),
  listOrders: () => request("/orders"),
  helpCheckIn: (kind: "EMERGENCY" | "SUPPORT" | "CAREGIVER", note?: string) =>
    request("/help/check-in", {
      method: "POST",
      body: JSON.stringify({ kind, note })
    })
};
