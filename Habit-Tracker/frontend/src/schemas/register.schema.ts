import * as z from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres"),

    email: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio")
      .email("Ingresa un correo electrónico válido"),

    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),

    confirmPassword: z
      .string()
      .min(1, "Debes confirmar la contraseña"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Las contraseñas no coinciden",
    },
  );