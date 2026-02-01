/**
 * Simple heuristic moderation: reject notes containing bad patterns.
 * Sets ai_status to 'rejected' if detected; else 'approved'.
 */

const BAD_PATTERNS = [
  /\b(sex|sexual|nude|naked|explicit)\b/i,
  /\b(slur|hate|harass)\w*\b/i,
  /\b(spam|scam|buy now|click here)\b/i,
  /(.)\1{10,}/,
  /https?:\/\/[^\s]+/i,
];

export function moderateNotes(notes: string | null): "approved" | "rejected" {
  if (!notes || notes.trim().length === 0) return "approved";
  const text = notes.trim().toLowerCase();
  for (const pattern of BAD_PATTERNS) {
    if (pattern.test(text)) return "rejected";
  }
  return "approved";
}

/**
 * Heuristic ai_quality: 30 if no notes, else 50 + min(40, length/6) capped at 90.
 */
export function computeAiQuality(notes: string | null): number {
  if (!notes || notes.trim().length === 0) return 30;
  const len = notes.trim().length;
  const quality = 50 + Math.min(40, Math.floor(len / 6));
  return Math.min(90, quality);
}
