import { Link } from "react-router";

export default function ExploreIndexRoute() {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        <Link to="/explore/dropins">ドロップイン検索</Link>
        <Link to="/explore/teams">チーム検索</Link>
        <Link to="/explore/events">イベント検索</Link>
        <Link to="/explore/personalActivities">個人活動検索</Link>
        <Link to="/explore/users">ユーザー検索</Link>
      </div>

      <hr />
      <div>
        <h4>あなたにおすすめ</h4>
      </div>
    </div>
  );
}
