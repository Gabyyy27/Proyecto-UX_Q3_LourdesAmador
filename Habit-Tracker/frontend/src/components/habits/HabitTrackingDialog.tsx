"use client";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useSnackbar } from "notistack";

import {
    addHabitProgress,
    completeHabit,
    getHabitHistory,
    type HabitRecord,
} from "@/services/habit-records.service";

import type {
    Habit,
    HabitFrequency,
} from "@/types/habit";

type HabitTrackingDialogProps = {
    habit: Habit | null;
    open: boolean;
    onClose: () => void;
    onUpdated?: () => void;
};

const TRACKING_TIMEZONE =
    "America/Tegucigalpa";

function getCalendarDate(
    date: Date,
    timeZone: string
) {
    const formatter =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }
        );

    const parts =
        formatter.formatToParts(
            date
        );

    const year =
        Number(
            parts.find(
                (part) =>
                    part.type === "year"
            )?.value
        );

    const month =
        Number(
            parts.find(
                (part) =>
                    part.type === "month"
            )?.value
        );

    const day =
        Number(
            parts.find(
                (part) =>
                    part.type === "day"
            )?.value
        );

    return new Date(
        Date.UTC(
            year,
            month - 1,
            day
        )
    );
}

function formatCalendarDate(
    date: Date
) {
    const year =
        date.getUTCFullYear();

    const month =
        String(
            date.getUTCMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getUTCDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}

function getIsoWeek(
    calendarDate: Date
) {
    const workingDate =
        new Date(
            calendarDate.getTime()
        );

    const weekday =
        workingDate.getUTCDay() ||
        7;

    workingDate.setUTCDate(
        workingDate.getUTCDate() +
        4 -
        weekday
    );

    const isoYear =
        workingDate.getUTCFullYear();

    const yearStart =
        new Date(
            Date.UTC(
                isoYear,
                0,
                1
            )
        );

    const week =
        Math.ceil(
            (
                (
                    workingDate.getTime() -
                    yearStart.getTime()
                ) /
                86400000 +
                1
            ) / 7
        );

    return {
        year: isoYear,
        week,
    };
}

function getCurrentPeriodKey(
    frequency: HabitFrequency,
    date: Date,
    timeZone: string
) {
    const calendarDate =
        getCalendarDate(
            date,
            timeZone
        );

    const dateKey =
        formatCalendarDate(
            calendarDate
        );

    if (
        frequency === "daily"
    ) {
        return `daily:${dateKey}`;
    }

    if (
        frequency === "weekly"
    ) {
        const {
            year,
            week,
        } =
            getIsoWeek(
                calendarDate
            );

        return `weekly:${year}-W${String(
            week
        ).padStart(
            2,
            "0"
        )}`;
    }

    if (
        frequency === "monthly"
    ) {
        const year =
            calendarDate.getUTCFullYear();

        const month =
            String(
                calendarDate.getUTCMonth() + 1
            ).padStart(
                2,
                "0"
            );

        return `monthly:${year}-${month}`;
    }

    return `custom:${dateKey}`;
}

function getTodayKey() {
    return formatCalendarDate(
        getCalendarDate(
            new Date(),
            TRACKING_TIMEZONE
        )
    );
}

function getFrequencyLabel(
    frequency: HabitFrequency
) {
    switch (frequency) {
        case "daily":
            return "Diario";
        case "weekly":
            return "Semanal";
        case "monthly":
            return "Mensual";
        case "custom":
            return "Personalizada";
        default:
            return frequency;
    }
}
const WEEKDAY_ORDER = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
] as const;

type WeekdayName =
    (typeof WEEKDAY_ORDER)[number];

const WEEKDAY_SHORT_LABELS:
    Record<WeekdayName, string> = {
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    sunday: "Dom",
};

const WEEKDAY_LONG_LABELS:
    Record<WeekdayName, string> = {
    monday: "lunes",
    tuesday: "martes",
    wednesday: "miércoles",
    thursday: "jueves",
    friday: "viernes",
    saturday: "sábado",
    sunday: "domingo",
};

