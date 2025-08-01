"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  "AccountExistsNeedsLinking": "An account with this email already exists. Please sign in with your password and link Google account from your profile.",
  "CredentialsSignin": "Sign in failed. Please check your credentials.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Unknown";

  const message = errorMessages[error] || "An unexpected error occurred.";

  return (
    <div className="h-screen w-full max-w-2xl flex flex-col items-center justify-center gap-4 mx-auto">
      <h1 className="text-2xl">Error signing in</h1>
      <p className="text-lg text-red-500 text-center">{message}</p>
      {/* Add a link back to sign-in */}
      <Link
        href="/auth/login"
        className="bg-[var(--bg-color)] hover:bg-[var(--user-button-color)] w-full my-4 border hover:cursor-pointer font-semibold rounded-full h-14 flex items-center justify-center"
      >
        👉 Back to sign in
      </Link>
    </div>
  );
}
