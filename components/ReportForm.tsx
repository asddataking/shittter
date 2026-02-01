"use client";

import { useState } from "react";

export interface ReportFormData {
  cleanliness: number;
  privacy: number;
  safety: number;
  has_lock: boolean;
  has_tp: boolean;
  access: "public" | "customers_only" | "code_required" | "unknown";
  notes: string;
}

const DEFAULT_FORM: ReportFormData = {
  cleanliness: 3,
  privacy: 3,
  safety: 3,
  has_lock: false,
  has_tp: false,
  access: "public",
  notes: "",
};

interface ReportFormProps {
  placeId?: string;
  placeName?: string;
  onSubmit: (data: ReportFormData) => Promise<void>;
}

export function ReportForm({
  placeId,
  placeName,
  onSubmit,
}: ReportFormProps) {
  const [form, setForm] = useState<ReportFormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {placeName && !placeId && (
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Place name
          </label>
          <input
            type="text"
            value={placeName}
            readOnly
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Cleanliness (1–5)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={form.cleanliness}
          onChange={(e) =>
            setForm((f) => ({ ...f, cleanliness: Number(e.target.value) }))
          }
          className="mt-1 w-full"
        />
        <span className="text-sm text-slate-500">{form.cleanliness}</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Privacy (1–5)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={form.privacy}
          onChange={(e) =>
            setForm((f) => ({ ...f, privacy: Number(e.target.value) }))
          }
          className="mt-1 w-full"
        />
        <span className="text-sm text-slate-500">{form.privacy}</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Safety (1–5)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={form.safety}
          onChange={(e) =>
            setForm((f) => ({ ...f, safety: Number(e.target.value) }))
          }
          className="mt-1 w-full"
        />
        <span className="text-sm text-slate-500">{form.safety}</span>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.has_lock}
            onChange={(e) =>
              setForm((f) => ({ ...f, has_lock: e.target.checked }))
            }
            className="rounded border-slate-300"
          />
          Has lock
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.has_tp}
            onChange={(e) =>
              setForm((f) => ({ ...f, has_tp: e.target.checked }))
            }
            className="rounded border-slate-300"
          />
          Has TP
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Access
        </label>
        <select
          value={form.access}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              access: e.target.value as ReportFormData["access"],
            }))
          }
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
        >
          <option value="public">Public</option>
          <option value="customers_only">Customers only</option>
          <option value="code_required">Code required</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Notes (optional, max 240 chars)
        </label>
        <textarea
          value={form.notes}
          onChange={(e) =>
            setForm((f) => ({ ...f, notes: e.target.value.slice(0, 240) }))
          }
          maxLength={240}
          rows={3}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
        />
        <p className="text-xs text-slate-500">{form.notes.length}/240</p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit report"}
      </button>
    </form>
  );
}
