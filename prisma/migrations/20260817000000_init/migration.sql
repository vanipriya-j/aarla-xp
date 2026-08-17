-- CreateTable
CREATE TABLE "xp_people" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "locationLabel" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xp_people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_circles" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "relationship" TEXT,
    "description" TEXT,
    "inferred" BOOLEAN NOT NULL DEFAULT true,
    "avatarHint" TEXT,
    "memberSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xp_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_circle_members" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "relationship" TEXT,
    "ageBand" TEXT,
    "notes" TEXT,

    CONSTRAINT "xp_circle_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_preferences" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "circleId" TEXT,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "narrative" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xp_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_memories" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "circleId" TEXT,
    "subjectType" TEXT NOT NULL,
    "layer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastConfirmedAt" TIMESTAMP(3),

    CONSTRAINT "xp_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_memory_evidence" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "refId" TEXT,
    "excerpt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_memory_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_memory_proposals" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "mutation" TEXT NOT NULL,
    "evidenceJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_memory_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_leisure_intents" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "circleId" TEXT,
    "rawInput" TEXT NOT NULL,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "startingLocation" TEXT,
    "budgetAmount" DOUBLE PRECISION,
    "budgetCurrency" TEXT NOT NULL DEFAULT 'INR',
    "budgetScope" TEXT,
    "budgetFlexibility" TEXT,
    "companionsJson" TEXT,
    "moodJson" TEXT,
    "energy" TEXT,
    "positiveIntentsJson" TEXT,
    "negativeIntentsJson" TEXT,
    "occasion" TEXT,
    "visitorContext" TEXT,
    "hardConstraintsJson" TEXT,
    "softPreferencesJson" TEXT,
    "inferredContextJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_leisure_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_sources" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseUrl" TEXT,
    "termsStatus" TEXT,
    "robotsPolicy" TEXT,
    "scrapeDecision" TEXT,
    "attribution" TEXT,
    "health" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_fetch_runs" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "xp_fetch_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_raw_source_items" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT,
    "rawPayload" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerified" TIMESTAMP(3),

    CONSTRAINT "xp_raw_source_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_source_mappings" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "rawItemId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "similarityScore" DOUBLE PRECISION,

    CONSTRAINT "xp_source_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_places" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "description" TEXT,
    "imageUrl" TEXT,
    "tagsJson" TEXT,
    "openingHours" TEXT,
    "priceBand" TEXT,
    "isSample" BOOLEAN NOT NULL DEFAULT true,
    "provenance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_activities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "placeId" TEXT,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "durationMin" INTEGER NOT NULL,
    "effort" TEXT NOT NULL,
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "priceBand" TEXT,
    "karmaJson" TEXT NOT NULL,
    "tagsJson" TEXT,
    "audienceJson" TEXT,
    "energy" TEXT,
    "parentalEffort" TEXT,
    "travelEffort" TEXT,
    "touristyScore" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "quality" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "isSample" BOOLEAN NOT NULL DEFAULT true,
    "provenance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "activityId" TEXT,
    "placeId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "summary" TEXT,
    "imageUrl" TEXT,
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "availability" TEXT,
    "isSample" BOOLEAN NOT NULL DEFAULT true,
    "provenance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_recommendations" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "intentId" TEXT,
    "planId" TEXT,
    "label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "ranking" INTEGER NOT NULL,
    "signalsJson" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_plans" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "circleId" TEXT,
    "intentId" TEXT,
    "title" TEXT NOT NULL,
    "personality" TEXT,
    "explanation" TEXT NOT NULL,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "estimatedSpendMin" INTEGER,
    "estimatedSpendMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "stopCount" INTEGER NOT NULL DEFAULT 0,
    "effort" TEXT,
    "imageUrl" TEXT,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xp_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_plan_steps" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3),
    "durationMin" INTEGER NOT NULL,
    "placeId" TEXT,
    "activityId" TEXT,
    "eventId" TEXT,
    "actionKind" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',

    CONSTRAINT "xp_plan_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_interactions" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT,
    "circleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_leisure_experiences" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "circleId" TEXT,
    "activityId" TEXT,
    "title" TEXT NOT NULL,
    "happenedAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER,
    "loved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "karmaJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_leisure_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_karma_contributions" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "xp_karma_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_providers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "logoHint" TEXT,

    CONSTRAINT "xp_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_provider_capabilities" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "xp_provider_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_bookings" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "planId" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "startsAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "providerSlug" TEXT,
    "reference" TEXT,
    "imageUrl" TEXT,
    "isMock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_favorites" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "xp_people_email_key" ON "xp_people"("email");

