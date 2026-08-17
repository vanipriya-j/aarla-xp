import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { IMG } from "../src/lib/images";
import { prismaCliUrl } from "../src/db/url";

const prisma = new PrismaClient({
  datasources: { db: { url: prismaCliUrl() } },
});
const PERSON = "person_vanipriya";

type PlaceSeed = {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  lat: number;
  lng: number;
  description: string;
  imageUrl: string;
  tags: string[];
  priceBand?: string;
};

type ActivitySeed = {
  id: string;
  name: string;
  slug: string;
  placeId: string;
  summary: string;
  durationMin: number;
  effort: string;
  priceMin: number;
  priceMax: number;
  priceBand: string;
  karma: Record<string, number>;
  tags: string[];
  audience: string[];
  imageUrl: string;
  parentalEffort?: string;
  travelEffort?: string;
  touristyScore?: number;
  quality?: number;
  energy?: string;
};

const places: PlaceSeed[] = [
  p("place_kapaleeshwarar", "Kapaleeshwarar Temple streets", "kapaleeshwarar-streets", "Mylapore", 13.0336, 80.2697, "Lived-in temple streets, flower sellers, and evening light.", IMG.temple, ["heritage", "local", "mylapore"]),
  p("place_rayar", "Rayar's Café", "rayars-cafe", "Mylapore", 13.0348, 80.2681, "A standing-room filter coffee stop that still feels like Mylapore.", IMG.coffee, ["coffee", "local"]),
  p("place_sabha", "A small sabha in Mylapore", "mylapore-sabha", "Mylapore", 13.036, 80.267, "A compact hall for short classical recitals.", IMG.concert, ["music", "carnatic"]),
  p("place_amethyst", "Amethyst", "amethyst", "Alwarpet", 13.033, 80.254, "Garden, gallery and a design-minded pause.", IMG.art, ["gallery", "contemporary"]),
  p("place_design", "A design store in Alwarpet", "alwarpet-design", "Alwarpet", 13.032, 80.252, "Objects, books and textiles with a Chennai accent.", IMG.design, ["design", "contemporary"]),
  p("place_alwarpet_dinner", "A quiet Alwarpet table", "alwarpet-dinner", "Alwarpet", 13.031, 80.251, "Dinner that does not shout.", IMG.food, ["dinner", "food"]),
  p("place_elliot", "Elliot's Beach", "elliots-beach", "Besant Nagar", 13.0006, 80.2665, "The gentler end of the south Chennai shore.", IMG.beach, ["beach", "slow"]),
  p("place_marina", "Marina Beach", "marina-beach", "Triplicane", 13.053, 80.282, "The postcard stretch. Beautiful, and very seen.", IMG.beach, ["beach", "tourist"]),
  p("place_dakshinachitra", "DakshinaChitra", "dakshinachitra", "Muttukadu", 12.825, 80.242, "Living-history campus of South Indian houses and crafts.", IMG.museum, ["heritage", "family", "contained"]),
  p("place_govt_museum", "Government Museum", "government-museum", "Egmore", 13.069, 80.261, "Bronze, archaeology and a slightly dusty grandeur.", IMG.museum, ["museum", "culture"]),
  p("place_kalakshetra", "Kalakshetra", "kalakshetra", "Thiruvanmiyur", 12.989, 80.266, "A campus where music and dance still feel like study.", IMG.concert, ["music", "dance"]),
  p("place_phoenix", "A multiplex in Velachery", "velachery-cinema", "Velachery", 12.981, 80.218, "Standard comfortable cinema.", IMG.cinema, ["movie", "cinema"]),
  p("place_pvr", "A city-centre cinema", "city-cinema", "Nungambakkam", 13.06, 80.243, "Another reliable screen.", IMG.cinema, ["movie"]),
  p("place_quiz", "A quiz room in T. Nagar", "tnagar-quiz", "T. Nagar", 13.041, 80.233, "Tables, buzzers, unnecessarily specific knowledge.", IMG.games, ["quiz", "friends"]),
  p("place_boardgame", "Board game café", "boardgame-cafe", "Adyar", 13.006, 80.257, "Shelves of games and decent coffee.", IMG.games, ["games", "friends"]),
  p("place_pottery", "A pottery studio", "pottery-studio", "Neelankarai", 12.949, 80.259, "Wheels, clay, and a longish ride south.", IMG.pottery, ["workshop", "create"]),
  p("place_kids_museum", "Interactive children's gallery", "kids-gallery", "Kotturpuram", 13.018, 80.243, "A contained space where children can wander without vanishing.", IMG.kids, ["kids", "contained", "family"]),
  p("place_fair", "Weekend neighbourhood fair", "neighbourhood-fair", "Anna Nagar", 13.087, 80.217, "Crowds, stalls, and a lot of chasing.", IMG.market, ["fair", "unstructured-crowd"]),
  p("place_bookstore", "An independent bookstore", "indie-bookstore", "Nungambakkam", 13.059, 80.245, "New spines and a quiet corner.", IMG.books, ["books"]),
  p("place_theatre", "A black-box theatre", "blackbox-theatre", "Alwarpet", 13.03, 80.25, "Small productions, close seats.", IMG.theatre, ["theatre"]),
];

