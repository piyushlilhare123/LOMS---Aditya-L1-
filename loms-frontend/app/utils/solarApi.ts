const API_BASE =
  process.env.NEXT_PUBLIC_LOMS_API_URL || "http://localhost:5000";

export interface SolarSummary {
  system: string;
  pipeline: string;
  totalEvents: number;
  scientificallyValidatedEvents: number;
  mlOnlyCandidates: number;

  severityDistribution: Record<string, number>;
  confidenceDistribution: Record<string, number>;
  eventTypeDistribution: Record<string, number>;
  morphologyDistribution: Record<string, number>;
  strengthDistribution: Record<string, number>;

  model: {
    type: string;
    threshold: number;
    trees: number;
  };
}

export interface SolarEvent {
  eventId: number;

  start: string;
  peak: string;
  end: string;
  durationSeconds: number;

  flareProbability: number;
  meanFlareProbability?: number;

  severity: string;
  confidence: string;

  eventType: string;
  status?: string;

  morphology: string;
  strength: string;

  strengthScore?: number;
  localSnr?: number;

  signalPeak?: number;
  signalMean?: number;

  priorityScore: number;

  scientificallyValidated?: boolean;

  validationStatus?: string;
  validationQuality?: string;
}

export interface SolarEventDetail {
  eventId: number;

  timing: {
    start: string;
    peak: string;
    end: string;
    durationSeconds: number;
  };

  prediction: {
    flareProbability: number;
    meanFlareProbability: number;
  };

  scientific: {
    scientificallyValidated: boolean;
    morphology: string;
    strength: string;
    strengthScore: number;
    localSnr: number;
  };

  signal: {
    peak: number;
    mean: number;
  };

  loms: {
    eventType: string;
    status: string;
    severity: string;
    confidence: string;
    priorityScore: number;
  };

  validation: {
    status: string;
    quality: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function numberOrZero(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function stringOrFallback(
  value: unknown,
  fallback = "UNKNOWN"
): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return fallback;
}

/**
 * Converts both:
 *
 * flat event:
 * {
 *   eventId,
 *   start,
 *   flareProbability,
 *   severity
 * }
 *
 * and nested event:
 * {
 *   eventId,
 *   timing: {},
 *   prediction: {},
 *   scientific: {},
 *   loms: {}
 * }
 *
 * into one frontend-safe SolarEvent object.
 */
function normalizeSolarEvent(raw: any): SolarEvent {
  const timing = raw?.timing || {};
  const prediction = raw?.prediction || {};
  const scientific = raw?.scientific || {};
  const signal = raw?.signal || {};
  const loms = raw?.loms || {};
  const validation = raw?.validation || {};

  const eventId = numberOrZero(
    raw?.eventId ?? raw?.id
  );

  const flareProbability = numberOrZero(
    raw?.flareProbability ??
      prediction?.flareProbability
  );

  return {
    eventId,

    start: stringOrFallback(
      raw?.start ?? timing?.start,
      ""
    ),

    peak: stringOrFallback(
      raw?.peak ?? timing?.peak,
      ""
    ),

    end: stringOrFallback(
      raw?.end ?? timing?.end,
      ""
    ),

    durationSeconds: numberOrZero(
      raw?.durationSeconds ??
        timing?.durationSeconds
    ),

    flareProbability,

    meanFlareProbability:
      raw?.meanFlareProbability !== undefined
        ? numberOrZero(raw.meanFlareProbability)
        : prediction?.meanFlareProbability !== undefined
        ? numberOrZero(
            prediction.meanFlareProbability
          )
        : undefined,

    severity: stringOrFallback(
      raw?.severity ?? loms?.severity,
      "UNKNOWN"
    ),

    confidence: stringOrFallback(
      raw?.confidence ?? loms?.confidence,
      "UNKNOWN"
    ),

    eventType: stringOrFallback(
      raw?.eventType ?? loms?.eventType,
      "UNKNOWN"
    ),

    status:
      raw?.status ??
      loms?.status ??
      undefined,

    morphology: stringOrFallback(
      raw?.morphology ?? scientific?.morphology,
      "UNMATCHED"
    ),

    strength: stringOrFallback(
      raw?.strength ?? scientific?.strength,
      "UNMATCHED"
    ),

    strengthScore:
      scientific?.strengthScore !== undefined
        ? numberOrZero(scientific.strengthScore)
        : raw?.strengthScore !== undefined
        ? numberOrZero(raw.strengthScore)
        : undefined,

    localSnr:
      scientific?.localSnr !== undefined
        ? numberOrZero(scientific.localSnr)
        : raw?.localSnr !== undefined
        ? numberOrZero(raw.localSnr)
        : undefined,

    signalPeak:
      signal?.peak !== undefined
        ? numberOrZero(signal.peak)
        : raw?.signalPeak !== undefined
        ? numberOrZero(raw.signalPeak)
        : undefined,

    signalMean:
      signal?.mean !== undefined
        ? numberOrZero(signal.mean)
        : raw?.signalMean !== undefined
        ? numberOrZero(raw.signalMean)
        : undefined,

    priorityScore: numberOrZero(
      raw?.priorityScore ??
        loms?.priorityScore
    ),

    scientificallyValidated:
      scientific?.scientificallyValidated ??
      raw?.scientificallyValidated ??
      undefined,

    validationStatus:
      validation?.status ??
      raw?.validationStatus ??
      undefined,

    validationQuality:
      validation?.quality ??
      raw?.validationQuality ??
      undefined,
  };
}

async function apiFetch<T>(
  endpoint: string
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  console.log("🌞 LOMS Solar API:", url);

  const response = await fetch(url, {
    cache: "no-store",
  });

  console.log(
    `🌞 LOMS Response [${endpoint}]:`,
    response.status,
    response.statusText
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      `❌ LOMS API Error [${endpoint}]:`,
      errorText
    );

    throw new Error(
      `LOMS Solar API error: ${response.status}`
    );
  }

  const result =
    (await response.json()) as ApiResponse<T>;

  console.log(
    `✅ LOMS API Data [${endpoint}]:`,
    result
  );

  if (!result.success) {
    throw new Error(
      result.message ||
        "LOMS Solar API returned an unsuccessful response"
    );
  }

  return result.data;
}

/* =========================================================
   SUMMARY
========================================================= */

export async function getSolarSummary(): Promise<SolarSummary> {
  return apiFetch<SolarSummary>(
    "/api/solar/summary"
  );
}

/* =========================================================
   ALL EVENTS
========================================================= */

export async function getSolarEvents(): Promise<SolarEvent[]> {
  const data = await apiFetch<any>(
    "/api/solar/events"
  );

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeSolarEvent);
}

/* =========================================================
   LATEST EVENTS
========================================================= */

export async function getLatestSolarEvents(): Promise<SolarEvent[]> {
  const data = await apiFetch<any>(
    "/api/solar/latest"
  );

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeSolarEvent);
}

/* =========================================================
   CRITICAL EVENTS
========================================================= */

export async function getCriticalSolarEvents(): Promise<SolarEvent[]> {
  const data = await apiFetch<any>(
    "/api/solar/critical"
  );

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeSolarEvent);
}

/* =========================================================
   SINGLE EVENT
========================================================= */

export async function getSolarEvent(
  eventId: number
): Promise<SolarEventDetail> {
  return apiFetch<SolarEventDetail>(
    `/api/solar/events/${eventId}`
  );
}