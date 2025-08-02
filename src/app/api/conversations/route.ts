import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import authConfig from "@/lib/auth/authConfig";
import { NextRequest, NextResponse } from "next/server";

// --------------- GET user's conversations list ---------------
export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// --------------- POST a new conversation to user's list ---------------
export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { title } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Invalid or missing title" }, { status: 400 });
  }
  console.log(userId)
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// --------------- DELETE a conversation by ID ---------------
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("id");

  if (!conversationId || typeof conversationId !== "string") {
    return NextResponse.json({ error: "Missing or invalid conversation ID" }, { status: 400 });
  }

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId); // ensure only user's own conversations can be deleted

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Conversation deleted" }, { status: 200 });
}