const extraNeighborhoods = [
  ["Mylapore", 13.033, 80.27],
  ["Adyar", 13.006, 80.257],
  ["Besant Nagar", 13.001, 80.267],
  ["Alwarpet", 13.033, 80.254],
  ["T. Nagar", 13.04, 80.234],
  ["Nungambakkam", 13.06, 80.243],
  ["Egmore", 13.073, 80.261],
  ["Triplicane", 13.058, 80.275],
  ["Thiruvanmiyur", 12.986, 80.259],
  ["Velachery", 12.98, 80.22],
] as const;

const extraPlaceKinds: Array<[string, string, string[]]> = [
  ["café", IMG.coffee, ["coffee", "food"]],
  ["gallery", IMG.art, ["art", "contemporary"]],
  ["park", IMG.park, ["outdoors", "move"]],
  ["library nook", IMG.books, ["books", "rest"]],
  ["music room", IMG.concert, ["music"]],
];

extraNeighborhoods.forEach(([neighborhood, lat, lng], i) => {
  extraPlaceKinds.forEach(([kind, image, tags], j) => {
    const n = i * extraPlaceKinds.length + j;
    places.push(
      p(
        `place_extra_${n}`,
        `${neighborhood} ${kind}`,
        `extra-${neighborhood.toLowerCase().replace(/\W+/g, "-")}-${j}`,
        neighborhood,
        lat + j * 0.001,
        lng + i * 0.001,
        `A ${kind} that belongs to ${neighborhood}.`,
        image,
        tags,
      ),
    );
  });
});

