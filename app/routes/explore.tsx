import { Outlet } from "react-router";
import MainLayout from "~/layouts/MainLayout";

export default function ExploreRoute() {
  return (
    <MainLayout>
      <div>
        {/*         
        <div>- recommended teams nearby from Your favorite sports</div>
        <div>
          - recommended team activities nearby that is available for guests from
          Your favorite sports
        </div>
        <div>
          - recommended team activities nearby from Your following teams
        </div>
        <div>- recommended users from Your preference</div>
        <div>- recommended events from Your preference</div> */}
      </div>
      <Outlet />
    </MainLayout>
  );
}
