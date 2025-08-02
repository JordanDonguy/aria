import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authConfig from "@/lib/auth/authConfig";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const res = NextResponse;

  // Get session
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return res.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({ google_linking: new Date().toISOString() })
      .eq("email", session.user.email);

    if (error) {
      console.error("Supabase update error:", error);
      return res.json({ error: "Database update failed" }, { status: 500 });
    }

    return res.json({ message: "Google linking started" }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.json({ error: "Internal server error" }, { status: 500 });
  }
}