const activities: ActivitySeed[] = [
  a("act_mylapore_walk", "Walk around Mylapore temple streets", "mylapore-walk", "place_kapaleeshwarar", "A short wander through flower stalls, temple walls and evening talk.", 40, "EASY", 0, 0, "₹", { explore: 0.6, culture: 0.8, social: 0.2 }, ["walk", "local", "heritage", "mylapore", "lived"], ["us-friends", "just-me", "any"], IMG.temple, "LOW", "LOW", 0.18, 0.9),
  a("act_filter_coffee", "Filter coffee in Mylapore", "filter-coffee", "place_rayar", "A standing coffee that tastes like the neighbourhood.", 25, "EASY", 80, 200, "₹", { social: 0.4, culture: 0.4, rest: 0.3 }, ["coffee", "food", "local"], ["us-friends", "just-me", "any"], IMG.coffee, "LOW", "LOW", 0.12, 0.86),
  a("act_carnatic_short", "A short classical music stop", "short-carnatic", "place_sabha", "Forty-five minutes of voice or violin, close enough to feel the tala.", 50, "EASY", 300, 800, "₹₹", { culture: 0.95, rest: 0.2 }, ["music", "carnatic", "concert", "local"], ["just-me", "us-friends"], IMG.concert, "LOW", "LOW", 0.2, 0.94),
  a("act_gallery_hop", "Gallery hop in Alwarpet", "gallery-hop", "place_amethyst", "Two or three rooms of contemporary work, then the garden.", 50, "EASY", 0, 200, "₹", { culture: 0.7, explore: 0.4 }, ["gallery", "contemporary", "art"], ["us-friends", "just-me", "family"], IMG.art, "LOW", "LOW", 0.22, 0.84),
  a("act_design_store", "Design store browse", "design-store", "place_design", "Textiles, objects, and the pleasure of looking without a checklist.", 35, "EASY", 400, 1800, "₹₹", { create: 0.3, culture: 0.4, explore: 0.4 }, ["design", "contemporary"], ["us-friends", "just-me"], IMG.design, "LOW", "LOW", 0.25, 0.8),
  a("act_alwarpet_dinner", "Dinner in Alwarpet", "alwarpet-dinner", "place_alwarpet_dinner", "A table that lets conversation stay at the centre.", 70, "EASY", 1400, 2200, "₹₹", { social: 0.8, rest: 0.3 }, ["dinner", "food"], ["us-friends", "family"], IMG.food, "LOW", "LOW", 0.28, 0.82),
  a("act_beach_walk", "Besant Nagar beach walk", "beach-walk", "place_elliot", "Sea air and a slower pace at the south end of the city.", 40, "EASY", 0, 0, "₹", { move: 0.5, rest: 0.4, explore: 0.3 }, ["beach", "walk", "slow", "outdoors"], ["us-friends", "family", "just-me"], IMG.beach, "LOW", "LOW", 0.3, 0.8),
  a("act_beach_food", "Beach-side food", "beach-food", "place_elliot", "Something simple within earshot of the water.", 40, "EASY", 400, 900, "₹₹", { social: 0.5, rest: 0.3 }, ["food", "beach", "slow"], ["us-friends", "family"], IMG.food, "LOW", "LOW", 0.32, 0.76),
  a("act_live_music", "Live music by the sea", "live-music-beach", "place_elliot", "A small set, not a festival.", 45, "EASY", 0, 500, "₹", { culture: 0.5, social: 0.4 }, ["music", "slow"], ["us-friends", "just-me"], IMG.concert, "LOW", "LOW", 0.28, 0.78),
  a("act_marina", "Marina promenade", "marina-promenade", "place_marina", "The famous stretch. Easy to love, easy to feel herded.", 50, "EASY", 0, 200, "₹", { explore: 0.4, social: 0.3 }, ["beach", "tourist"], ["any"], IMG.beach, "MEDIUM", "LOW", 0.86, 0.6),
  a("act_movie_one", "An evening screening", "evening-screening", "place_phoenix", "A comfortable movie with assigned seats and cold air.", 150, "EASY", 250, 450, "₹₹", { rest: 0.5, social: 0.3 }, ["movie", "cinema", "film"], ["any", "family", "just-me"], IMG.cinema, "LOW", "MODERATE", 0.45, 0.7),
  a("act_movie_two", "Another good movie", "another-movie", "place_pvr", "A second screen, same grammar.", 150, "EASY", 280, 480, "₹₹", { rest: 0.5, social: 0.3 }, ["movie", "cinema", "film"], ["any"], IMG.cinema, "LOW", "MODERATE", 0.48, 0.68),
  a("act_movie_three", "A quieter film", "quiet-film", "place_pvr", "Something less noisy than the weekend blockbuster.", 140, "EASY", 220, 400, "₹₹", { culture: 0.4, rest: 0.5 }, ["movie", "cinema", "film"], ["just-me"], IMG.cinema, "LOW", "MODERATE", 0.4, 0.74),
  a("act_quiz", "A quiz night with friends", "quiz-night", "place_quiz", "Teams, terrible puns, and the joy of knowing one obscure fact.", 120, "EASY", 400, 800, "₹₹", { play: 0.8, social: 0.7, learn: 0.4 }, ["quiz", "game", "friends", "nerd"], ["nerd-gang", "friends"], IMG.games, "LOW", "MODERATE", 0.2, 0.88),
  a("act_boardgames", "Board games in Adyar", "board-games", "place_boardgame", "A long table and a game that asks you to think together.", 110, "EASY", 350, 700, "₹₹", { play: 0.7, social: 0.6 }, ["game", "puzzle", "friends"], ["nerd-gang"], IMG.games, "LOW", "LOW", 0.15, 0.84),
  a("act_pottery", "Pottery workshop", "pottery-workshop", "place_pottery", "Clay on the hands. The studio is a bit of a trek.", 150, "MODERATE", 1200, 1800, "₹₹", { create: 0.8, learn: 0.5, social: 0.3 }, ["workshop", "create", "pottery"], ["just-me", "family"], IMG.pottery, "MEDIUM", "HIGH", 0.2, 0.83),
  a("act_kids_gallery", "Interactive children's gallery", "kids-gallery", "place_kids_museum", "A contained environment where curious children can move without constant herding.", 90, "EASY", 300, 600, "₹₹", { learn: 0.6, play: 0.5, culture: 0.3 }, ["kids", "contained", "kids-independent", "family", "museum"], ["family"], IMG.kids, "LOW", "LOW", 0.15, 0.9),
  a("act_fair", "Crowded weekend fair", "weekend-fair", "place_fair", "Stalls, noise, and a lot of unstructured moving parts.", 120, "HIGH", 400, 900, "₹₹", { social: 0.5, play: 0.3 }, ["fair", "unstructured-crowd", "family"], ["family"], IMG.market, "HIGH", "MODERATE", 0.4, 0.55),
  a("act_dakshina", "DakshinaChitra houses and crafts", "dakshinachitra-visit", "place_dakshinachitra", "Houses you can walk through, crafts you can watch. A longer outing.", 180, "MODERATE", 400, 900, "₹₹", { culture: 0.7, explore: 0.6, learn: 0.4 }, ["heritage", "family", "contained"], ["family"], IMG.museum, "LOW", "HIGH", 0.35, 0.86),
  a("act_bookstore", "Independent bookstore hour", "bookstore-hour", "place_bookstore", "No agenda except the next book.", 50, "EASY", 300, 900, "₹₹", { learn: 0.5, rest: 0.5 }, ["books"], ["just-me"], IMG.books, "LOW", "LOW", 0.15, 0.82),
  a("act_theatre", "A small play", "small-play", "place_theatre", "Close enough to see the actors think.", 110, "EASY", 400, 900, "₹₹", { culture: 0.8, social: 0.3 }, ["theatre"], ["just-me", "us-friends"], IMG.theatre, "LOW", "LOW", 0.22, 0.85),
  a("act_museum", "Government Museum hour", "govt-museum", "place_govt_museum", "Bronzes and a slower look at the city's older collections.", 80, "EASY", 50, 150, "₹", { culture: 0.8, learn: 0.5 }, ["museum", "heritage"], ["just-me", "family"], IMG.museum, "MEDIUM", "MODERATE", 0.4, 0.77),
  a("act_kalakshetra", "Kalakshetra campus hour", "kalakshetra-hour", "place_kalakshetra", "Trees, practice rooms, and the feeling of a school that still means it.", 70, "EASY", 0, 200, "₹", { culture: 0.7, rest: 0.3 }, ["music", "dance", "local"], ["just-me"], IMG.concert, "LOW", "MODERATE", 0.2, 0.88),
];

