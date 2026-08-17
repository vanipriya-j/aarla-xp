export interface RawSourceItem {
  externalId: string;
  title: string;
  payload: Record<string, unknown>;
}

export interface NormalizedExperience {
  kind: "PLACE" | "ACTIVITY" | "EVENT";
  name: string;
  summary: string;
  provenance: string;
  payload: Record<string, unknown>;
}

export interface ConnectorHealth {
  ok: boolean;
  status: string;
  detail?: string;
}

export interface FetchRunResult {
  itemCount: number;
  status: string;
  notes?: string;
}

export interface ExperienceSourceConnector {
  sourceId: string;
  discover(params?: Record<string, unknown>): Promise<RawSourceItem[]>;
  fetchDetails(item: RawSourceItem): Promise<RawSourceItem>;
  normalize(item: RawSourceItem): Promise<NormalizedExperience>;
  refresh(): Promise<FetchRunResult>;
  healthCheck(): Promise<ConnectorHealth>;
}

export class SampleCatalogConnector implements ExperienceSourceConnector {
  sourceId = "source_sample_chennai";

  async discover(): Promise<RawSourceItem[]> {
    return [
      {
        externalId: "sample-mylapore-walk",
        title: "Mylapore temple streets walk",
        payload: { neighborhood: "Mylapore", kind: "walk" },
      },
    ];
  }

  async fetchDetails(item: RawSourceItem): Promise<RawSourceItem> {
    return item;
  }

  async normalize(item: RawSourceItem): Promise<NormalizedExperience> {
    return {
      kind: "ACTIVITY",
      name: item.title,
      summary: "Sample catalog item used for local development.",
      provenance: this.sourceId,
      payload: item.payload,
    };
  }

  async refresh(): Promise<FetchRunResult> {
    const items = await this.discover();
    return { itemCount: items.length, status: "OK", notes: "Sample connector. No network fetch." };
  }

  async healthCheck(): Promise<ConnectorHealth> {
    return { ok: true, status: "HEALTHY", detail: "In-repo sample catalog." };
  }
}

export class MockSourceConnector implements ExperienceSourceConnector {
  sourceId = "source_mock";

  async discover(): Promise<RawSourceItem[]> {
    return [];
  }

  async fetchDetails(item: RawSourceItem): Promise<RawSourceItem> {
    return item;
  }

  async normalize(item: RawSourceItem): Promise<NormalizedExperience> {
    return {
      kind: "EVENT",
      name: item.title,
      summary: "Mock source item.",
      provenance: this.sourceId,
      payload: item.payload,
    };
  }

  async refresh(): Promise<FetchRunResult> {
    return { itemCount: 0, status: "IDLE", notes: "Mock connector. Ready for a real adapter." };
  }

  async healthCheck(): Promise<ConnectorHealth> {
    return { ok: true, status: "READY", detail: "No external calls." };
  }
}

export function listConnectors(): ExperienceSourceConnector[] {
  return [new SampleCatalogConnector(), new MockSourceConnector()];
}

export function dedupeKey(input: { name: string; venue?: string; startsAt?: string }) {
  return [input.name, input.venue, input.startsAt]
    .filter(Boolean)
    .join("|")
    .toLowerCase()
    .replace(/[^a-z0-9|]+/g, " ")
    .trim();
}
