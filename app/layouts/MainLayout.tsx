import type { PropsWithChildren } from "react";

import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";

// eslint-disable-next-line react/display-name
const MainLayout = ({ children, ...others }: PropsWithChildren) => {
  return (
    <div className="h-dvh flex flex-col font-sans">
      <Header />
      <main className="flex-1	overflow-y-scroll md:overflow-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
