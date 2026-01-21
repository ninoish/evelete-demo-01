import { Link } from "react-router";

export default function ExploreTeamActivitiesIndexRoute() {
  return (
    <div>
      <h1>Explore posts from teams and users</h1>

      <div>Twitterのキーワード検索のようなものを想定。</div>
      <Link to="/explore">戻る</Link>

      <ul></ul>
    </div>
  );
}
