import { useSports } from "~/hooks/useSports";
import { AutocompleteOverlay } from "./AutocompleteOverlay";

export default function SportSelect({
  value,
  onChange,
  userSportIds,
}: {
  value: string | null;
  onChange: (newValue: string | null) => void;
  userSportIds?: string[];
}) {
  const { data: sports = [], isLoading, error, refetch } = useSports();

  return (
    <AutocompleteOverlay
      value={value}
      onChange={onChange}
      prioritizedValues={userSportIds}
      candidates={sports}
      placeholder="スポーツを選択"
    />
  );
}
