import { useOutletContext } from "react-router";

export default function PersonalRecordDetailRoute() {
  const { personalRecord } = useOutletContext();
  return (
    <div>
      <h1>詳細</h1>
      {personalRecord.detail ? (
        <pre>{JSON.stringify(JSON.parse(personalRecord.detail), null, 2)}</pre>
      ) : null}
    </div>
  );
}