const extraActivityTemplates: Array<Omit<ActivitySeed, "id" | "slug" | "placeId"> & { placeIndex: number }> = [];

const generatedKinds: Array<{
  name: string;
  tags: string[];
  karma: Record<string, number>;
  duration: number;
  price: [number, number];
  image: string;
  audience: string[];
}> = [
  { name: "Neighbourhood coffee", tags: ["coffee", "food", "local"], karma: { social: 0.3, rest: 0.3 }, duration: 30, price: [80, 220], image: IMG.coffee, audience: ["any"] },
  { name: "Small gallery visit", tags: ["art", "contemporary", "gallery"], karma: { culture: 0.6, explore: 0.3 }, duration: 45, price: [0, 200], image: IMG.art, audience: ["just-me", "us-friends"] },
  { name: "Park walk", tags: ["outdoors", "move", "walk"], karma: { move: 0.7, rest: 0.2 }, duration: 40, price: [0, 0], image: IMG.park, audience: ["family", "just-me"] },
  { name: "Reading hour", tags: ["books", "rest"], karma: { learn: 0.4, rest: 0.6 }, duration: 50, price: [0, 300], image: IMG.books, audience: ["just-me"] },
  { name: "Contemporary music set", tags: ["music", "contemporary"], karma: { culture: 0.6, social: 0.3 }, duration: 70, price: [400, 900], image: IMG.concert, audience: ["just-me", "us-friends"] },
];

places.slice(20).forEach((place, index) => {
  const kind = generatedKinds[index % generatedKinds.length];
  activities.push(
    a(
      `act_extra_${index}`,
      `${kind.name} in ${place.neighborhood}`,
      `extra-act-${index}`,
      place.id,
      `${kind.name} that belongs to ${place.neighborhood}, not a generic city product.`,
      kind.duration,
      "EASY",
      kind.price[0],
      kind.price[1],
      kind.price[1] > 400 ? "₹₹" : "₹",
      kind.karma,
      kind.tags,
      kind.audience,
      kind.image,
      "LOW",
      "LOW",
      0.25,
      0.7,
    ),
  );
});

void extraActivityTemplates;

