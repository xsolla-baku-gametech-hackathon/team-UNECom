import { useRef, useState } from "react";
import { uploadEvents } from "../lib/api";
import { parseUploadedFile, UploadParseError, type RawEvent } from "../lib/parseUpload";

interface Props {
  open: boolean;
  mock: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; fileName: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

async function runUpload(events: RawEvent[]): Promise<string> {
  const accounts = new Set<string>();
  events.forEach((e) => {
    if (e.from_account_id !== "STORE") accounts.add(e.from_account_id);
    accounts.add(e.to_account_id);
  });
  const { inserted, skipped } = await uploadEvents(events);
  return (
    `${inserted.toLocaleString()} events loaded, ${accounts.size.toLocaleString()} unique accounts found` +
    (skipped > 0 ? ` (${skipped.toLocaleString()} duplicates skipped)` : "")
  );
}

export function UploadPanel({ open, mock, onClose, onUploaded }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  async function handleFile(file: File) {
    setStatus({ kind: "uploading", fileName: file.name });
    try {
      const text = await file.text();
      const events = parseUploadedFile(file, text);
      const message = await runUpload(events);
      setStatus({ kind: "success", message });
      onUploaded();
    } catch (e) {
      const message =
        e instanceof UploadParseError ? e.message : `Upload failed: ${e instanceof Error ? e.message : String(e)}`;
      setStatus({ kind: "error", message });
    }
  }

  async function handleSample() {
    setStatus({ kind: "uploading", fileName: "sample-events.json" });
    try {
      const res = await fetch("/sample-events.json");
      const events = (await res.json()) as RawEvent[];
      const message = await runUpload(events);
      setStatus({ kind: "success", message });
      onUploaded();
    } catch (e) {
      setStatus({ kind: "error", message: `Sample data failed to load: ${e instanceof Error ? e.message : String(e)}` });
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const uploading = status.kind === "uploading";

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: "rgba(6,7,9,.78)", zIndex: 40 }}
      onClick={() => !uploading && onClose()}
    >
      <div
        style={{ width: 560, maxWidth: "92vw", border: "1px solid #313640", background: "#0d0f12", borderRadius: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "#24282f" }}>
          <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: ".13em", color: "#e8e6e1" }}>
            Upload event log
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded"
            style={{ width: 24, height: 24, border: "1px solid #24282f", color: "#9aa0a8", fontFamily: "'IBM Plex Mono'", fontSize: 12 }}
          >
            ✕
          </button>
        </div>

        {mock && status.kind === "idle" && (
          <div className="border-b px-4 py-2.5" style={{ borderColor: "#24282f", background: "#1a1509", fontSize: 11.5, color: "#e0913f", lineHeight: 1.45 }}>
            The backend is unreachable right now, so the upload will fail. Try again once it is back.
          </div>
        )}

        <div className="p-4">
          {status.kind === "idle" && (
            <>
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className="cursor-pointer rounded text-center"
                style={{
                  border: `1px dashed ${dragOver ? "#c8792e" : "#313640"}`,
                  background: dragOver ? "#16130d" : "#101216",
                  borderRadius: 4,
                  padding: "30px 22px",
                }}
              >
                <input ref={inputRef} type="file" accept=".csv,.json" className="hidden" onChange={onPick} />
                <div style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 15, letterSpacing: ".06em", color: "#e8e6e1" }}>
                  {dragOver ? "Drop to upload" : "Drop your file here, or click to choose"}
                </div>
                <div className="mt-1.5" style={{ fontSize: 12, color: "#9aa0a8" }}>
                  CSV with a header row, or JSON: a single object or an array.
                </div>
                <div className="mt-3.5" style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, color: "#4b5058", lineHeight: 1.7, wordBreak: "break-all" }}>
                  event_id · type · timestamp · from_account_id · to_account_id · asset_type · asset_id · quantity ·
                  value_usd_estimate · payment_flagged · account_created_at
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span style={{ fontSize: 11.5, color: "#676d76" }}>Repeated event_ids are skipped, never counted twice.</span>
                <span
                  onClick={handleSample}
                  className="cursor-pointer"
                  style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#676d76", borderBottom: "1px dashed #313640" }}
                >
                  load sample dataset
                </span>
              </div>
            </>
          )}

          {status.kind === "uploading" && (
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  style={{
                    width: 11,
                    height: 11,
                    border: "2px solid #24282f",
                    borderTopColor: "#c8792e",
                    borderRadius: "50%",
                    animation: "fr-spin .7s linear infinite",
                  }}
                />
                <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: ".1em", color: "#e8e6e1" }}>
                  Processing {status.fileName}
                </span>
              </div>
              <div className="mt-3" style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#676d76" }}>
                Sending to /events, then re-analysing the graph…
              </div>
            </div>
          )}

          {status.kind === "success" && (
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  style={{ width: 14, height: 14, borderRadius: 2, background: "#2b4536", color: "#8fae9b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono'", fontSize: 10 }}
                >
                  ✓
                </span>
                <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: ".1em", color: "#8fae9b" }}>
                  Upload complete
                </span>
              </div>
              <div className="mt-2.5" style={{ fontSize: 12.5, color: "#c3c7cc", lineHeight: 1.5 }}>{status.message}</div>
              <div className="mt-3.5 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex items-center rounded uppercase"
                  style={{ height: 34, padding: "0 14px", background: "#c8792e", color: "#0a0b0d", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}
                >
                  Back to the graph
                </button>
              </div>
            </div>
          )}

          {status.kind === "error" && (
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  style={{ width: 14, height: 14, borderRadius: 2, background: "#3a1d1b", color: "#d1685f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono'", fontSize: 10 }}
                >
                  !
                </span>
                <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: ".1em", color: "#d1685f" }}>
                  File rejected
                </span>
              </div>
              <div className="mt-2.5" style={{ fontSize: 12.5, color: "#c3c7cc", lineHeight: 1.5 }}>{status.message}</div>
              <div className="mt-3.5 flex gap-2">
                <button
                  onClick={() => setStatus({ kind: "idle" })}
                  className="flex items-center rounded uppercase"
                  style={{ height: 34, padding: "0 14px", background: "#c8792e", color: "#0a0b0d", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}
                >
                  Choose another file
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center rounded uppercase"
                  style={{ height: 34, padding: "0 14px", border: "1px solid #313640", color: "#9aa0a8", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
