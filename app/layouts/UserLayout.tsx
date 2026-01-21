import type { Prisma } from "@prisma/client";
import type { PropsWithChildren } from "react";

import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { UserHeader } from "~/components/UserHeader";

// eslint-disable-next-line react/display-name
const UserLayout = ({
  user,
  children,
  ...others
}: PropsWithChildren & { user: Prisma.UserGetPayload<{}> }) => {
  return (
    <div className="h-dvh flex flex-col font-sans">
      <div className="flex-1	overflow-y-scroll md:overflow-auto">
        <Header />
        <UserHeader user={user} />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default UserLayout;
