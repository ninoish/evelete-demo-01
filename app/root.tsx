import type { PropsWithChildren } from "react";
import {
  type LinksFunction,
  type MetaFunction,
  type LoaderFunctionArgs,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  Link,
} from "react-router";

import { Auth } from "~/services/auth.server";
import globalLargeStylesUrl from "~/styles/global-large.css?url";
import globalMediumStylesUrl from "~/styles/global-medium.css?url";
import globalStylesUrl from "~/styles/global.css?url";
import tailwind from "~/tailwind.css?url";
import { getPrisma } from "./services/database.server";
import { NavigationLoadingBar } from "./components/NavigationLoadingBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
  { rel: "stylesheet", href: globalStylesUrl },
  {
    rel: "stylesheet",
    href: globalMediumStylesUrl,
    media: "print, (min-width: 640px)",
  },
  {
    rel: "stylesheet",
    href: globalLargeStylesUrl,
    media: "screen and (min-width: 1024px)",
  },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: MetaFunction = () => {
  const description = "Evelete is the place for all athletes!";

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Evelete" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = new Auth();
  const user = await auth.isAuthenticated(request);

  if (user) {
    const db = getPrisma();
    try {
      const teamMembers = await db.teamMember.findMany({
        where: {
          userId: user.id,
        },
        include: {
          team: true,
        },
      });

      return {
        user,
        teamMembers,
      };
    } catch (err) {
      console.error(err);
    }
  }

  return {
    user,
    teamMembers: null,
  };
};

function Document({ children, title }: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="Evelete,Sports,Athlete,Workout,Competitions"
        />
        <meta name="twitter:image" content="https://evelete.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@evelete" />
        <meta name="twitter:site" content="@evelete" />
        <meta name="twitter:title" content="Evelete" />
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body>
        <NavigationLoadingBar />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000, // 1h
      gcTime: 24 * 60 * 60 * 1000, // 1d
      refetchOnWindowFocus: false,
      refetchOnReconnect: "always",
    },
  },
});

export default function App() {
  return (
    <Document>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  if (isRouteErrorResponse(error)) {
    let errorMessage = "";
    if (typeof error.data === "object") {
      errorMessage = error.data.errorMessage ?? "";
    }

    return (
      <Document title={`${error.status} ${error.statusText}`}>
        <div className="error-container">
          <h1 className="text-center">
            <span>{error.status}</span>
            <span className="ml-1">エラー</span>
          </h1>
          <p>
            <span>{error.statusText}</span>
          </p>
          <div className="flex justify-center p-4">
            <img src="/images/logo.svg" alt="Logo" className="h-12 md:h-24" />
          </div>
          <p>{errorMessage}</p>
          <div className="py-2 flex items-center justify-center">
            <Link to="/" className="border rounded py-2 px-4">
              ホームに戻る
            </Link>
          </div>
        </div>
      </Document>
    );
  }

  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error. hmm...</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
