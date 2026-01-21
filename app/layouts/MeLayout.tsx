import type { PropsWithChildren } from "react";

import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import MeHeader from "~/components/MeHeader";
import type { MyProfileType } from "~/services/userService.server";

// eslint-disable-next-line react/display-name
const MeLayout = ({
  me,
  children,
  ...others
}: PropsWithChildren & { me: MyProfileType }) => {
  return (
    <div className="h-dvh flex flex-col font-sans">
      <div className="flex-1	overflow-y-scroll md:overflow-auto">
        <Header />
        <MeHeader me={me} />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default MeLayout;