async function main() {
  await prisma.interaction.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.planStep.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.karmaContribution.deleteMany();
  await prisma.leisureExperience.deleteMany();
  await prisma.event.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.place.deleteMany();
  await prisma.memoryProposal.deleteMany();
  await prisma.memoryEvidence.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.circleMember.deleteMany();
  await prisma.leisureIntent.deleteMany();
  await prisma.circle.deleteMany();
  await prisma.person.deleteMany();
  await prisma.providerCapability.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.sourceMapping.deleteMany();
  await prisma.rawSourceItem.deleteMany();
  await prisma.fetchRun.deleteMany();
  await prisma.source.deleteMany();

  await prisma.person.create({
    data: {
      id: PERSON,
      name: "Vanipriya",
      email: "vanipriya@gmail.com",
      locationLabel: "Chennai, India",
      city: "Chennai",
      country: "India",
      avatarUrl: IMG.portrait,
      isDemo: true,
    },
  });

  await prisma.circle.createMany({
    data: [
      { id: "circle_just_me", personId: PERSON, name: "Just me", slug: "just-me", relationship: "solo", description: "Music, books, and time that does not need translating.", inferred: true, avatarHint: "solo", memberSummary: "Vanipriya" },
      { id: "circle_family", personId: PERSON, name: "Family", slug: "family", relationship: "family", description: "Husband and two curious daughters. Low-chase outings work best.", inferred: true, avatarHint: "family", memberSummary: "Spouse + two girls" },
      { id: "circle_nerd", personId: PERSON, name: "Nerd gang", slug: "nerd-gang", relationship: "friends", description: "Quizzes, games, puzzles, and the pleasure of being exact.", inferred: true, avatarHint: "friends", memberSummary: "Nerdy friends" },
      { id: "circle_us", personId: PERSON, name: "US Friends", slug: "us-friends", relationship: "visitors", description: "Friends visiting from the US. She wants Chennai to feel like itself.", inferred: true, avatarHint: "visitors", memberSummary: "Visiting friends" },
    ],
  });

  await prisma.circleMember.createMany({
    data: [
      { circleId: "circle_family", displayName: "Husband", relationship: "spouse" },
      { circleId: "circle_family", displayName: "Older daughter", relationship: "child", ageBand: "7-9", notes: "Curious, likes making things." },
      { circleId: "circle_family", displayName: "Younger daughter", relationship: "child", ageBand: "4-6", notes: "Curious, tires if the outing is chaotic." },
    ],
  });

  await prisma.preference.createMany({
    data: [
      pref(PERSON, undefined, "LIKE", "music", "concerts", 1.2, "EXPLICIT", "I like going to concerts alone."),
      pref(PERSON, "circle_just_me", "LIKE", "music", "carnatic", 1.3, "EXPLICIT", "Especially enjoys the quality of a performance when solo."),
      pref(PERSON, "circle_family", "LIKE", "family", "low-supervision", 1.4, "EXPLICIT", "Children should stay independently engaged."),
      pref(PERSON, "circle_family", "DISLIKE", "family", "high-chase", 1.2, "EXPLICIT", "Does not want to spend the outing controlling the children."),
      pref(PERSON, "circle_nerd", "LIKE", "play", "quiz", 1.2, "EXPLICIT", "Friends like quizzes and gaming."),
      pref(PERSON, "circle_nerd", "LIKE", "play", "puzzles", 1.1, "EXPLICIT"),
      pref(PERSON, "circle_us", "LIKE", "place", "local-authentic", 1.3, "INFERRED", "When hosting, she wants a strong sense of place."),
      pref(PERSON, "circle_us", "DISLIKE", "place", "touristy", 1.2, "INFERRED"),
      pref(PERSON, undefined, "LIKE", "taste", "books", 0.9, "EXPLICIT"),
      pref(PERSON, undefined, "LIKE", "taste", "food", 0.8, "EXPLICIT"),
      pref(PERSON, undefined, "LIKE", "taste", "unusual", 0.7, "EXPLICIT"),
      pref(PERSON, undefined, "DISLIKE", "taste", "generic-commercial", 0.9, "EXPLICIT"),
      pref(PERSON, undefined, "CONSTRAINT", "travel_tolerance_km", "12", 1, "BEHAVIOURAL"),
    ],
  });

  const memories = [
    mem("EXPLICIT", "PERSON", PERSON, undefined, "music_solo", "I like going to concerts alone.", 0.95, "EXPLICIT"),
    mem("CIRCLE", "CIRCLE", PERSON, "circle_family", "parental_effort", "When out with family, she prefers activities where the children remain engaged without constant adult supervision.", 0.9, "EXPLICIT"),
    mem("CIRCLE", "CIRCLE", PERSON, "circle_nerd", "play", "Her friends circle likes gaming, quizzes and puzzles.", 0.88, "EXPLICIT"),
    mem("BEHAVIOURAL", "PERSON", PERSON, "circle_just_me", "music", "Saves music events frequently and attends them mostly solo.", 0.8, "BEHAVIOURAL"),
    mem("OBSERVATION", "PERSON", PERSON, "circle_us", "hosting", "When hosting visitors, she appears to value experiences that communicate a strong sense of place.", 0.74, "INFERRED"),
  ];
  for (const row of memories) {
    await prisma.memory.create({
      data: {
        ...row,
        evidence: {
          create: [{ kind: "UTTERANCE", excerpt: row.statement }],
        },
      },
    });
  }

  await prisma.source.createMany({
    data: [
      { id: "source_sample_chennai", slug: "sample-chennai", name: "Aarla sample catalog", type: "SAMPLE", termsStatus: "internal", robotsPolicy: "n/a", scrapeDecision: "not-applicable", attribution: "Seed fixtures", health: "HEALTHY" },
      { id: "source_mock", slug: "mock-source", name: "Mock connector", type: "MANUAL", termsStatus: "unknown", robotsPolicy: "unknown", scrapeDecision: "do-not-scrape", attribution: "none", health: "READY" },
    ],
  });

  for (const place of places) {
    await prisma.place.create({
      data: {
        id: place.id,
        name: place.name,
        slug: place.slug,
        neighborhood: place.neighborhood,
        city: "Chennai",
        lat: place.lat,
        lng: place.lng,
        description: place.description,
        imageUrl: place.imageUrl,
        tagsJson: JSON.stringify(place.tags),
        priceBand: place.priceBand,
        isSample: true,
        provenance: "source_sample_chennai",
      },
    });
  }

  for (const activity of activities) {
    await prisma.activity.create({
      data: {
        id: activity.id,
        name: activity.name,
        slug: activity.slug,
        placeId: activity.placeId,
        summary: activity.summary,
        imageUrl: activity.imageUrl,
        durationMin: activity.durationMin,
        effort: activity.effort,
        priceMin: activity.priceMin,
        priceMax: activity.priceMax,
        priceBand: activity.priceBand,
        karmaJson: JSON.stringify(activity.karma),
        tagsJson: JSON.stringify(activity.tags),
        audienceJson: JSON.stringify(activity.audience),
        parentalEffort: activity.parentalEffort,
        travelEffort: activity.travelEffort,
        touristyScore: activity.touristyScore ?? 0.3,
        quality: activity.quality ?? 0.75,
        energy: activity.energy,
        isSample: true,
        provenance: "source_sample_chennai",
      },
    });
  }

  const now = new Date("2026-08-17T10:00:00.000Z");
  const events = [
    ev("event_carnatic", "Intimate Carnatic hour", "intimate-carnatic", "act_carnatic_short", "place_sabha", addDays(now, 2), IMG.concert, 400, 800),
    ev("event_quiz", "Tuesday quiz", "tuesday-quiz", "act_quiz", "place_quiz", addDays(now, 1), IMG.games, 400, 700),
    ev("event_play", "A new one-act", "one-act", "act_theatre", "place_theatre", addDays(now, 4), IMG.theatre, 500, 900),
    ev("event_movie", "Weekend screening", "weekend-screening", "act_movie_one", "place_phoenix", addDays(now, 3), IMG.cinema, 250, 450),
  ];
  for (let i = 0; i < 28; i++) {
    const activity = activities[i % activities.length];
    events.push(
      ev(
        `event_extra_${i}`,
        `${activity.name} — slot ${i + 1}`,
        `event-extra-${i}`,
        activity.id,
        activity.placeId,
        addDays(now, (i % 12) + 1),
        activity.imageUrl,
        activity.priceMin,
        activity.priceMax,
      ),
    );
  }
  for (const event of events) {
    await prisma.event.create({ data: event });
  }

  const history = [
    exp("exp_concert_1", "circle_just_me", "act_carnatic_short", "Intimate Carnatic concert", -6, true, { culture: 0.9, rest: 0.2 }, "Went alone. Stayed till the end."),
    exp("exp_concert_2", "circle_just_me", "act_kalakshetra", "Kalakshetra evening", -18, true, { culture: 0.8 }, "Quiet and exact."),
    exp("exp_books", "circle_just_me", "act_bookstore", "Bookstore hour", -10, true, { learn: 0.5, rest: 0.4 }),
    exp("exp_quiz", "circle_nerd", "act_quiz", "Quiz night", -12, true, { play: 0.8, social: 0.6 }),
    exp("exp_games", "circle_nerd", "act_boardgames", "Board games", -20, false, { play: 0.6, social: 0.5 }),
    exp("exp_kids", "circle_family", "act_kids_gallery", "Children's gallery", -8, true, { learn: 0.5, play: 0.4, social: 0.3 }, "The girls disappeared into the rooms. Nobody had to be managed."),
    exp("exp_movie_1", "circle_family", "act_movie_one", "Movie", -3, false, { rest: 0.5, social: 0.3 }),
    exp("exp_movie_2", "circle_family", "act_movie_two", "Movie", -9, false, { rest: 0.5, social: 0.3 }),
    exp("exp_movie_3", "circle_just_me", "act_movie_three", "Movie", -14, false, { rest: 0.5 }),
    exp("exp_dinner", "circle_us", "act_alwarpet_dinner", "Restaurant", -5, true, { social: 0.7, culture: 0.2 }),
    exp("exp_walk", "circle_us", "act_mylapore_walk", "Mylapore evening walk", -30, true, { culture: 0.7, explore: 0.4 }),
  ];
  for (const item of history) {
    await prisma.leisureExperience.create({
      data: {
        ...item,
        contributions: {
          create: Object.entries(JSON.parse(item.karmaJson) as Record<string, number>).map(([dimension, weight]) => ({
            dimension,
            weight,
          })),
        },
      },
    });
  }

  await seedPlan({
    id: "plan_upcoming_mylapore",
    title: "Mylapore streets + coffee + a short classical music stop",
    personality: "BEST_FIT",
    status: "UPCOMING",
    circleId: "circle_us",
    explanation: "A lived-in evening for visitors that does not become a sightseeing checklist.",
    imageUrl: IMG.temple,
    startAt: addDays(now, 1),
    duration: 180,
    spend: [1800, 2700],
    steps: [
      ["TRAVEL", "Leave home", 25, undefined, "RIDE_DEEPLINK"],
      ["WALK", "Walk around Mylapore temple streets", 40, "act_mylapore_walk"],
      ["MEAL", "Filter coffee", 25, "act_filter_coffee"],
      ["ACTIVITY", "Short classical music experience", 50, "act_carnatic_short", "EVENT_BOOK"],
      ["MEAL", "Optional dinner", 40, "act_alwarpet_dinner", "DINING_RESERVE"],
      ["TRAVEL", "Ride home", 20, undefined, "RIDE_DEEPLINK"],
    ],
  });

  await seedPlan({
    id: "plan_saved_gallery",
    title: "Gallery hop + design store + dinner in Alwarpet",
    personality: "CONTEMPORARY",
    status: "SAVED",
    circleId: "circle_us",
    explanation: "A more contemporary reading of the same three hours.",
    imageUrl: IMG.art,
    startAt: addDays(now, 5),
    duration: 175,
    spend: [2000, 3000],
    steps: [
      ["TRAVEL", "Leave home", 20],
      ["ACTIVITY", "Gallery hop", 50, "act_gallery_hop"],
      ["ACTIVITY", "Design store", 35, "act_design_store"],
      ["MEAL", "Dinner in Alwarpet", 70, "act_alwarpet_dinner"],
    ],
  });

  await seedPlan({
    id: "plan_saved_slow",
    title: "Beach-side walk + food + live music",
    personality: "SLOW",
    status: "SAVED",
    circleId: "circle_us",
    explanation: "If the evening wants air more than streets.",
    imageUrl: IMG.beach,
    startAt: addDays(now, 6),
    duration: 165,
    spend: [800, 1600],
    steps: [
      ["WALK", "Besant Nagar beach walk", 40, "act_beach_walk"],
      ["MEAL", "Beach-side food", 40, "act_beach_food"],
      ["ACTIVITY", "Live music", 45, "act_live_music"],
    ],
  });

  await seedPlan({
    id: "plan_family",
    title: "Interactive gallery + a calm snack",
    personality: "BEST_FIT",
    status: "UPCOMING",
    circleId: "circle_family",
    explanation: "The children can explore without being managed the whole time.",
    imageUrl: IMG.kids,
    startAt: addDays(now, 2),
    duration: 130,
    spend: [500, 900],
    steps: [
      ["ACTIVITY", "Interactive children's gallery", 90, "act_kids_gallery"],
      ["MEAL", "A calm snack nearby", 40, "act_filter_coffee"],
    ],
  });

  await seedPlan({
    id: "plan_done_quiz",
    title: "Quiz night with the nerd gang",
    personality: "BEST_FIT",
    status: "DONE",
    circleId: "circle_nerd",
    explanation: "Exactly their kind of evening.",
    imageUrl: IMG.games,
    startAt: addDays(now, -12),
    duration: 140,
    spend: [400, 800],
    steps: [["ACTIVITY", "Quiz night", 120, "act_quiz"]],
  });

  await prisma.booking.createMany({
    data: [
      { id: "book_concert", personId: PERSON, planId: "plan_upcoming_mylapore", kind: "TICKET", title: "Short classical music stop", venue: "Mylapore sabha", startsAt: addDays(now, 1), status: "CONFIRMED", providerSlug: "mdnd", reference: "MOCK-8821", imageUrl: IMG.concert, isMock: true },
      { id: "book_dinner", personId: PERSON, planId: "plan_saved_gallery", kind: "RESTAURANT", title: "Alwarpet table", venue: "Alwarpet", startsAt: addDays(now, 5), status: "UPCOMING", providerSlug: "dineout", reference: "MOCK-4410", imageUrl: IMG.food, isMock: true },
      { id: "book_quiz", personId: PERSON, planId: "plan_done_quiz", kind: "ACTIVITY", title: "Tuesday quiz", venue: "T. Nagar", startsAt: addDays(now, -12), status: "DONE", providerSlug: "manual", imageUrl: IMG.games, isMock: true },
    ],
  });

  await prisma.favorite.createMany({
    data: [
      { personId: PERSON, targetType: "PLAN", targetId: "plan_saved_gallery", title: "Gallery hop + design store + dinner", imageUrl: IMG.art },
      { personId: PERSON, targetType: "ACTIVITY", targetId: "act_carnatic_short", title: "Intimate Carnatic concerts", imageUrl: IMG.concert },
    ],
  });

  await prisma.provider.create({
    data: {
      id: "prov_uber",
      slug: "uber",
      name: "Uber",
      category: "ride",
      status: "MOCK",
      capabilities: { create: [{ capability: "RIDE_DEEPLINK", status: "MOCK" }] },
    },
  });

  console.log(`Seeded ${places.length} places, ${activities.length} activities, ${events.length} events.`);
}

