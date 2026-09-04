import * as z from "zod";

export const habitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "El nombre debe tener al menos 2 caracteres",
      )
      .max(
        100,
        "El nombre no puede superar 100 caracteres",
      ),

    description: z
      .string()
      .trim()
      .max(
        300,
        "La descripción no puede superar 300 caracteres",
      ),

    category: z
      .string()
      .trim()
      .max(
        60,
        "La categoría no puede superar 60 caracteres",
      ),

    frequency: z.enum([
      "daily",
      "weekly",
      "custom",
    ]),

    customDays: z.array(
      z.string(),
    ),

    priority: z.enum([
      "low",
      "medium",
      "high",
    ]),

    startDate: z
      .string()
      .min(
        1,
        "La fecha de inicio es obligatoria",
      ),

    endDate: z.string(),
  })
  .superRefine(
    (data, context) => {
      if (
        data.frequency === "custom" &&
        data.customDays.length === 0
      ) {
        context.addIssue({
          code: "custom",
          path: ["customDays"],
          message:
            "Selecciona al menos un día para la frecuencia personalizada",
        });
      }

      if (
        data.endDate &&
        data.startDate &&
        data.endDate <
          data.startDate
      ) {
        context.addIssue({
          code: "custom",
          path: ["endDate"],
          message:
            "La fecha fin no puede ser anterior a la fecha de inicio",
        });
      }
    },
  );