-- CreateIndex
CREATE UNIQUE INDEX "xp_circles_personId_slug_key" ON "xp_circles"("personId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "xp_sources_slug_key" ON "xp_sources"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "xp_raw_source_items_sourceId_externalId_key" ON "xp_raw_source_items"("sourceId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "xp_places_slug_key" ON "xp_places"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "xp_activities_slug_key" ON "xp_activities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "xp_events_slug_key" ON "xp_events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "xp_providers_slug_key" ON "xp_providers"("slug");

-- AddForeignKey
ALTER TABLE "xp_circles" ADD CONSTRAINT "xp_circles_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_circle_members" ADD CONSTRAINT "xp_circle_members_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "xp_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_preferences" ADD CONSTRAINT "xp_preferences_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_preferences" ADD CONSTRAINT "xp_preferences_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "xp_circles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_memories" ADD CONSTRAINT "xp_memories_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_memories" ADD CONSTRAINT "xp_memories_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "xp_circles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_memory_evidence" ADD CONSTRAINT "xp_memory_evidence_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "xp_memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_memory_proposals" ADD CONSTRAINT "xp_memory_proposals_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_leisure_intents" ADD CONSTRAINT "xp_leisure_intents_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_leisure_intents" ADD CONSTRAINT "xp_leisure_intents_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "xp_circles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_fetch_runs" ADD CONSTRAINT "xp_fetch_runs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "xp_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_raw_source_items" ADD CONSTRAINT "xp_raw_source_items_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "xp_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_source_mappings" ADD CONSTRAINT "xp_source_mappings_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "xp_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_source_mappings" ADD CONSTRAINT "xp_source_mappings_rawItemId_fkey" FOREIGN KEY ("rawItemId") REFERENCES "xp_raw_source_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_activities" ADD CONSTRAINT "xp_activities_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "xp_places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "xp_activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "xp_places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_recommendations" ADD CONSTRAINT "xp_recommendations_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_recommendations" ADD CONSTRAINT "xp_recommendations_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "xp_leisure_intents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_recommendations" ADD CONSTRAINT "xp_recommendations_planId_fkey" FOREIGN KEY ("planId") REFERENCES "xp_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_plans" ADD CONSTRAINT "xp_plans_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_plans" ADD CONSTRAINT "xp_plans_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "xp_circles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_plans" ADD CONSTRAINT "xp_plans_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "xp_leisure_intents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_plan_steps" ADD CONSTRAINT "xp_plan_steps_planId_fkey" FOREIGN KEY ("planId") REFERENCES "xp_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_plan_steps" ADD CONSTRAINT "xp_plan_steps_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "xp_places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_plan_steps" ADD CONSTRAINT "xp_plan_steps_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "xp_activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_plan_steps" ADD CONSTRAINT "xp_plan_steps_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "xp_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_interactions" ADD CONSTRAINT "xp_interactions_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_leisure_experiences" ADD CONSTRAINT "xp_leisure_experiences_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_leisure_experiences" ADD CONSTRAINT "xp_leisure_experiences_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "xp_circles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_leisure_experiences" ADD CONSTRAINT "xp_leisure_experiences_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "xp_activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_karma_contributions" ADD CONSTRAINT "xp_karma_contributions_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "xp_leisure_experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_provider_capabilities" ADD CONSTRAINT "xp_provider_capabilities_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "xp_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_bookings" ADD CONSTRAINT "xp_bookings_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_bookings" ADD CONSTRAINT "xp_bookings_planId_fkey" FOREIGN KEY ("planId") REFERENCES "xp_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_favorites" ADD CONSTRAINT "xp_favorites_personId_fkey" FOREIGN KEY ("personId") REFERENCES "xp_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