async function seedPlan(input: {
  id: string;
  title: string;
  personality: string;
  status: string;
  circleId: string;
  explanation: string;
  imageUrl: string;
  startAt: Date;
  duration: number;
  spend: [number, number];
  steps: [string, string, number, string?, string?][];
}) {
  await prisma.plan.create({
    data: {
      id: input.id,
      personId: PERSON,
      circleId: input.circleId,
      title: input.title,
      personality: input.personality,
      explanation: input.explanation,
      startAt: input.startAt,
      durationMinutes: input.duration,
      estimatedSpendMin: input.spend[0],
      estimatedSpendMax: input.spend[1],
      status: input.status,
      stopCount: input.steps.filter((step) => step[0] !== "TRAVEL").length,
      effort: "Easy",
      imageUrl: input.imageUrl,
      isSample: true,
      steps: {
        create: input.steps.map((step, index) => ({
          sortOrder: index,
          kind: step[0],
          title: step[1],
          durationMin: step[2],
          activityId: step[3],
          actionKind: step[4],
          startsAt: new Date(input.startAt.getTime() + index * step[2] * 60000),
        })),
      },
    },
  });
}

function p(
  id: string,
  name: string,
  slug: string,
  neighborhood: string,
  lat: number,
  lng: number,
  description: string,
  imageUrl: string,
  tags: string[],
): PlaceSeed {
  return { id, name, slug, neighborhood, lat, lng, description, imageUrl, tags };
}

