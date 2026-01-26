import { useSports } from "~/hooks/useSports";
import { AutocompleteOverlay } from "./AutocompleteOverlay";

export default function TeamSportSelect({
  value,
  placeholder = "スポーツを選択",
  onChange,
  teamSportIds,
  buttonStyle,
}: {
  value: string | null;
  placeholder: string | undefined;
  onChange: (newValue: string | null) => void;
  teamSportIds?: string[];
  buttonStyle?: object;
}) {
  const { data: sports = [], isLoading, error, refetch } = useSports();

  return (
    <AutocompleteOverlay
      value={value}
      onChange={onChange}
      prioritizedValues={teamSportIds}
      candidates={sports}
      placeholder={placeholder}
      buttonStyle={buttonStyle}
    />
  );
}
