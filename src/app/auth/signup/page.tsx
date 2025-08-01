'use client';

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { status } = useSession();

  // Redirect user to /user if logged in and trying to access /auth/signup
  useEffect(() => {
    if (status === "authenticated") return router.push("/user")
  }, [status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    console.log(res)
    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/");
    }
  };

  const handleGoogleButton = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/",
      });
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl h-[100svh] mx-auto p-2 flex flex-col justify-center gap-6 text-[var(--text-color)] ">

      <h1 className="text-2xl text-center font-bold">Sign Up</h1>

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

      {/* Confirm password input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="confirm-password">Confirm password:</label>
        <input
          type="password"
          id="confirm-password"
          name="confirm-password"
          placeholder="********"
          className="border border-gray-400 p-4 w-full rounded "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Submit button */}
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-gray-100 hover:cursor-pointer font-semibold rounded-full h-12 flex items-center justify-center">
        Sign Up
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

      {/* Sign in link */}
      <p className="text-center">
        Already have an account?&nbsp;
        <Link href="/auth/login" className="text-blue-500">
          Sign In
        </Link>
      </p>
    </form >
  );
}
