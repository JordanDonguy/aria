import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 409 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user
  const { error: insertError } = await supabase.from("users").insert({
    email,
    password: hashedPassword,
    providers: ["Credentials"],
  });

  if (insertError) {
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "User created successfully" },
    { status: 201 }
  );
}