function getCurrentWeekday(
    timeZone: string
): WeekdayName {
    const weekday =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone,
                weekday: "long",
            }
        )
            .format(new Date())
            .toLowerCase();

    if (
        WEEKDAY_ORDER.includes(
            weekday as WeekdayName
        )
    ) {
        return weekday as WeekdayName;
    }

    return "monday";
}

function getCustomScheduleInfo(
    habit: Habit
) {
    if (
        habit.frequency !== "custom"
    ) {
        return {
            isScheduledToday: true,
            daysLabel: "",
            nextDayLabel: "",
        };
    }

    const selectedDays =
        habit.customDays ?? [];

    const currentWeekday =
        getCurrentWeekday(
            TRACKING_TIMEZONE
        );

    const isScheduledToday =
        selectedDays.includes(
            currentWeekday
        );

    const daysLabel =
        WEEKDAY_ORDER
            .filter((day) =>
                selectedDays.includes(
                    day
                )
            )
            .map(
                (day) =>
                    WEEKDAY_SHORT_LABELS[
                    day
                    ]
            )
            .join(" · ");

    const currentIndex =
        WEEKDAY_ORDER.indexOf(
            currentWeekday
        );

    let nextDayLabel = "";

    for (
        let offset = 1;
        offset <= 7;
        offset += 1
    ) {
        const nextDay =
            WEEKDAY_ORDER[
            (
                currentIndex +
                offset
            ) %
            WEEKDAY_ORDER.length
            ];

        if (
            selectedDays.includes(
                nextDay
            )
        ) {
            nextDayLabel =
                WEEKDAY_LONG_LABELS[
                nextDay
                ];

            break;
        }
    }

    return {
        isScheduledToday,
        daysLabel,
        nextDayLabel,
    };
}
function getPeriodLabel(
    record: HabitRecord
) {
    if (
        record.dateKey.startsWith(
            "daily:"
        )
    ) {
        return record.dateKey.replace(
            "daily:",
            ""
        );
    }

    if (
        record.dateKey.startsWith(
            "weekly:"
        )
    ) {
        return record.dateKey
            .replace(
                "weekly:",
                ""
            )
            .replace(
                "-W",
                " · Semana "
            );
    }

    if (
        record.dateKey.startsWith(
            "monthly:"
        )
    ) {
        return record.dateKey.replace(
            "monthly:",
            ""
        );
    }

    if (
        record.dateKey.startsWith(
            "custom:"
        )
    ) {
        return record.dateKey.replace(
            "custom:",
            ""
        );
    }

    return record.dateKey;
}

function getProgressPercent(
    currentValue: number,
    targetValue: number
) {
    if (
        targetValue <= 0
    ) {
        return 0;
    }

    return Math.min(
        100,
        Math.round(
            (
                currentValue /
                targetValue
            ) * 100
        )
    );
}

function getRecordProgressText(
    record: HabitRecord
) {
    const trackingType =
        record.trackingType ??
        "binary";

    if (
        trackingType === "binary"
    ) {
        return record.completed
            ? "1 / 1"
            : "0 / 1";
    }

    const currentValue =
        record.currentValue ?? 0;

    const targetValue =
        record.targetValue ?? 0;

    const unit =
        record.unit?.trim();

    const text =
        `${currentValue} / ${targetValue}`;

    return unit
        ? `${text} ${unit}`
        : text;
}

