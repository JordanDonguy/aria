import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { supabase } from "../supabase";

const authConfig: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // Called when user tries to login with credentials
      async authorize(credentials?: { email?: string; password?: string }) {
        // Throw error if email or password is missing, rejects login
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and a password");
        }

        // Fetch user by email from Supabase
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        // Throw error if user not found or error occurs
        if (!user) throw new Error("User not found, please sign up");

        // Check if user is a Google-only user (e.g. no hashed password)
        if (!user.password) {
          throw new Error("This account was created using Google sign-in. To set a password and log in with email/password, please sign in with Google first, then create a password in your user profile.");
        }

        // Compare provided password with hashed password from DB
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        // Throw error if password does not match
        if (!isValid) throw new Error("Password incorrect");

        // Return user object to create session (can include extra props here)
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        };
      },
    }),

    // Google OAuth provider configuration
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // Called after sign-in, before session creation
    async signIn({ user, account }) {
      // Ensure the sign-in request includes provider/account info; otherwise, reject the sign-in
      if (!account) return false;

      if (account.provider === "google") {
        // Check if user already exists with this Google email
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        // If user does not exist, create new user with Google provider
        if (!existingUser) {
          const { error } = await supabase.from("users").insert({
            email: user.email,
            providers: ["Google"],
          });
          if (error) return false;
          return true
        }

        // Block if account exists but user is not already signed in (to avoid hijacking)
        if (
          !existingUser.providers.includes("Google") &&
          existingUser.providers.includes("Credentials")
        ) {
          const now = new Date();
          const linkingDate = existingUser.google_linking
            ? new Date(existingUser.google_linking)
            : null;

          // If user recently initiated linking (within 60s), allow and update providers
          if (linkingDate && (now.getTime() - linkingDate.getTime()) / 1000 < 60) {
            const updatedProviders = [...existingUser.providers, "Google"];

            const { error: updateError } = await supabase
              .from("users")
              .update({
                providers: updatedProviders,
                google_linking: null, // Clear the flag after use
              })
              .eq("id", existingUser.id);

            if (updateError) {
              console.error("Failed to update providers after linking:", updateError);
              return false;
            }
            return true;
          }
          // Otherwise block Google sign-in
          throw new Error("An account with this email already exists. Please sign in with your password and link Google account from your profile.");
        }

        return true;            // allow Google sign-in if no problem
      }
      return true               // Allow sign-in for other providers (e.g. credentials)
    },

    // Customize session object returned to client
    async session({ session }) {
      if (session.user?.email) {
        // Fetch the custom user ID from Supabase using the email
        const { data, error } = await supabase
          .from("users")
          .select("id, providers")
          .eq("email", session.user.email)
          .single();

        if (!error && data) {
          session.user.id = data.id;
          session.user.providers = data.providers;
        }
      }
      return session;
    },

    // Customize JWT token payload
    async jwt({ token, user }) {
      // On first sign-in, persist user ID in JWT token 'sub' field
      if (user) {
        token.sub = user.id;
      }
      return token;
    },

    // After Google linking, redirect to profile page with success flag
    async redirect({ url, baseUrl }) {
      // Allow absolute URLs within same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Otherwise fallback to base
      return baseUrl;
    }
  },

  // Use JWT for session management (instead of database sessions)
  session: { strategy: "jwt" },

  // JWT secret from env for signing tokens
  jwt: { secret: process.env.JWT_SECRET },

  // Custom sign-in page route
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export default authConfig;
