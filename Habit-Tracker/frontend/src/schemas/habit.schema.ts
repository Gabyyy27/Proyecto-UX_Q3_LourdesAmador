import * as z from "zod";

export const habitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "El nombre debe tener al menos 2 caracteres"
      )
      .max(
        100,
        "El nombre no puede superar 100 caracteres"
      ),

    description: z
      .string()
      .trim()
      .max(
        300,
        "La descripción no puede superar 300 caracteres"
      ),

    category: z
      .string()
      .trim()
      .max(
        60,
        "La categoría no puede superar 60 caracteres"
      ),
      icon: z
      .string()
      .trim()
      .min(
        1,
        "Selecciona un ícono"
      )
      .max(
        50,
        "El ícono no es válido"
      ),
    frequency: z.enum([
      "daily",
      "weekly",
      "monthly",
      "custom",
    ]),

    customDays: z.array(
      z.string()
    ),

    priority: z.enum([
      "low",
      "medium",
      "high",
    ]),

    trackingType: z.enum([
      "binary",
      "quantity",
    ]),

    /*
     * El formulario mantiene este valor
     * como string porque viene de un
     * input HTML.
     *
     * Más adelante, al crear el payload,
     * lo convertiremos a number.
     */
    targetValue: z
      .string()
      .trim()
      .max(
        30,
        "El objetivo no es válido"
      ),

    unit: z
      .string()
      .trim()
      .max(
        30,
        "La unidad no puede superar 30 caracteres"
      ),

    startDate: z
      .string()
      .min(
        1,
        "La fecha de inicio es obligatoria"
      ),

    endDate: z.string(),
  })
  .superRefine(
    (data, context) => {
      /*
       * Frecuencia personalizada:
       * debe tener al menos un día.
       */
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

      /*
       * Hábito binario:
       * su objetivo siempre debe ser 1.
       */
      if (
        data.trackingType === "binary"
      ) {
        const targetValue =
          Number(data.targetValue);

        if (
          !Number.isFinite(
            targetValue
          ) ||
          targetValue !== 1
        ) {
          context.addIssue({
            code: "custom",
            path: ["targetValue"],
            message:
              "Los hábitos de tipo Sí / No deben tener un objetivo de 1",
          });
        }
      }

      /*
       * Hábito cuantificable:
       * targetValue es obligatorio
       * y debe ser mayor que cero.
       */
      if (
        data.trackingType ===
        "quantity"
      ) {
        const targetValue =
          Number(
            data.targetValue
          );

        if (
          data.targetValue.trim() ===
            "" ||
          !Number.isFinite(
            targetValue
          ) ||
          targetValue <= 0
        ) {
          context.addIssue({
            code: "custom",
            path: ["targetValue"],
            message:
              "Ingresa un objetivo mayor que 0",
          });
        }
      }

      /*
       * La fecha final no puede estar
       * antes de la fecha inicial.
       *
       * Como usamos YYYY-MM-DD,
       * la comparación de strings es
       * válida para estas fechas.
       */
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
    }
  );