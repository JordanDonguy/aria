'use client';

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { status } = useSession();

  // Get logout params in url (to later display toast message or not)
  const searchParams = useSearchParams();
  const isLogout = searchParams.get('logout');

  // Redirect user to /user if logged in and trying to access /auth/login
  useEffect(() => {
    if (status === "authenticated") return router.push("/user")
  }, [status, router]);

  // If user just logged out, display a toast message
  useEffect(() => {
    if (isLogout) {
      toast.success("Logged out successfully")
      // Remove query param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('logout');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isLogout])

  // Credentials login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      callbackUrl: "/?login=true",
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/");
    }
  };

  // Google OAuth login
  const handleGoogleButton = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/?login=true",
      });
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  return (
    <Suspense fallback={null}>
      <form onSubmit={handleSubmit} className="max-w-xl h-[100svh] mx-auto p-2 flex flex-col justify-center gap-6 text-[var(--text-color)] ">
        <h1 className="text-2xl text-center font-bold">Login</h1>
        {/* Display error if any */}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {/* Email input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            className="border border-gray-400 p-4 w-full rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {/* Password input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="********"
            className="border border-gray-400 p-4 w-full rounded "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {/* Submit button */}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-gray-100 hover:cursor-pointer font-semibold rounded-full h-12 flex items-center justify-center">
          Sign In
        </button>
        {/* Google OAuth button */}
        <button
          id="google-btn"
          type="button"
          onClick={handleGoogleButton}
          className="relative flex items-center justify-start h-14 px-4 border rounded-full hover:bg-[var(--user-button-color)] hover:cursor-pointer"
        >
          <img src="/google-logo.webp" alt="google-logo" className="w-10 h-10 absolute left-4" />
          <p className="text-base mx-auto">Continue with Google</p>
        </button>
        {/* Sign Up link */}
        <p className="text-center">
          No account?&nbsp;
          <Link href="/auth/signup" className="text-blue-500">
            Sign Up
          </Link>
        </p>
      </form >
    </Suspense>
  );
}
