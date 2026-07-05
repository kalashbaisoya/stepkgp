import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email.");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(200);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  otp: z.string().optional(),
});

export const otpRequestSchema = z.object({ email: emailSchema });
export const otpVerifySchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const forgotSchema = z.object({ email: emailSchema });
export const resetSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
export const verifyEmailSchema = z.object({ token: z.string().min(1) });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