function a(
  id: string,
  name: string,
  slug: string,
  placeId: string,
  summary: string,
  durationMin: number,
  effort: string,
  priceMin: number,
  priceMax: number,
  priceBand: string,
  karma: Record<string, number>,
  tags: string[],
  audience: string[],
  imageUrl: string,
  parentalEffort = "LOW",
  travelEffort = "LOW",
  touristyScore = 0.3,
  quality = 0.75,
): ActivitySeed {
  return { id, name, slug, placeId, summary, durationMin, effort, priceMin, priceMax, priceBand, karma, tags, audience, imageUrl, parentalEffort, travelEffort, touristyScore, quality };
}

function pref(
  personId: string,
  circleId: string | undefined,
  type: string,
  key: string,
  value: string,
  weight: number,
  source: string,
  narrative?: string,
) {
  return { personId, circleId, type, key, value, weight, source, confidence: source === "EXPLICIT" ? 1 : 0.75, narrative };
}

function mem(
  layer: string,
  subjectType: string,
  personId: string,
  circleId: string | undefined,
  category: string,
  statement: string,
  confidence: number,
  source: string,
) {
  return { layer, subjectType, personId, circleId, category, statement, confidence, source, status: "ACTIVE" };
}

function ev(
  id: string,
  name: string,
  slug: string,
  activityId: string,
  placeId: string,
  startsAt: Date,
  imageUrl: string,
  priceMin: number,
  priceMax: number,
) {
  return {
    id,
    name,
    slug,
    activityId,
    placeId,
    startsAt,
    summary: name,
    imageUrl,
    priceMin,
    priceMax,
    availability: "AVAILABLE",
    isSample: true,
    provenance: "source_sample_chennai",
  };
}

function exp(
  id: string,
  circleId: string,
  activityId: string,
  title: string,
  daysAgo: number,
  loved: boolean,
  karma: Record<string, number>,
  notes?: string,
) {
  return {
    id,
    personId: PERSON,
    circleId,
    activityId,
    title,
    happenedAt: addDays(new Date("2026-08-17T10:00:00.000Z"), daysAgo),
    loved,
    notes,
    karmaJson: JSON.stringify(karma),
  };
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000);
}

export async function seedDatabase() {
  await main();
}

const invoked = process.argv[1] ?? "";
if (invoked.endsWith("prisma/seed.ts") || invoked.endsWith("prisma/seed")) {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
