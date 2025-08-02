import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabase";
import { loginSchema } from "@/lib/schemas";
import { ZodError } from "zod";
import sanitizeHtml from "sanitize-html";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate and parse input
    const { email, password } = loginSchema.parse(body);

    // Sanitize email
    const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
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
      cleanEmail,
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
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