export function HabitTrackingDialog({
    habit,
    open,
    onClose,
    onUpdated,
}: HabitTrackingDialogProps) {
    const { enqueueSnackbar } =
        useSnackbar();

    const [history, setHistory] =
        useState<HabitRecord[]>(
            []
        );

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [amount, setAmount] =
        useState("");

    const loadHistory =
        useCallback(async () => {
            if (!habit) {
                return;
            }

            try {
                setLoading(true);

                const records =
                    await getHabitHistory(
                        habit._id
                    );

                setHistory(records);
            } catch (loadError) {
                enqueueSnackbar(
                    loadError instanceof Error
                        ? loadError.message
                        : "No se pudo cargar el historial del hábito",
                    {
                        variant: "error",
                    }
                );
            } finally {
                setLoading(false);
            }
        }, [
            habit,
            enqueueSnackbar,
        ]);

    useEffect(() => {
        if (!open || !habit) {
            return;
        }

        setAmount("");
        void loadHistory();
    }, [
        open,
        habit,
        loadHistory,
    ]);

    const currentRecord =
        useMemo(() => {
            if (!habit) {
                return undefined;
            }

            const now =
                new Date();

            const periodKey =
                getCurrentPeriodKey(
                    habit.frequency,
                    now,
                    TRACKING_TIMEZONE
                );

            const todayKey =
                getTodayKey();

            return history.find(
                (record) =>
                    record.dateKey ===
                    periodKey ||
                    record.dateKey ===
                    todayKey
            );
        }, [
            habit,
            history,
        ]);

    if (!habit) {
        return null;
    }

    const trackingType =
        habit.trackingType ??
        "binary";

    const targetValue =
        currentRecord
            ?.targetValue ??
        (
            trackingType ===
                "binary"
                ? 1
                : habit.targetValue ?? 1
        );

    const currentValue =
        currentRecord
            ?.currentValue ??
        (
            currentRecord?.completed
                ? targetValue
                : 0
        );

    const unit =
        currentRecord?.unit ??
        habit.unit ??
        "";

    const completed =
        currentRecord?.completed ??
        false;

    const progressPercent =
        completed
            ? 100
            : getProgressPercent(
                currentValue,
                targetValue
            );

    const parsedAmount =
        Number(amount);

    const validAmount =
        amount.trim() !== "" &&
        Number.isFinite(
            parsedAmount
        ) &&
        parsedAmount > 0;
    const customSchedule =
        getCustomScheduleInfo(
            habit
        );

    const scheduledToday =
        customSchedule
            .isScheduledToday;

    const isCustomHabit =
        habit.frequency ===
        "custom";

    const registrationDisabled =
        !scheduledToday ||
        completed ||
        saving;

    const statusLabel =
        !scheduledToday
            ? "No programado hoy"
            : completed
                ? "Completado"
                : "Pendiente";

    const statusColor:
        | "default"
        | "success"
        | "warning" =
        !scheduledToday
            ? "default"
            : completed
                ? "success"
                : "warning";

    async function handleComplete() {
        if (!habit) {
            return;
        }

        if (!scheduledToday) {
            enqueueSnackbar(
                "Este hábito solo se puede completar los días asignados.",
                {
                    variant: "info",
                },
            );

            return;
        }

        try {
            setSaving(true);

            const response =
                await completeHabit(
                    habit._id,
                );

            enqueueSnackbar(
                response.message,
                {
                    variant: "success",
                },
            );

            /*
             * Actualizamos la card de Hábitos.
             */
            onUpdated?.();

            /*
             * Como completeHabit siempre deja
             * el período completado, cerramos
             * el modal automáticamente.
             */
            onClose();
        } catch (
        completeError
        ) {
            enqueueSnackbar(
                completeError instanceof
                    Error
                    ? completeError.message
                    : "No se pudo completar el hábito",
                {
                    variant: "error",
                },
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleAddProgress() {
        if (!habit) {
            return;
        }

        if (!scheduledToday) {
            enqueueSnackbar(
                "Este hábito solo permite registrar progreso los días asignados.",
                {
                    variant: "info",
                },
            );

            return;
        }

        if (!validAmount) {
            return;
        }

        try {
            setSaving(true);

            const response =
                await addHabitProgress(
                    habit._id,
                    parsedAmount,
                );

            setAmount("");

            enqueueSnackbar(
                response.message,
                {
                    variant: "success",
                },
            );

            /*
             * Actualizamos inmediatamente
             * la card de Hábitos.
             */
            onUpdated?.();

            /*
             * Si con este avance llegamos
             * al objetivo, cerramos el modal.
             */
            if (
                response.record.completed
            ) {
                onClose();
                return;
            }

            /*
             * Si todavía no llegó al 100%,
             * mantenemos abierto el modal y
             * actualizamos sus datos.
             */
            await loadHistory();
        } catch (
        progressError
        ) {
            enqueueSnackbar(
                progressError instanceof
                    Error
                    ? progressError.message
                    : "No se pudo registrar el progreso",
                {
                    variant: "error",
                },
            );
        } finally {
            setSaving(false);
        }
    }
    return (
        <Dialog
            open={open}
            onClose={
                saving
                    ? undefined
                    : onClose
            }
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle
                sx={{
                    pb: 1.5,
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        alignItems:
                            "flex-start",
                        justifyContent:
                            "space-between",
                    }}
                >
                    <Stack
                        spacing={0.5}
                        sx={{
                            minWidth: 0,
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                alignItems: "center",
                            }}
                        >
                            <TrackChangesIcon
                                color="primary"
                            />

                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    wordBreak: "break-word",
                                }}
                            >
                                {habit.name}
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                pl: 4.5,
                            }}
                        >
                            Seguimiento
                        </Typography>
                    </Stack>


                    <IconButton
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Cerrar seguimiento"
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box
                        sx={{
                            minHeight: 240,
                            display: "flex",
                            justifyContent:
                                "center",
                            alignItems:
                                "center",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={3}>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                width: "100%",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >

                        </Stack>
                        {isCustomHabit ? (
                            <Stack spacing={0.75}>
                                <Typography
                                    variant="body2"
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            fontWeight: 600,
                                        }}
                                    >
                                        Días:
                                    </Box>{" "}
                                    {customSchedule.daysLabel ||
                                        "Sin días asignados"}
                                </Typography>

                                {!scheduledToday ? (
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: "action.hover",
                                        }}
                                    >

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.25,
                                            }}
                                        >
                                            Solo puedes registrar
                                            seguimiento los días
                                            asignados.
                                            {customSchedule.nextDayLabel
                                                ? ` Próximo día: ${customSchedule.nextDayLabel}.`
                                                : ""}
                                        </Typography>
                                    </Box>
                                ) : null}
                            </Stack>
                        ) : null}
                        {trackingType === "quantity" ? (
                            <Stack spacing={2.5}>
                                {/* PROGRESO */}
                                <Stack spacing={0.75}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{
                                            alignItems: "center",
                                            justifyContent:
                                                "space-between",
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{
                                                alignItems: "baseline",
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Progreso
                                            </Typography>

                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {progressPercent}%
                                            </Typography>
                                        </Stack>

                                        <Chip
                                            label={statusLabel}
                                            color={statusColor}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                flexShrink: 0,
                                            }}
                                        />
                                    </Stack>

                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                    >
                                        {currentValue} /{" "}
                                        {targetValue}
                                        {unit
                                            ? ` ${unit}`
                                            : ""}
                                    </Typography>
                                </Stack>

                                {/* INPUT */}
                                <TextField
                                    label={
                                        unit
                                            ? `Cantidad (${unit})`
                                            : "Cantidad"
                                    }
                                    type="number"
                                    size="small"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(
                                            event.target.value,
                                        )
                                    }
                                    disabled={
                                        registrationDisabled
                                    }
                                    slotProps={{
                                        htmlInput: {
                                            min: 0,
                                            step: "any",
                                        },
                                    }}
                                    fullWidth
                                />

                                {/* BOTONES */}
                                <Stack
                                    direction={{
                                        xs: "column",
                                        sm: "row",
                                    }}
                                    spacing={1.5}
                                    sx={{
                                        alignItems: {
                                            xs: "stretch",
                                            sm: "center",
                                        },
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        disabled={
                                            registrationDisabled ||
                                            !validAmount
                                        }
                                        onClick={() =>
                                            void handleAddProgress()
                                        }
                                        sx={{
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {saving
                                            ? "Guardando..."
                                            : "Agregar progreso"}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={
                                            <CheckCircleOutlinedIcon />
                                        }
                                        disabled={
                                            registrationDisabled
                                        }
                                        onClick={() =>
                                            void handleComplete()
                                        }
                                        sx={{
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {saving
                                            ? "Guardando..."
                                            : "Marcar como completado"}
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : (
                            <Stack spacing={1.5}>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        alignItems: "center",
                                        justifyContent:
                                            "space-between",
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 700,
                                        }}
                                    >
                                        Estado
                                    </Typography>

                                    <Chip
                                        label={statusLabel}
                                        color={statusColor}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Stack>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {completed
                                        ? "Este hábito ya fue completado en la frecuencia actual."
                                        : "Marca el hábito como completado cuando hayas cumplido tu objetivo."}
                                </Typography>

                                <Button
                                    variant="contained"
                                    startIcon={
                                        <CheckCircleOutlinedIcon />
                                    }
                                    disabled={
                                        registrationDisabled
                                    }
                                    onClick={() =>
                                        void handleComplete()
                                    }
                                    sx={{
                                        alignSelf: {
                                            xs: "stretch",
                                            sm: "flex-start",
                                        },
                                    }}
                                >
                                    {saving
                                        ? "Guardando..."
                                        : !scheduledToday
                                            ? "No disponible hoy"
                                            : completed
                                                ? "Completado"
                                                : "Marcar completado"}
                                </Button>
                            </Stack>
                        )}

                        <Divider />

                        <Accordion
                            disableGutters
                            elevation={0}
                            sx={{
                                border: "1px solid",
                                borderColor:
                                    "divider",
                                borderRadius: 2,
                                overflow: "hidden",
                                "&:before": {
                                    display: "none",
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={
                                    <ExpandMoreIcon />
                                }
                                aria-controls="habit-history-content"
                                id="habit-history-header"
                                sx={{
                                    px: 2,
                                }}
                            >
                                <Stack
                                    spacing={0.25}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                        }}
                                    >
                                        Historial
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {history.length}{" "}
                                        registro
                                        {history.length ===
                                            1
                                            ? ""
                                            : "s"}
                                    </Typography>
                                </Stack>
                            </AccordionSummary>

                            <AccordionDetails
                                sx={{
                                    pt: 0,
                                    px: 2,
                                    pb: 2,
                                }}
                            >
                                {history.length ===
                                    0 ? (
                                    <Box
                                        sx={{
                                            py: 2,
                                            textAlign:
                                                "center",
                                        }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            Todavía no hay
                                            registros para este
                                            hábito.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={1.25}>
                                        {history.map(
                                            (record) => (
                                                <Box
                                                    key={
                                                        record._id
                                                    }
                                                    sx={{
                                                        p: 1.5,
                                                        border:
                                                            "1px solid",
                                                        borderColor:
                                                            "divider",
                                                        borderRadius: 3,
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        sx={{
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "flex-start",
                                                        }}
                                                    >
                                                        <Stack
                                                            spacing={0.35}
                                                            sx={{
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {getPeriodLabel(
                                                                    record
                                                                )}
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {getFrequencyLabel(
                                                                    record.frequency
                                                                )}
                                                                {" · "}
                                                                {getRecordProgressText(
                                                                    record
                                                                )}
                                                            </Typography>
                                                        </Stack>

                                                        <Chip
                                                            label={
                                                                record.completed
                                                                    ? "Completado"
                                                                    : "Pendiente"
                                                            }
                                                            color={
                                                                record.completed
                                                                    ? "success"
                                                                    : "default"
                                                            }
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Stack>
                                                </Box>
                                            )
                                        )}
                                    </Stack>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}