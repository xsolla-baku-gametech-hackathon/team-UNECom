// Turns a user-provided CSV or JSON file into the raw wire-format events the
// /api gateway expects (POST /events — see api/src/types/event.ts). This is
// the "point your existing export at us, zero setup" step of the pitch, so
// parsing errors must be specific enough that a non-technical user can fix
// their file.

export interface RawEvent {
  event_id: string;
  type: "trade" | "gift" | "marketplace_sale" | "key_redeem" | "purchase";
  timestamp: string;
  from_account_id: string;
  to_account_id: string;
  asset_type: "currency" | "item" | "key";
  asset_id: string;
  quantity: number;
  value_usd_estimate: number;
  payment_flagged: boolean;
  account_created_at: string | null;
}

const REQUIRED_FIELDS = [
  "event_id",
  "type",
  "timestamp",
  "from_account_id",
  "to_account_id",
  "asset_type",
  "asset_id",
  "quantity",
  "value_usd_estimate",
  "payment_flagged",
] as const;

export class UploadParseError extends Error {}

function coerceBoolean(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  const s = String(raw).trim().toLowerCase();
  if (s === "true" || s === "1") return true;
  if (s === "false" || s === "0" || s === "") return false;
  throw new UploadParseError(`"${raw}" could not be read as a boolean (true/false)`);
}

const EVENT_TYPES: readonly RawEvent["type"][] = ["trade", "gift", "marketplace_sale", "key_redeem", "purchase"];
const ASSET_TYPES: readonly RawEvent["asset_type"][] = ["currency", "item", "key"];

function oneOf<T extends string>(raw: unknown, allowed: readonly T[], field: string, rowLabel: string): T {
  const s = String(raw).trim() as T;
  if (!allowed.includes(s)) {
    throw new UploadParseError(`${rowLabel}: "${field}" is "${String(raw)}", expected one of ${allowed.join(", ")}`);
  }
  return s;
}

function numberField(raw: unknown, field: string, rowLabel: string): number {
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new UploadParseError(`${rowLabel}: "${field}" is "${String(raw)}", expected a non-negative number`);
  }
  return n;
}

function coerceRow(row: Record<string, unknown>, rowLabel: string): RawEvent {
  for (const field of REQUIRED_FIELDS) {
    if (row[field] === undefined || row[field] === null || row[field] === "") {
      throw new UploadParseError(`${rowLabel}: field "${field}" is empty or missing`);
    }
  }
  const createdAtRaw = row.account_created_at;
  return {
    event_id: String(row.event_id),
    type: oneOf(row.type, EVENT_TYPES, "type", rowLabel),
    timestamp: String(row.timestamp),
    from_account_id: String(row.from_account_id),
    to_account_id: String(row.to_account_id),
    asset_type: oneOf(row.asset_type, ASSET_TYPES, "asset_type", rowLabel),
    asset_id: String(row.asset_id),
    quantity: numberField(row.quantity, "quantity", rowLabel),
    value_usd_estimate: numberField(row.value_usd_estimate, "value_usd_estimate", rowLabel),
    payment_flagged: coerceBoolean(row.payment_flagged),
    account_created_at:
      createdAtRaw === undefined || createdAtRaw === null || createdAtRaw === ""
        ? null
        : String(createdAtRaw),
  };
}

export function parseJsonEvents(text: string): RawEvent[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new UploadParseError(`The file is not valid JSON: ${(e as Error).message}`);
  }
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  if (rows.length === 0) throw new UploadParseError("The file is empty: no events found");
  return rows.map((row, i) => coerceRow(row as Record<string, unknown>, `Row ${i + 1}`));
}

// Minimal CSV parser: handles quoted fields with embedded commas/quotes
// (RFC 4180 style), which is enough for the generator's export and for a
// typical spreadsheet-exported analytics dump.
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

export function parseCsvEvents(text: string): RawEvent[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new UploadParseError("The CSV file has no rows after the header");
  }
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const missing = REQUIRED_FIELDS.filter((f) => !headers.includes(f));
  if (missing.length > 0) {
    throw new UploadParseError(
      `The CSV header is missing these columns: ${missing.join(", ")}. Expected header: ${REQUIRED_FIELDS.join(", ")}`,
    );
  }
  return lines.slice(1).map((line, i) => {
    const cells = parseCsvLine(line);
    const row: Record<string, unknown> = {};
    headers.forEach((h, idx) => (row[h] = cells[idx]));
    return coerceRow(row, `Row ${i + 2}`);
  });
}

export function parseUploadedFile(file: File, text: string): RawEvent[] {
  const name = file.name.toLowerCase();
  if (name.endsWith(".json")) return parseJsonEvents(text);
  if (name.endsWith(".csv")) return parseCsvEvents(text);
  // Fall back to content sniffing for files without a clear extension.
  const trimmed = text.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return parseJsonEvents(text);
  return parseCsvEvents(text);
}
