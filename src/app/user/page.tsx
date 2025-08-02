'use client';

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from "react-toastify";
import { useSession, signOut } from "next-auth/react";
import { updatePasswordSchema, createPasswordSchema } from "@/lib/schemas";
import { ZodError } from "zod";
import { useRouter } from "next/navigation";

export default function UserPage() {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const router = useRouter()
  const { data: session, update, status } = useSession();
  const isCredentials = session?.user.providers?.includes("Credentials");   // To display update password or create password

  // Get linked params in url (to later display toast message or not)
  const searchParams = useSearchParams();
  const linked = searchParams.get('linked');

  // Redirect user to /auth/login if not logged in and trying to access /user
  useEffect(() => {
    if (status !== "authenticated") return router.push("/auth/login")
  }, [status]);

  // Prevent displaying deleting confirmation button on mount
  useEffect(() => {
    setShowDeleteConfirm(false)
  }, []);

  // Update user password
  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if password are at least 8 characters
      if (currentPassword.length < 8 || newPassword.length < 8 || confirmPassword.length < 8) {
        setError("Passwords need to be minimum 8 characters long");
        return
      };

      // Check if new password and confirm password match
      if (newPassword !== confirmPassword) {
        setError("New password and confirm password don't match");
        return
      };

      // Validate data with zod
      const validatedData = updatePasswordSchema.parse({ currentPassword, newPassword });

      // API call to update password
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(validatedData)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Error while updating your password")
        return
      };
      // If successful, reset password inputs and display toast success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Your password has been updated");
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.issues[0].message); // display first validation error
      } else {
        setError("Something went wrong.");
      }
    }
  };

  // If user doesn't have a password yet (registered with Google)
  const createPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if password are at least 8 characters
      if (newPassword.length < 8 || confirmPassword.length < 8) {
        setError("Passwords need to be minimum 8 characters long");
        return
      };

      // Check if new password and confirm password match
      if (newPassword !== confirmPassword) {
        setError("New password and confirm password don't match");
        return
      };

      // Validate data with zod
      const validatedData = createPasswordSchema.parse({ newPassword });

      // API call to create a password
      const res = await fetch("/api/auth/create-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(validatedData)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Error while creating your password")
        return
      };
      // If successful, update session to get new providers list, reset password inputs, and display toast success
      await update();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Your password has been created");
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.issues[0].message); // display first validation error
      } else {
        setError("Something went wrong.");
      }
    }
  };

  // Request Google OAuth signin but with a callback to link-google
  const handleGoogleButton = async () => {
    try {
      // Call API route to mark start of google linking
      const res = await fetch("/api/auth/google-linking", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to start Google linking");
        return
      }

      // Proceed with Google sign-in and callback to your linking page
      await signIn("google", {
        callbackUrl: "/user?linked=google"
      });
    } catch (err) {
      setError(`Google account linking failed: ${err}`)
      console.error("Google account linking failed:", err);
    }
  };


  // Show delete confirmation button
  const toggleDeleteConfirm = () => {
    setShowDeleteConfirm(!showDeleteConfirm)
  };

  // Delete user account and logout
  const deleteAccount = async () => {
    setError("");
    const res = await fetch("/api/auth/delete-account", {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Failed to delete account")
    };
    await signOut({ callbackUrl: "/?delete=true" });
  }

  // Display a toast success message if callback from Google OAuth (linking account)
  useEffect(() => {
    if (linked === "google") {
      toast.success("Google account successfully linked");
      // Remove query param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('linked');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return (
    !showDeleteConfirm ? (
      <form onSubmit={isCredentials ? updatePassword : createPassword} className="max-w-xl min-h-[100svh] mx-auto p-2 flex flex-col justify-center gap-6 text-[var(--text-color)] mt-12 md:mt-0">

        <h1 className="text-2xl text-center font-bold">User profile</h1>

        {/* Display error if any */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Current password input */}
        {isCredentials ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="current-password">Current password:</label>
            <input
              type="password"
              id="current-password"
              name="current-password"
              placeholder="********"
              className="border border-gray-400 p-4 w-full rounded "
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
        ) : null}

        {/* New password input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="new-password">New password:</label>
          <input
            type="password"
            id="new-password"
            name="new-password"
            placeholder="********"
            className="border border-gray-400 p-4 w-full rounded "
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {/* Confirm new password input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="confirm-password">Confirm new password:</label>
          <input
            type="password"
            id="confirm-password"
            name="confirm-password"
            placeholder="********"
            className="border border-gray-400 p-4 w-full rounded "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Submit button */}
        <button type="submit" className="bg-[var(--bg-color)] hover:bg-[var(--user-button-color)] my-4 border hover:cursor-pointer font-semibold rounded-full h-14 flex items-center justify-center">
          {isCredentials ? "Update password" : "Create password"}
        </button>

        {/* Google OAuth button */}
        {!session?.user.providers?.includes("Google") ? (
          <button
            id="google-btn"
            type="button"
            onClick={handleGoogleButton}
            className="relative flex items-center justify-start h-14 px-4 rounded-full border mb-4 hover:bg-[var(--user-button-color)] hover:cursor-pointer"
          >
            <img src="/google-logo.webp" alt="google-logo" className="w-10 h-10 absolute left-4" />
            <p className="text-base mx-auto">Link Google account</p>
          </button>
        ) : null}

        {/* Delete account button */}
        <button
          type="button"
          onClick={toggleDeleteConfirm}
          className="bg-[var(--bg-color)] hover:bg-[var(--user-button-color)] border hover:cursor-pointer font-semibold rounded-full h-14 flex items-center justify-center"
        >
          Delete account
        </button>
      </form >
    ) : (

      <div className="max-w-2xl w-full h-screen flex justify-center items-center mx-auto p-2 md:p-0">
        <div className="w-full md:border flex flex-col gap-8 py-8 px-2 md:px-8 rounded-lg">
          {/* Confirm delete account button */}
          <p className="text-center text-xl">Are you sure you want to delete your account?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 w-full">
            <button
              type="button"
              onClick={toggleDeleteConfirm}
              className="h-16 text-center col-span-1 border rounded-full hover:cursor-pointer hover:bg-[var(--user-button-color)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={deleteAccount}
              className="h-16 text-center col-span-1 rounded-full bg-red-700 hover:cursor-pointer hover:bg-red-600 text-gray-100"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    )
  )
}
