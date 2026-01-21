import type { TeamActivity, User } from "@prisma/client";
import type { PropsWithChildren } from "react";

import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { TeamActivityHeader } from "~/components/TeamActivityHeader";
import type teamActivityService from "~/services/teamActivityService.server";

// eslint-disable-next-line react/display-name
const TeamActivityLayout = ({
  activity,
  user,
  myResponseStatus,
  children,
  ...others
}: PropsWithChildren & {
  activity: TeamActivity;
  user: User;
  myResponseStatus: Awaited<
    ReturnType<typeof teamActivityService.getUserResponse>
  > | null;
}) => {
  return (
    <div className="h-dvh flex flex-col md:block font-sans">
      <div className="flex-1	overflow-y-scroll md:overflow-auto">
        <Header />
        <TeamActivityHeader
          activity={activity}
          user={user}
          myResponseStatus={myResponseStatus}
          // TODO: 実装
          canEditActivity={false}
        />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default TeamActivityLayout;
