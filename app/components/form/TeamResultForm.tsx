import type { Team } from "@prisma/client";

interface TeamResultFormProps {
  team?: Team;
  onSubmit: (event: Event) => null;
}

export function TeamResultForm({ team, onSubmit }: TeamResultFormProps) {
  

  return (
    <form method="post">
      <button type="submit">作成</button>
    </form>
  );
}
