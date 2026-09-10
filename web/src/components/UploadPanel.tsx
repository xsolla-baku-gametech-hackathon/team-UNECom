import { useRef, useState } from "react";
import { uploadEvents } from "../lib/api";
import { parseUploadedFile, UploadParseError } from "../lib/parseUpload";

interface Props {
  mock: boolean;
  onUploaded: () => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; fileName: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function UploadPanel({ mock, onUploaded }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus({ kind: "uploading", fileName: file.name });
    try {
      const text = await file.text();
      const events = parseUploadedFile(file, text);

      const accounts = new Set<string>();
      events.forEach((e) => {
        if (e.from_account_id !== "STORE") accounts.add(e.from_account_id);
        accounts.add(e.to_account_id);
      });

      const { inserted, skipped } = await uploadEvents(events);
      setStatus({
        kind: "success",
        message:
          `${inserted.toLocaleString()} hadisə yükləndi, ${accounts.size.toLocaleString()} unikal hesab aşkarlandı` +
          (skipped > 0 ? ` (${skipped.toLocaleString()} təkrar atlandı)` : ""),
      });
      onUploaded();
    } catch (e) {
      const message =
        e instanceof UploadParseError
          ? e.message
          : `Yükləmə uğursuz oldu: ${e instanceof Error ? e.message : String(e)}`;
      setStatus({ kind: "error", message });
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
    <div className="flex flex-col gap-1.5 min-w-[260px]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={uploading ? undefined : onDrop}
        className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs transition ${
          dragOver
            ? "border-sky-400 bg-sky-500/10 text-sky-300"
            : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-300"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={onPick}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-slate-500 border-t-sky-400" />
            <span>Yüklənir: {status.fileName}…</span>
          </>
        ) : (
          <>
            <span className="shrink-0">📂</span>
            <span>Öz CSV/JSON faylını bura at və ya klikləyib seç</span>
          </>
        )}
      </div>

      {mock && status.kind === "idle" && (
        <p className="text-[10px] text-amber-500/80">
          Hazırda demo data göstərilir — öz faylını yüklə, real analiz başlasın.
        </p>
      )}

      {status.kind === "success" && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300">
          <span>{status.message}</span>
          <button
            onClick={() => setStatus({ kind: "idle" })}
            className="shrink-0 text-emerald-400/70 hover:text-emerald-300"
          >
            ✕
          </button>
        </div>
      )}

      {status.kind === "error" && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-red-500/15 px-3 py-1.5 text-xs text-red-300">
          <span>{status.message}</span>
          <button
            onClick={() => setStatus({ kind: "idle" })}
            className="shrink-0 text-red-400/70 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
