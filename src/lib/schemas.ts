import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({message: "Invalid email address"})
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const createPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters")
});

export const chatInputSchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .trim(),
});
