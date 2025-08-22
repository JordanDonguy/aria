import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { supabase } from "../supabase";
import { loginSchema } from "../schemas";
import { ZodError } from "zod";
import sanitizeHtml from "sanitize-html";

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
      async authorize(credentials) {
        try {
          // Validate input with zod
          const { email, password } = loginSchema.parse(credentials);

          // Sanitize email
          const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });

          // Throw error if email or password is missing, rejects login
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter an email and a password");
          }

          // Fetch user by email from Supabase
          const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("email", cleanEmail)
            .single();

          // Throw error if user not found or error occurs
          if (!user) throw new Error("User not found, please sign up");

          // Check if user is a Google-only user (e.g. no hashed password)
          if (!user.password) {
            throw new Error("This account was created using Google sign-in. To set a password and log in with email/password, please sign in with Google first, then create a password in your user profile.");
          }

          // Compare provided password with hashed password from DB
          const isValid = await bcrypt.compare(
            password,
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
        } catch (error) {
          if (error instanceof ZodError) {
            throw new Error(error.issues[0].message);
          }
          throw error;
        }
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

        // Redirect to Google linking page if logging with Google on a credentials only account
        if (
          !existingUser.providers.includes("Google") &&
          existingUser.providers.includes("Credentials")
        ) {
          const { error: updateError } = await supabase
            .from("users")
            .update({
              google_linking: new Date(),
            })
            .eq("id", existingUser.id);

          if (updateError) {
            console.error("Failed to update providers after linking:", updateError);
            return false;
          }
          return "/auth/link-google";
        }
      }
      return true    // Allow sign-in otherwise and for other providers
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
