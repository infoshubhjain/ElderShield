import { PrismaClient } from "@prisma/client";

export const ACTIVITY_CATALOG = [
  { id: "morning-walk", name: "Morning walk", category: "Wellness", description: "A light morning walk nearby." },
  { id: "evening-walk", name: "Evening walk", category: "Wellness", description: "A gentle evening stroll." },
  { id: "light-exercise", name: "Gentle exercise", category: "Wellness", description: "Low-impact movement suitable for seniors." },
  { id: "chair-yoga", name: "Chair yoga", category: "Wellness", description: "Seated stretches for flexibility and comfort." },
  { id: "stretching", name: "Light stretching", category: "Wellness", description: "Simple guided stretching routine." },
  { id: "board-games", name: "Board games", category: "Leisure", description: "Play easy and familiar board games." },
  { id: "card-games", name: "Card games", category: "Leisure", description: "Friendly card games with a companion." },
  { id: "chess-checkers", name: "Chess or checkers", category: "Leisure", description: "Classic strategy games at a relaxed pace." },
  { id: "tea-chat", name: "Conversation over tea", category: "Social", description: "Simple one-to-one social catch-up." },
  { id: "phone-chat", name: "Phone conversation", category: "Social", description: "Friendly phone chat for connection." },
  { id: "reading-circle", name: "Reading together", category: "Leisure", description: "Read and discuss short stories together." },
  { id: "religious-visit", name: "Religious visit", category: "Community", description: "Visit a local place of worship." },
  { id: "prayer-group", name: "Prayer or meditation", category: "Community", description: "Quiet shared prayer or meditation." },
  { id: "slow-walk-temple", name: "Slow walk near temple/church", category: "Community", description: "Unhurried walk in a familiar area." },
  { id: "music-listening", name: "Listening to music", category: "Leisure", description: "Enjoy favorite songs together." },
  { id: "sing-along", name: "Sing-along", category: "Leisure", description: "Sing familiar songs with a partner." },
  { id: "garden-visit", name: "Visit to park or garden", category: "Outdoors", description: "Relaxing walk in greenery." },
  { id: "indoor-plants", name: "Indoor gardening or plants", category: "Outdoors", description: "Care for indoor plants and chat." },
  { id: "video-call-family", name: "Video call with family", category: "Social", description: "Set up and join a family video call." },
  { id: "memory-sharing", name: "Sharing memories and stories", category: "Social", description: "Talk about life memories and experiences." }
] as const;

export async function ensureActivityCatalog(prisma: PrismaClient) {
  await Promise.all(
    ACTIVITY_CATALOG.map((activity) =>
      prisma.activity.upsert({
        where: { id: activity.id },
        create: { ...activity },
        update: {
          name: activity.name,
          category: activity.category,
          description: activity.description,
          isActive: true
        }
      })
    )
  );
}

export async function ensureDefaultPaymentMethod(prisma: PrismaClient, userId: string) {
  const existing = await prisma.paymentMethod.findFirst({
    where: { userId, isDefault: true }
  });
  if (existing) return existing;

  return prisma.paymentMethod.create({
    data: {
      userId,
      provider: "Cash on delivery",
      tokenLast4: "0000",
      isDefault: true
    }
  });
}
