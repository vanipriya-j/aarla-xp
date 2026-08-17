export const DEMO_PERSON_ID = "person_vanipriya";

export const ENGINE_VERSION = "leisure-agent.v0";

export const DEFAULT_ASK_QUERY =
  "I have 3 hours with friends from the US. Something very Chennai. Not too touristy. Budget around ₹3k.";

export const AGENT_STATES = [
  "Understanding your plan...",
  "Looking at what fits...",
  "Checking whether it works in the time you have...",
  "Putting together a few possibilities...",
] as const;

export const QUICK_CUES = [
  { id: "surprise", label: "Surprise me", prompt: "Surprise me this weekend." },
  { id: "hours", label: "I have 2–3 hours", prompt: "I have about 2–3 hours this evening. What should I do?" },
  { id: "kids", label: "With kids", prompt: "Something for this afternoon with my two little girls — they are curious, and I don't want to spend the whole time managing them." },
  { id: "low", label: "Low energy", prompt: "Low energy this evening. Something gentle and close by." },
  { id: "date", label: "Date night", prompt: "Date night with my husband. Something warm, not too loud." },
  { id: "weekend", label: "Weekend plans", prompt: "Help me plan this weekend. Mix of family and a little time for myself." },
  { id: "friends", label: "With friends", prompt: "I have a few hours with friends. Something we can actually talk through." },
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "home", desktop: true, mobile: false },
  { href: "/", label: "For You", icon: "home", desktop: false, mobile: true },
  { href: "/discover", label: "Discover", icon: "search", desktop: true, mobile: false },
  { href: "/discover", label: "Search", icon: "search", desktop: false, mobile: true },
  { href: "/plans", label: "Plans", icon: "plans", desktop: true, mobile: true },
  { href: "/bookings", label: "Bookings", icon: "ticket", desktop: true, mobile: true },
  { href: "/karma", label: "XP Karma", icon: "karma", desktop: true, mobile: false },
  { href: "/play", label: "Play", icon: "play", desktop: true, mobile: false },
  { href: "/favorites", label: "Favorites", icon: "heart", desktop: true, mobile: false },
  { href: "/circles", label: "Circles", icon: "circles", desktop: true, mobile: false },
  { href: "/profile", label: "Profile", icon: "profile", desktop: true, mobile: true },
] as const;
