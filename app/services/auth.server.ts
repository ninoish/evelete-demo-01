import { GoogleStrategy } from "@coji/remix-auth-google";
import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "react-router";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";

import { getPrisma } from "./database.server";
import { generateRandomAlphanumeric } from "../utils/random";

const SESSION_KEY = "eveleteUser";

export class Auth {
  public authenticator: Authenticator<User>;
  public authenticate: Authenticator<User>["authenticate"];
  private session;

  constructor() {
    const {
      AUTH_SESSION_SECRET,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      CLIENT_URL,
    } = process.env;

    if (!AUTH_SESSION_SECRET) {
      throw new Error("AUTH_SESSION_SECRET is not defined");
    }

    if (!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && CLIENT_URL)) {
      throw new Error(
        "GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、CLIENT_URLが設定されていません。",
      );
    }

    this.session = createCookieSessionStorage({
      cookie: {
        name: "auth_session",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secrets: [AUTH_SESSION_SECRET || ""],
        secure:
          typeof process !== "undefined"
            ? process.env.NODE_ENV === "production"
            : true,
        maxAge: 60 * 60 * 24 * 30,
      },
    });

    this.authenticator = new Authenticator<User>();

    const formStrategy = new FormStrategy(async ({ form }) => {
      const email = form.get("email");
      const password = form.get("password");

      if (!(email && password)) {
        throw new Error("Invalid Request");
      }

      const afa = "ninoish.dev+yoyo@gmail.com";

      const emailStr = email as string;

      const db = getPrisma();

      const user = await db.user.findUnique({
        where: {
          email: emailStr,
        },
        include: {
          auth: true,
        },
      });

      // console.log(user);

      if (!user || !user.auth) {
        throw new Error("No User Found");
      }

      const passwordsMatch = await bcrypt.compare(
        String(password),
        user.auth.passwordHash,
      );

      if (!passwordsMatch) {
        throw new Error("No match");
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { auth: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    });

    this.authenticator.use(formStrategy, "user-pass");

    const googleStrategy = new GoogleStrategy<User>(
      {
        clientId: GOOGLE_CLIENT_ID || "",
        clientSecret: GOOGLE_CLIENT_SECRET || "",
        redirectURI: `${CLIENT_URL}/auth/google/callback`,
      },
      async ({ tokens }) => {
        const profile = await GoogleStrategy.userProfile(tokens);

        const db = getPrisma();
        const user = await db.user.findUnique({
          where: { email: profile.emails[0].value },
        });

        if (user) {
          return user;
        }

        const newUser = await db.user.create({
          data: {
            displayName: profile.displayName,
            slug: generateRandomAlphanumeric(12),
            email: profile.emails[0].value || "",
            description: "",
            profileImageUrl: profile.photos[0].value || "",
            auth: {
              create: {
                providerUserId: profile.id,
                provider: "google",
                passwordHash: "",
              },
            },
          },
        });

        return newUser;
      },
    );

    this.authenticator.use(googleStrategy);

    this.authenticate = this.authenticator.authenticate.bind(
      this.authenticator,
    );
  }

  public async refresh(request: Request, user: User) {
    // console.log(request.headers.get("cookie"));
    const session = await this.session.getSession(
      request.headers.get("cookie"),
    );
    // console.log(session);
    session.set(SESSION_KEY, user);
    return new Headers({
      "Set-Cookie": await this.session.commitSession(session),
    });
  }

  public async isAuthenticated(request: Request) {
    const sess = await this.session.getSession(request.headers.get("cookie"));
    const user = sess.get(SESSION_KEY);

    // TODO: use redis
    // console.log(sess.data);
    // console.log(user);
    if (user) {
      return user;
    }
    return null;
  }

  public async clear(request: Request) {
    const session = await this.session.getSession(
      request.headers.get("cookie"),
    );
    return this.session.destroySession(session);
  }

  public async logout(request: Request) {
    const sess = await this.session.getSession(request.headers.get("cookie"));
    return redirect("/login", {
      headers: { "Set-Cookie": await this.session.destroySession(sess) },
    });
  }
}
