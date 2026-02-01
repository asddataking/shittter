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

function StarSelector({ 
  value, 
  onChange, 
  label,
  emoji,
}: { 
  value: number; 
  onChange: (v: number) => void;
  label: string;
  emoji: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
      <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <span>{emoji}</span> {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <svg
              className={`w-7 h-7 ${star <= value ? "text-amber-400" : "text-slate-200"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-sky-500 text-white shadow-md"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
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
      {/* Ratings Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">⭐ Rate this bathroom</h3>
        <StarSelector
          label="Cleanliness"
          emoji="🧹"
          value={form.cleanliness}
          onChange={(v) => setForm((f) => ({ ...f, cleanliness: v }))}
        />
        <StarSelector
          label="Privacy"
          emoji="🔒"
          value={form.privacy}
          onChange={(v) => setForm((f) => ({ ...f, privacy: v }))}
        />
        <StarSelector
          label="Safety"
          emoji="🛡️"
          value={form.safety}
          onChange={(v) => setForm((f) => ({ ...f, safety: v }))}
        />
      </div>

      {/* Amenities Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">🚽 Amenities</h3>
        <div className="flex gap-3">
          <ToggleButton
            active={form.has_lock}
            onClick={() => setForm((f) => ({ ...f, has_lock: !f.has_lock }))}
          >
            🔐 Has Lock
          </ToggleButton>
          <ToggleButton
            active={form.has_tp}
            onClick={() => setForm((f) => ({ ...f, has_tp: !f.has_tp }))}
          >
            🧻 Has TP
          </ToggleButton>
        </div>
      </div>

      {/* Access Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">🚪 Access Policy</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "public", label: "🌐 Public", desc: "Anyone can use" },
            { value: "customers_only", label: "🛒 Customers", desc: "Purchase required" },
            { value: "code_required", label: "🔢 Code", desc: "Ask for code" },
            { value: "unknown", label: "❓ Unknown", desc: "Not sure" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, access: opt.value as ReportFormData["access"] }))}
              className={`p-3 rounded-lg text-left transition-all ${
                form.access === opt.value
                  ? "bg-sky-50 border-2 border-sky-500"
                  : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
              }`}
            >
              <span className="text-sm font-medium text-slate-700">{opt.label}</span>
              <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 Additional notes</h3>
        <textarea
          value={form.notes}
          onChange={(e) =>
            setForm((f) => ({ ...f, notes: e.target.value.slice(0, 240) }))
          }
          maxLength={240}
          rows={3}
          placeholder="Anything else people should know? Be brutally honest..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 resize-none"
        />
        <p className="text-xs text-slate-400 text-right mt-1">{form.notes.length}/240</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:from-sky-600 hover:to-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            Submit report
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
