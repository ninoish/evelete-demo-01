import type { Sport } from "@prisma/client";

export default function SportPill({ sport }: { sport: Sport }) {
  return (
    <div>
      {sport.emoji} {sport.name_ja_JP}
    </div>
  );
}
