import { useQuery } from "@tanstack/react-query";
import z from "zod";

const SportOptionSchema = z.array(
  z.object({
    alias: z.string().optional(),
    label: z.string(),
    value: z.string(),
  }),
);

export function useSports() {
  return useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const res = await fetch("/api/sport-options"); // デフォでIf-None-Match送出→304運用へ
      if (!res.ok) {
        throw new Error("failed");
      }
      const json = await res.json();
      return SportOptionSchema.parse(json); // zodで検証
    },
    // UX優先: 即表示→裏で安価に再検証
    staleTime: 60 * 60 * 1000, // 1hは古くない扱い
    gcTime: 24 * 60 * 60 * 1000, // 1dでガベージコレクト
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
  });
}
