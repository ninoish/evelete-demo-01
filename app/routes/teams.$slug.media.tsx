import { Outlet } from "react-router";

export default function TeamMediaRoute() {
  return (
    <div>
      <h1>Team media</h1>
      <div>チームの写真・動画</div>
      <Outlet />
    </div>
  );
}
