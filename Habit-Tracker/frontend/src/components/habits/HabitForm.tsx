"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import dayjs from "dayjs";

import { useRouter } from "next/navigation";

import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useState,
} from "react";

import { habitSchema } from "@/schemas/habit.schema";

import {
  createHabit,
  updateHabit,
} from "@/services/habits.service";

import {
  HabitIconSelector,
} from "@/components/habits/HabitIconSelector";

import {
  DEFAULT_HABIT_ICON,
  getHabitIconOption,
} from "@/constants/habit-icons";

import type {
  Habit,
  HabitFormData,
  HabitFrequency,
  HabitPriority,
  HabitTrackingType,
} from "@/types/habit";

type HabitFormErrors = Partial<
  Record<keyof HabitFormData, string>
>;

type HabitFormProps = {
  mode: "create" | "edit";
  initialHabit?: Habit;
};

const days = [
  {
    value: "monday",
    label: "Lun",
  },
  {
    value: "tuesday",
    label: "Mar",
  },
  {
    value: "wednesday",
    label: "Mié",
  },
  {
    value: "thursday",
    label: "Jue",
  },
  {
    value: "friday",
    label: "Vie",
  },
  {
    value: "saturday",
    label: "Sáb",
  },
  {
    value: "sunday",
    label: "Dom",
  },
];

function createInitialForm(
  habit?: Habit
): HabitFormData {
  if (habit) {
    return {
      name: habit.name,

      description:
        habit.description ?? "",

      category:
        habit.category ?? "",

      icon:
        habit.icon ??
        DEFAULT_HABIT_ICON,

      frequency:
        habit.frequency,

      customDays:
        habit.customDays ?? [],

      priority:
        habit.priority,

      /*
       * Estos fallback mantienen
       * compatibilidad con hábitos
       * creados antes de agregar
       * trackingType.
       */
      trackingType:
        habit.trackingType ??
        "binary",

      targetValue:
        String(
          habit.targetValue ?? 1
        ),

      unit:
        habit.unit ?? "",

      startDate:
        habit.startDate.slice(
          0,
          10
        ),

      endDate:
        habit.endDate
          ? habit.endDate.slice(
            0,
            10
          )
          : "",
    };
  }

  return {
    name: "",

    description: "",

    category: "",

    icon: DEFAULT_HABIT_ICON,

    frequency: "daily",

    customDays: [],

    priority: "medium",

    trackingType: "quantity",

    /*
     * Los hábitos nuevos comienzan
     * como cuantificables.
     */
    targetValue: "",

    unit: "",

    startDate:
      dayjs().format(
        "YYYY-MM-DD"
      ),

    endDate: "",
  };
}

