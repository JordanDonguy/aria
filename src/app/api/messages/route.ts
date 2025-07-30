import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import authConfig from "@/lib/auth/authConfig";
import { NextRequest, NextResponse } from "next/server";

// --------------- GET every messages of a conversation ---------------
export async function GET(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversation_id = searchParams.get("conversation_id");

  if (!conversation_id || typeof conversation_id !== "string") {
    return NextResponse.json({ error: "Missing or invalid conversation_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation_id)
    .order("created_at", { ascending: true }); // ascending for chat flow

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// --------------- POST a new message to a conversation ---------------
export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role, content, conversation_id } = await req.json();

  if (!conversation_id || typeof conversation_id !== "string") {
    return NextResponse.json({ error: "Missing or invalid conversation_id" }, { status: 400 });
  }

  if (!role || typeof role !== "string") {
    return NextResponse.json({ error: "Invalid or missing role" }, { status: 400 });
  }

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Invalid or missing content" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
