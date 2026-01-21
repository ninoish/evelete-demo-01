import type { TeamMember } from "@prisma/client";
import type { PropsWithChildren } from "react";

import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { TeamHeader } from "~/components/TeamHeader";
import type { TeamInfo } from "~/services/teamService.server";

// eslint-disable-next-line react/display-name
const TeamLayout = ({
  team,
  meMember,
  children,
  ...others
}: PropsWithChildren & {
  team: TeamInfo;
  meMember: TeamMember | undefined;
}) => {
  return (
    <div className="h-dvh flex flex-col font-sans">
      <div className="flex-1	overflow-y-scroll md:overflow-auto">
        <Header />
        <TeamHeader team={team} meMember={meMember} />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default TeamLayout;
