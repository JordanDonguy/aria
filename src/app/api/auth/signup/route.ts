import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Check if user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user
  const { error: insertError } = await supabase.from("users").insert({
    email,
    password: hashedPassword,
    providers: ["credentials"],
  });

  if (insertError) {
    return res.status(500).json({ message: "Failed to create user" });
  }

  return res.status(201).json({ message: "User created successfully" });
}
