import { api } from "../api/client";
import { mockApi } from "./mockApi";

export interface AppUser {
  id: string;
  name: string;
  phoneNumber: string;
  role?: "USER" | "ADMIN";
}

export interface AppActivity {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
}

export interface AppMatch {
  id: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";
  activity: { id?: string; name: string };
  otherUser?: { id: string; name: string };
  scheduledFor?: string | null;
  unreadCount?: number;
}

const iconMap: Record<string, string> = {
  "morning-walk": "🌅",
  "evening-walk": "🌆",
  "light-exercise": "💪",
  "chair-yoga": "🧘",
  stretching: "🤸",
  "board-games": "🎲",
  "card-games": "🃏",
  "chess-checkers": "♟️",
  "tea-chat": "☕",
  "phone-chat": "📞",
  "reading-circle": "📚",
  "religious-visit": "🕌",
  "prayer-group": "🙏",
  "slow-walk-temple": "🚶",
  "music-listening": "🎵",
  "sing-along": "🎤",
  "garden-visit": "🌳",
  "indoor-plants": "🌱",
  "video-call-family": "📹",
  "memory-sharing": "💭"
};

async function withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await primary();
  } catch {
    return fallback();
  }
}

export const appApi = {
  requestOtp: (phoneNumber: string) => withFallback(() => api.requestOtp(phoneNumber), () => mockApi.requestOtp(phoneNumber)),

  verifyOtp: (phoneNumber: string, otp: string, profile?: Parameters<typeof api.verifyOtp>[2]) =>
    withFallback(
      () => api.verifyOtp(phoneNumber, otp, profile),
      () => mockApi.verifyOtp(phoneNumber, otp)
    ),

  getActivities: async (): Promise<AppActivity[]> => {
    const activities = await withFallback(
      () => api.activities(),
      () => mockApi.getActivities()
    );

    return (activities as Array<any>).map((activity) => ({
      id: activity.id,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      icon: activity.icon || iconMap[activity.id] || "👥"
    }));
  },

  findMatches: async (activityId: string): Promise<AppMatch[] | { status: "searching"; message?: string }> => {
    const result = await withFallback(
      () => api.createMatch(activityId),
      async () => {
        const matches = await mockApi.findMatches(activityId);
        return matches.map((m) => ({
          id: m.id,
          status: "ACCEPTED",
          activity: m.activity,
          otherUser: { id: m.user.id, name: m.user.firstName },
          unreadCount: 0,
          scheduledFor: null
        }));
      }
    );

    if (result?.status === "searching") return result;
    return Array.isArray(result) ? result : [result];
  },

  listMatches: async (): Promise<AppMatch[]> => {
    const matches = await withFallback(
      () => api.listMatches(),
      async () => {
        const mockMatches = await mockApi.getMatches();
        return mockMatches.map((m) => ({
          id: m.id,
          status: "ACCEPTED",
          activity: { name: m.activity.name },
          otherUser: { id: m.id, name: m.user.firstName },
          unreadCount: 0,
          scheduledFor: null
        }));
      }
    );

    return (matches as Array<any>).map((match) => ({
      id: match.id,
      status: match.status,
      activity: match.activity,
      otherUser: match.otherUser || (match.user ? { id: match.user.id, name: match.user.firstName } : undefined),
      unreadCount: match.unreadCount || 0,
      scheduledFor: match.scheduledFor || null
    }));
  },

  respondMatch: (id: string, decision: "ACCEPTED" | "REJECTED") =>
    withFallback(() => api.respondMatch(id, decision), async () => ({ id, status: decision })),

  scheduleMatch: (id: string, scheduledFor: string) =>
    withFallback(() => api.scheduleMatch(id, scheduledFor), async () => ({ id, scheduledFor })),

  getMessages: (matchId: string) => withFallback(() => api.listMessages(matchId), () => mockApi.getMessages(matchId)),

  sendMessage: (matchId: string, content: string) => withFallback(() => api.sendMessage(matchId, content), () => mockApi.sendMessage(matchId, content)),

  getFrequentItems: (category: string) => mockApi.getFrequentItems(category),

  placeOrder: async (category: string, items: Array<{ id: string; quantity: number }>) => {
    const itemIds = items.flatMap((item) => Array(item.quantity).fill(item.id));

    const response = await withFallback(
      () => api.placeOrder(category, itemIds),
      () => mockApi.placeOrder({ category, items })
    );

    if ((response as any).order && (response as any).delivery) {
      const order = (response as any).order;
      const delivery = (response as any).delivery;
      return {
        orderId: order.id,
        estimatedDelivery: `${delivery.etaMinutes} minutes`,
        totalAmount: order.totalAmount
      };
    }

    return response as { orderId: string; estimatedDelivery: string; totalAmount?: number };
  },

  helpCheckIn: (kind: "EMERGENCY" | "SUPPORT" | "CAREGIVER", note?: string) =>
    withFallback(
      () => api.helpCheckIn(kind, note),
      async () => ({ success: true, kind, message: "Request received." })
    )
};
