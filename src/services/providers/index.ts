import type { ProviderAction } from "@/domains/types";

export type ProviderStatus =
  | "LIVE_API"
  | "PARTNER_API"
  | "MCP"
  | "DEEPLINK"
  | "AFFILIATE"
  | "WEB_HANDOFF"
  | "MOCK"
  | "UNAVAILABLE";

export interface ProviderDefinition {
  slug: string;
  name: string;
  category: string;
  status: ProviderStatus;
  capabilities: { capability: string; status: ProviderStatus; label: string }[];
}

export const PROVIDERS: ProviderDefinition[] = [
  {
    slug: "uber",
    name: "Uber",
    category: "ride",
    status: "MOCK",
    capabilities: [
      { capability: "RIDE_ESTIMATE", status: "MOCK", label: "Estimate a ride" },
      { capability: "RIDE_DEEPLINK", status: "MOCK", label: "Open ride options" },
    ],
  },
  {
    slug: "ola",
    name: "Ola",
    category: "ride",
    status: "MOCK",
    capabilities: [{ capability: "RIDE_DEEPLINK", status: "MOCK", label: "Book a ride" }],
  },
  {
    slug: "rapido",
    name: "Rapido",
    category: "ride",
    status: "MOCK",
    capabilities: [{ capability: "RIDE_DEEPLINK", status: "MOCK", label: "Get a bike" }],
  },
  {
    slug: "call-driver",
    name: "Call Driver",
    category: "driver",
    status: "UNAVAILABLE",
    capabilities: [{ capability: "DRIVER_BOOK", status: "UNAVAILABLE", label: "Call a driver" }],
  },
  {
    slug: "valet",
    name: "Valet",
    category: "valet",
    status: "UNAVAILABLE",
    capabilities: [{ capability: "VALET_BOOK", status: "UNAVAILABLE", label: "Arrange valet" }],
  },
  {
    slug: "bookmyshow",
    name: "BookMyShow",
    category: "tickets",
    status: "MOCK",
    capabilities: [{ capability: "EVENT_BOOK", status: "MOCK", label: "Find tickets" }],
  },
  {
    slug: "mdnd",
    name: "MDND",
    category: "tickets",
    status: "MOCK",
    capabilities: [{ capability: "EVENT_BOOK", status: "MOCK", label: "Local tickets" }],
  },
  {
    slug: "dineout",
    name: "Dineout",
    category: "dining",
    status: "MOCK",
    capabilities: [{ capability: "DINING_RESERVE", status: "MOCK", label: "Reserve a table" }],
  },
  {
    slug: "swiggy",
    name: "Swiggy",
    category: "food",
    status: "MOCK",
    capabilities: [{ capability: "FOOD_ORDER", status: "MOCK", label: "Order food" }],
  },
  {
    slug: "zomato",
    name: "Zomato",
    category: "food",
    status: "MOCK",
    capabilities: [
      { capability: "DINING_SEARCH", status: "MOCK", label: "Find a table" },
      { capability: "FOOD_ORDER", status: "MOCK", label: "Order in" },
    ],
  },
  {
    slug: "maps",
    name: "Maps",
    category: "maps",
    status: "MOCK",
    capabilities: [{ capability: "MAP_ROUTE", status: "MOCK", label: "View map" }],
  },
  {
    slug: "calendar",
    name: "Calendar",
    category: "calendar",
    status: "MOCK",
    capabilities: [{ capability: "CALENDAR_ADD", status: "MOCK", label: "Add to calendar" }],
  },
];

export function actionsForNeed(need: string): ProviderAction[] {
  const map: Record<string, string[]> = {
    ride: ["RIDE_ESTIMATE", "RIDE_DEEPLINK", "RIDE_BOOK"],
    dining: ["DINING_SEARCH", "DINING_RESERVE"],
    tickets: ["EVENT_BOOK"],
    food: ["FOOD_ORDER"],
    map: ["MAP_ROUTE"],
    calendar: ["CALENDAR_ADD"],
    transport: ["RIDE_DEEPLINK", "DRIVER_BOOK"],
  };
  const wanted = map[need] ?? [need];
  return PROVIDERS.flatMap((provider) =>
    provider.capabilities
      .filter((cap) => wanted.includes(cap.capability))
      .map((cap) => ({
        providerSlug: provider.slug,
        providerName: provider.name,
        capability: cap.capability,
        status: cap.status,
        label: cap.label,
        live: cap.status === "LIVE_API" || cap.status === "PARTNER_API",
      })),
  );
}

export function isLiveAction(action: ProviderAction) {
  return action.live;
}
