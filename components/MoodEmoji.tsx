import type { MoodType } from "@/lib/types";

interface MoodEmojiProps {
  mood: MoodType;
  size?: "sm" | "md" | "lg";
}

export function MoodEmoji({ mood, size = "md" }: MoodEmojiProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  // SVG poop emojis with different expressions
  const emojis: Record<MoodType, JSX.Element> = {
    glorious: (
      // Happy poop with crown
      <svg viewBox="0 0 64 64" className={sizeClasses[size]}>
        {/* Crown */}
        <path d="M20 12 L24 20 L32 14 L40 20 L44 12 L44 24 L20 24 Z" fill="#d4a853" />
        <circle cx="24" cy="16" r="2" fill="#c9a227" />
        <circle cx="32" cy="12" r="2" fill="#c9a227" />
        <circle cx="40" cy="16" r="2" fill="#c9a227" />
        {/* Poop body */}
        <ellipse cx="32" cy="46" rx="18" ry="14" fill="#8B6914" />
        <ellipse cx="32" cy="36" rx="14" ry="10" fill="#9B7924" />
        <ellipse cx="32" cy="28" rx="10" ry="7" fill="#AB8934" />
        {/* Happy eyes */}
        <ellipse cx="26" cy="38" rx="3" ry="4" fill="white" />
        <ellipse cx="38" cy="38" rx="3" ry="4" fill="white" />
        <circle cx="26" cy="39" r="2" fill="#333" />
        <circle cx="38" cy="39" r="2" fill="#333" />
        {/* Big smile */}
        <path d="M24 48 Q32 56 40 48" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Rosy cheeks */}
        <ellipse cx="20" cy="44" rx="3" ry="2" fill="#ffb6c1" opacity="0.6" />
        <ellipse cx="44" cy="44" rx="3" ry="2" fill="#ffb6c1" opacity="0.6" />
      </svg>
    ),
    decent: (
      // Content poop with slight smile
      <svg viewBox="0 0 64 64" className={sizeClasses[size]}>
        <ellipse cx="32" cy="46" rx="18" ry="14" fill="#8B6914" />
        <ellipse cx="32" cy="36" rx="14" ry="10" fill="#9B7924" />
        <ellipse cx="32" cy="28" rx="10" ry="7" fill="#AB8934" />
        {/* Neutral-happy eyes */}
        <ellipse cx="26" cy="38" rx="3" ry="4" fill="white" />
        <ellipse cx="38" cy="38" rx="3" ry="4" fill="white" />
        <circle cx="26" cy="39" r="2" fill="#333" />
        <circle cx="38" cy="39" r="2" fill="#333" />
        {/* Slight smile */}
        <path d="M26 48 Q32 52 38 48" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    meh: (
      // Grumpy/unimpressed poop
      <svg viewBox="0 0 64 64" className={sizeClasses[size]}>
        <ellipse cx="32" cy="46" rx="18" ry="14" fill="#7B5914" />
        <ellipse cx="32" cy="36" rx="14" ry="10" fill="#8B6924" />
        <ellipse cx="32" cy="28" rx="10" ry="7" fill="#9B7934" />
        {/* Annoyed eyes with eyebrows */}
        <ellipse cx="26" cy="38" rx="3" ry="4" fill="white" />
        <ellipse cx="38" cy="38" rx="3" ry="4" fill="white" />
        <circle cx="26" cy="39" r="2" fill="#333" />
        <circle cx="38" cy="39" r="2" fill="#333" />
        {/* Furrowed brows */}
        <path d="M22 32 L30 35" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <path d="M42 32 L34 35" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        {/* Frown */}
        <path d="M26 50 Q32 46 38 50" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    sick: (
      // Sick/sweating poop
      <svg viewBox="0 0 64 64" className={sizeClasses[size]}>
        <ellipse cx="32" cy="46" rx="18" ry="14" fill="#5B7924" />
        <ellipse cx="32" cy="36" rx="14" ry="10" fill="#6B8934" />
        <ellipse cx="32" cy="28" rx="10" ry="7" fill="#7B9944" />
        {/* Sick eyes */}
        <ellipse cx="26" cy="38" rx="3" ry="4" fill="white" />
        <ellipse cx="38" cy="38" rx="3" ry="4" fill="white" />
        <circle cx="26" cy="39" r="2" fill="#333" />
        <circle cx="38" cy="39" r="2" fill="#333" />
        {/* Dizzy spirals in eyes */}
        <path d="M25 37 Q27 36 26 38 Q25 40 27 39" stroke="#333" strokeWidth="0.5" fill="none" />
        <path d="M37 37 Q39 36 38 38 Q37 40 39 39" stroke="#333" strokeWidth="0.5" fill="none" />
        {/* Wavy sick mouth */}
        <path d="M24 50 Q28 48 32 50 Q36 52 40 50" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Sweat drops */}
        <ellipse cx="48" cy="34" rx="2" ry="3" fill="#87CEEB" />
        <ellipse cx="50" cy="42" rx="1.5" ry="2.5" fill="#87CEEB" />
        <ellipse cx="14" cy="38" rx="1.5" ry="2.5" fill="#87CEEB" />
      </svg>
    ),
  };

  return emojis[mood];
}
