import { describe, expect, it } from "vitest";
import { parseCsvEvents, parseJsonEvents, parseUploadedFile, UploadParseError } from "../parseUpload";

const header = "event_id,type,timestamp,from_account_id,to_account_id,asset_type,asset_id,quantity,value_usd_estimate,payment_flagged,account_created_at";
const row = 'evt_1,trade,2026-09-10T10:00:00Z,p_1,p_2,currency,gold_coins,5,9.99,true,2026-01-01T00:00:00Z';

describe("parseCsvEvents", () => {
  it("parses a well-formed row, coercing numbers and booleans", () => {
    const [e] = parseCsvEvents(`${header}\n${row}\n`);
    expect(e).toMatchObject({ event_id: "evt_1", type: "trade", quantity: 5, value_usd_estimate: 9.99, payment_flagged: true, account_created_at: "2026-01-01T00:00:00Z" });
  });

  it("keeps quoted fields with commas intact", () => {
    const [e] = parseCsvEvents(`${header}\n"evt,1",gift,2026-09-10T10:00:00Z,p_1,p_2,item,"skin, rare",1,3,0,\n`);
    expect(e.event_id).toBe("evt,1");
    expect(e.asset_id).toBe("skin, rare");
    expect(e.payment_flagged).toBe(false);
    expect(e.account_created_at).toBeNull();
  });

  it("names a missing column", () => {
    expect(() => parseCsvEvents(`event_id,type\nevt_1,trade\n`)).toThrow(/CSV header is missing/);
  });

  it("rejects a header-only file", () => {
    expect(() => parseCsvEvents(`${header}\n`)).toThrow(UploadParseError);
  });

  it("points at the row, field and value of a bad enum or number", () => {
    expect(() => parseCsvEvents(`${header}\n${row.replace("trade", "refund")}`)).toThrow(/Row 2: "type" is "refund", expected one of trade, gift/);
    expect(() => parseCsvEvents(`${header}\n${row.replace(",5,", ",five,")}`)).toThrow(/Row 2: "quantity" is "five", expected a non-negative number/);
    expect(() => parseCsvEvents(`${header}\n${row.replace("currency", "nft")}`)).toThrow(/"asset_type" is "nft"/);
    expect(() => parseCsvEvents(`${header}\n${row.replace(",true,", ",maybe,")}`)).toThrow(/could not be read as a boolean/);
  });
});

describe("parseJsonEvents", () => {
  const obj = { event_id: "evt_1", type: "purchase", timestamp: "2026-09-10T10:00:00Z", from_account_id: "STORE", to_account_id: "p_1", asset_type: "currency", asset_id: "gems", quantity: 100, value_usd_estimate: 20, payment_flagged: false, account_created_at: null };

  it("accepts a single object or an array", () => {
    expect(parseJsonEvents(JSON.stringify(obj))).toHaveLength(1);
    expect(parseJsonEvents(JSON.stringify([obj, { ...obj, event_id: "evt_2" }]))).toHaveLength(2);
  });

  it("rejects invalid JSON and empty arrays with a readable message", () => {
    expect(() => parseJsonEvents("{not json")).toThrow(/not valid JSON/);
    expect(() => parseJsonEvents("[]")).toThrow(/empty/);
  });
});

describe("parseUploadedFile", () => {
  it("dispatches on the extension and falls back to sniffing the content", () => {
    const csv = new File([""], "events.csv");
    expect(parseUploadedFile(csv, `${header}\n${row}`)).toHaveLength(1);
    const noExt = new File([""], "export");
    expect(parseUploadedFile(noExt, `[${JSON.stringify({ event_id: "e", type: "gift", timestamp: "t", from_account_id: "a", to_account_id: "b", asset_type: "item", asset_id: "x", quantity: 1, value_usd_estimate: 1, payment_flagged: false })}]`)).toHaveLength(1);
  });
});