export function HabitForm({
  mode,
  initialHabit,
}: HabitFormProps) {
  const router = useRouter();

  const [form, setForm] =
    useState<HabitFormData>(
      () =>
        createInitialForm(
          initialHabit
        )
    );

  const [errors, setErrors] =
    useState<HabitFormErrors>(
      {}
    );

  const [
    generalError,
    setGeneralError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  function validate() {
    const result =
      habitSchema.safeParse(
        form
      );

    if (!result.success) {
      const newErrors:
        HabitFormErrors = {};

      result.error.issues.forEach(
        (issue) => {
          const field =
            issue.path[0];

          if (
            typeof field ===
            "string"
          ) {
            newErrors[
              field as keyof HabitFormData
            ] = issue.message;
          }
        }
      );

      setErrors(
        newErrors
      );

      return null;
    }

    setErrors({});

    return result.data;
  }

  function handleTextChange(
    field:
      | "name"
      | "description"
      | "category"
      | "targetValue"
      | "unit"
      | "startDate"
      | "endDate"
  ) {
    return (
      event:
        ChangeEvent<HTMLInputElement>
    ) => {
      setForm(
        (current) => ({
          ...current,

          [field]:
            event.target.value,
        })
      );

      /*
       * Quitamos el error del campo
       * mientras el usuario vuelve
       * a escribir.
       */
      if (errors[field]) {
        setErrors(
          (current) => ({
            ...current,
            [field]: undefined,
          })
        );
      }
    };
  }

  function handleIconChange(
    icon: string,
  ) {
    const selectedOption =
      getHabitIconOption(icon);

    setForm(
      (current) => ({
        ...current,

        icon,

        /*
         * Los iconos predefinidos asignan
         * automáticamente su categoría.
         *
         * "Otro" utiliza category: null,
         * por lo que dejamos el campo vacío
         * para que el usuario lo escriba.
         */
        category:
          selectedOption.category ??
          "",
      }),
    );

    setErrors(
      (current) => ({
        ...current,
        icon: undefined,
        category: undefined,
      }),
    );
  }

  function handleTrackingTypeChange(
    _:
      MouseEvent<HTMLElement>,
    value:
      | HabitTrackingType
      | null
  ) {
    if (!value) {
      return;
    }

    setForm(
      (current) => {
        /*
         * Al elegir Sí / No,
         * targetValue queda forzado
         * a 1 y no necesitamos unidad.
         */
        if (
          value === "binary"
        ) {
          return {
            ...current,

            trackingType:
              "binary",

            targetValue:
              "1",

            unit:
              "",
          };
        }

        /*
         * Al pasar de binary a
         * quantity dejamos el objetivo
         * vacío para que el usuario
         * indique conscientemente
         * cuánto quiere alcanzar.
         */
        return {
          ...current,

          trackingType:
            "quantity",

          targetValue:
            current.trackingType ===
              "quantity"
              ? current.targetValue
              : "",

          unit:
            current.trackingType ===
              "quantity"
              ? current.unit
              : "",
        };
      }
    );

    setErrors(
      (current) => ({
        ...current,
        trackingType: undefined,
        targetValue: undefined,
        unit: undefined,
      })
    );
  }

  function handleFrequencyChange(
    _:
      MouseEvent<HTMLElement>,
    value:
      | HabitFrequency
      | null
  ) {
    if (!value) {
      return;
    }

    setForm(
      (current) => ({
        ...current,

        frequency:
          value,

        customDays:
          value === "custom"
            ? current.customDays
            : [],
      })
    );

    if (
      value !== "custom"
    ) {
      setErrors(
        (current) => ({
          ...current,
          customDays:
            undefined,
        })
      );
    }
  }

  function handleCustomDay(
    day: string
  ) {
    setForm(
      (current) => {
        const selected =
          current.customDays.includes(
            day
          );

        return {
          ...current,

          customDays:
            selected
              ? current.customDays.filter(
                (item) =>
                  item !== day
              )
              : [
                ...current.customDays,
                day,
              ],
        };
      }
    );

    if (
      errors.customDays
    ) {
      setErrors(
        (current) => ({
          ...current,
          customDays:
            undefined,
        })
      );
    }
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setGeneralError("");

    const validData =
      validate();

    if (!validData) {
      return;
    }

    /*
     * HabitFormData utiliza string
     * para targetValue porque proviene
     * de un input.
     *
     * Aquí lo transformamos a número
     * antes de enviarlo al backend.
     */
    const payload = {
      name:
        validData.name,

      description:
        validData.description ||
        undefined,

      category:
        validData.category ||
        undefined,

      icon:
        validData.icon,

      frequency:
        validData.frequency,

      customDays:
        validData.frequency ===
          "custom"
          ? validData.customDays
          : [],

      priority:
        validData.priority,

      trackingType:
        validData.trackingType,

      targetValue:
        validData.trackingType ===
          "binary"
          ? 1
          : Number(
            validData.targetValue
          ),

      unit:
        validData.trackingType ===
          "quantity"
          ? validData.unit ||
          undefined
          : undefined,

      startDate:
        validData.startDate,

      endDate:
        validData.endDate ||
        undefined,
    };

    try {
      setLoading(true);

      if (
        mode === "edit" &&
        initialHabit
      ) {
        await updateHabit(
          initialHabit._id,
          payload
        );
      } else {
        await createHabit(
          payload
        );
      }

      router.replace(
        "/habits"
      );
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el hábito"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
      }}
    >
      <Card>
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              sm: 3,
            },
          }}
        >
          <Stack
            component="form"
            spacing={3}
            onSubmit={
              handleSubmit
            }
          >
            <Typography
              variant="h6"
            >
              {mode === "edit"
                ? "Editar hábito"
                : "Nuevo hábito"}
            </Typography>

            {generalError ? (
              <Alert severity="error">
                {generalError}
              </Alert>
            ) : null}

            <TextField
              label="Nombre del hábito"
              value={form.name}
              onChange={
                handleTextChange(
                  "name"
                )
              }
              error={
                !!errors.name
              }
              helperText={
                errors.name
              }
              fullWidth
            />

            <TextField
              label="Descripción"
              value={
                form.description
              }
              onChange={
                handleTextChange(
                  "description"
                )
              }
              error={
                !!errors.description
              }
              helperText={
                errors.description
              }
              multiline
              minRows={2}
              fullWidth
            />
            <Box>
              <HabitIconSelector
                value={form.icon}
                onChange={
                  handleIconChange
                }
                disabled={loading}
              />

              {errors.icon ? (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    display: "block",
                    mt: 1,
                  }}
                >
                  {errors.icon}
                </Typography>
              ) : null}
            </Box>
            {getHabitIconOption(
              form.icon,
            ).category === null ? (
              <TextField
                label="Categoría personalizada"
                value={form.category}
                onChange={
                  handleTextChange(
                    "category",
                  )
                }
                error={
                  !!errors.category
                }
                helperText={
                  errors.category ??
                  "Escribe la categoría del hábito"
                }
                fullWidth
              />
            ) : null}
            {/*
             * Tipo de seguimiento
             */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                }}
              >
                Tipo de seguimiento
              </Typography>

              <ToggleButtonGroup
                value={
                  form.trackingType
                }
                exclusive
                onChange={
                  handleTrackingTypeChange
                }
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,

                  "& .MuiToggleButtonGroup-grouped":
                  {
                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      "999px !important",

                    px: 2.5,
                  },
                }}
              >
                <ToggleButton
                  value="binary"
                >
                  Sí / No
                </ToggleButton>

                <ToggleButton
                  value="quantity"
                >
                  Por cantidad
                </ToggleButton>
              </ToggleButtonGroup>

              <FormHelperText>
                {form.trackingType ===
                  "binary"
                  ? "Se completa con una sola acción, por ejemplo: tender la cama."
                  : "Permite registrar avances hasta alcanzar un objetivo, por ejemplo: 2000 ml de agua."}
              </FormHelperText>
            </Box>

            {/*
             * Los campos de objetivo
             * solo aparecen para hábitos
             * cuantificables.
             */}
            {form.trackingType ===
              "quantity" ? (
              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns:
                  {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },

                  gap: 2,
                }}
              >
                <TextField
                  label="Objetivo"
                  type="number"
                  value={
                    form.targetValue
                  }
                  onChange={
                    handleTextChange(
                      "targetValue"
                    )
                  }
                  error={
                    !!errors.targetValue
                  }
                  helperText={
                    errors.targetValue ??
                    "Ejemplo: 2000"
                  }
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: "any",
                    },
                  }}
                />

                <TextField
                  label="Unidad"
                  value={
                    form.unit
                  }
                  onChange={
                    handleTextChange(
                      "unit"
                    )
                  }
                  error={
                    !!errors.unit
                  }
                  helperText={
                    errors.unit ??
                    "Ejemplo: ml, km, páginas, horas"
                  }
                  fullWidth
                />
              </Box>
            ) : null}

            {/*
             * Frecuencia
             */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                }}
              >
                Frecuencia
              </Typography>

              <ToggleButtonGroup
                value={
                  form.frequency
                }
                exclusive
                onChange={
                  handleFrequencyChange
                }
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,

                  "& .MuiToggleButtonGroup-grouped":
                  {
                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      "999px !important",

                    px: 2.5,
                  },
                }}
              >
                <ToggleButton
                  value="daily"
                >
                  Diario
                </ToggleButton>

                <ToggleButton
                  value="weekly"
                >
                  Semanal
                </ToggleButton>

                <ToggleButton
                  value="monthly"
                >
                  Mensual
                </ToggleButton>

                <ToggleButton
                  value="custom"
                >
                  Personalizada
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {form.frequency ===
              "custom" ? (
              <FormControl
                error={
                  !!errors.customDays
                }
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                  }}
                >
                  Días
                </Typography>

                <FormGroup row>
                  {days.map(
                    (day) => (
                      <FormControlLabel
                        key={
                          day.value
                        }
                        control={
                          <Checkbox
                            checked={form.customDays.includes(
                              day.value
                            )}
                            onChange={() =>
                              handleCustomDay(
                                day.value
                              )
                            }
                          />
                        }
                        label={
                          day.label
                        }
                      />
                    )
                  )}
                </FormGroup>

                <FormHelperText>
                  {
                    errors.customDays
                  }
                </FormHelperText>
              </FormControl>
            ) : null}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns:
                {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },

                gap: 2,
              }}
            >

              <FormControl
                fullWidth
              >
                <InputLabel id="priority-label">
                  Prioridad
                </InputLabel>

                <Select
                  labelId="priority-label"
                  label="Prioridad"
                  value={
                    form.priority
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,

                        priority:
                          event
                            .target
                            .value as HabitPriority,
                      })
                    )
                  }
                >
                  <MenuItem
                    value="low"
                  >
                    Baja
                  </MenuItem>

                  <MenuItem
                    value="medium"
                  >
                    Media
                  </MenuItem>

                  <MenuItem
                    value="high"
                  >
                    Alta
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Fecha inicio"
                type="date"
                value={
                  form.startDate
                }
                onChange={
                  handleTextChange(
                    "startDate"
                  )
                }
                error={
                  !!errors.startDate
                }
                helperText={
                  errors.startDate
                }
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                label="Fecha fin (opcional)"
                type="date"
                value={
                  form.endDate
                }
                onChange={
                  handleTextChange(
                    "endDate"
                  )
                }
                error={
                  !!errors.endDate
                }
                helperText={
                  errors.endDate
                }
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Box>

            <Stack
              direction={{
                xs:
                  "column-reverse",

                sm:
                  "row",
              }}
              spacing={2}
              sx={{
                justifyContent:
                  "flex-end",

                pt: 2,
              }}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={() =>
                  router.push(
                    "/habits"
                  )
                }
                disabled={
                  loading
                }
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={
                  loading
                }
                sx={{
                  minWidth: 150,
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={22}
                    color="inherit"
                  />
                ) : mode ===
                  "edit" ? (
                  "Guardar cambios"
                ) : (
                  "Guardar hábito"
                )}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}