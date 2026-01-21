import { Form } from "react-router";

export default function NewTeamResultFormRoute() {
  return (
    <div>
      <h1>New Team Result</h1>
      <Form>
        <input placeholder="競技, イベント, ルール, 相手, 点数, 公開範囲..." />
      </Form>
    </div>
  );
}
