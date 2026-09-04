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
    useState,
} from "react";

import { habitSchema } from "@/schemas/habit.schema";

import {
    createHabit,
    updateHabit,
} from "@/services/habits.service";

import type {
    Habit,
    HabitFormData,
    HabitFrequency,
    HabitPriority,
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
    habit?: Habit,
): HabitFormData {
    if (habit) {
        return {
            name: habit.name,
            description:
                habit.description ?? "",
            category:
                habit.category ?? "",
            frequency:
                habit.frequency,
            customDays:
                habit.customDays ?? [],
            priority:
                habit.priority,
            startDate:
                habit.startDate.slice(
                    0,
                    10,
                ),
            endDate:
                habit.endDate
                    ? habit.endDate.slice(
                        0,
                        10,
                    )
                    : "",
        };
    }

    return {
        name: "",
        description: "",
        category: "",
        frequency: "daily",
        customDays: [],
        priority: "medium",
        startDate: dayjs().format(
            "YYYY-MM-DD",
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
                    initialHabit,
                ),
        );

    const [errors, setErrors] =
        useState<HabitFormErrors>(
            {},
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
                form,
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
                },
            );

            setErrors(newErrors);

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
            | "startDate"
            | "endDate",
    ) {
        return (
            event:
                ChangeEvent<HTMLInputElement>,
        ) => {
            setForm({
                ...form,
                [field]:
                    event.target.value,
            });
        };
    }

    function handleFrequencyChange(
        _: React.MouseEvent<
            HTMLElement
        >,
        value:
            | HabitFrequency
            | null,
    ) {
        if (!value) {
            return;
        }

        setForm({
            ...form,
            frequency: value,

            customDays:
                value === "custom"
                    ? form.customDays
                    : [],
        });
    }

    function handleCustomDay(
        day: string,
    ) {
        const selected =
            form.customDays.includes(
                day,
            );

        setForm({
            ...form,

            customDays: selected
                ? form.customDays.filter(
                    (item) =>
                        item !== day,
                )
                : [
                    ...form.customDays,
                    day,
                ],
        });
    }



    async function handleSubmit(
        event:
            FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setGeneralError("");

        const validData =
            validate();

        if (!validData) {
            return;
        }

        const payload = {
            name: validData.name,
            description:
                validData.description ||
                undefined,
            category:
                validData.category ||
                undefined,
            frequency:
                validData.frequency,
            customDays:
                validData.frequency ===
                    "custom"
                    ? validData.customDays
                    : [],
            priority:
                validData.priority,
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
                    payload,
                );
            } else {
                await createHabit(
                    payload,
                );
            }

            router.replace(
                "/habits",
            );
        } catch (error) {
            setGeneralError(
                error instanceof Error
                    ? error.message
                    : "No se pudo guardar el hábito",
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
                            {mode ===
                                "edit"
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
                                    "name",
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
                                    "description",
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
                                <ToggleButton value="daily">
                                    Diario
                                </ToggleButton>

                                <ToggleButton value="weekly">
                                    Semanal
                                </ToggleButton>

                                <ToggleButton value="custom">
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
                                                            day.value,
                                                        )}
                                                        onChange={() =>
                                                            handleCustomDay(
                                                                day.value,
                                                            )
                                                        }
                                                    />
                                                }
                                                label={
                                                    day.label
                                                }
                                            />
                                        ),
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
                            <TextField
                                label="Categoría"
                                value={
                                    form.category
                                }
                                onChange={
                                    handleTextChange(
                                        "category",
                                    )
                                }
                                error={
                                    !!errors.category
                                }
                                helperText={
                                    errors.category
                                }
                                fullWidth
                            />

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
                                        event,
                                    ) =>
                                        setForm({
                                            ...form,
                                            priority:
                                                event
                                                    .target
                                                    .value as HabitPriority,
                                        })
                                    }
                                >
                                    <MenuItem value="low">
                                        Baja
                                    </MenuItem>

                                    <MenuItem value="medium">
                                        Media
                                    </MenuItem>

                                    <MenuItem value="high">
                                        Alta
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Fecha inicio"
                                type="date"
                                value={form.startDate}
                                onChange={handleTextChange("startDate")}
                                error={!!errors.startDate}
                                helperText={errors.startDate}
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
                                value={form.endDate}
                                onChange={handleTextChange("endDate")}
                                error={!!errors.endDate}
                                helperText={errors.endDate}
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
                                xs: "column-reverse",
                                sm: "row",
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
                                        "/habits",
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