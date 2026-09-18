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
    LinearProgress,
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

    async function handleComplete() {
        if (!habit) {
            return;
        }

        try {
            setSaving(true);

            const response =
                await completeHabit(
                    habit._id
                );

            enqueueSnackbar(
                response.message,
                {
                    variant: "success",
                }
            );

            await loadHistory();
            onUpdated?.();
        } catch (completeError) {
            enqueueSnackbar(
                completeError instanceof Error
                    ? completeError.message
                    : "No se pudo completar el hábito",
                {
                    variant: "error",
                }
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleAddProgress() {
        if (
            !habit ||
            !validAmount
        ) {
            return;
        }

        try {
            setSaving(true);

            const response =
                await addHabitProgress(
                    habit._id,
                    parsedAmount
                );

            setAmount("");

            enqueueSnackbar(
                response.message,
                {
                    variant: "success",
                }
            );

            await loadHistory();
            onUpdated?.();
        } catch (progressError) {
            enqueueSnackbar(
                progressError instanceof Error
                    ? progressError.message
                    : "No se pudo registrar el progreso",
                {
                    variant: "error",
                }
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
  <Typography
    variant="body1"
    sx={{
      fontWeight: 600,
      minWidth: 0,
    }}
  >
    Frecuencia:{" "}
    <Box
      component="span"
      sx={{
        fontWeight: 700,
      }}
    >
      {getFrequencyLabel(
        habit.frequency
      )}
    </Box>
  </Typography>

  <Chip
    label={
      completed
        ? "Completado"
        : "Pendiente"
    }
    color={
      completed
        ? "success"
        : "warning"
    }
    variant="outlined"
    size="small"
    sx={{
      flexShrink: 0,
    }}
  />
</Stack>

                        {trackingType ===
                            "quantity" ? (
                            <Stack spacing={2}>
                                <Stack spacing={1}>
                                    <Stack
                                        direction="row"
                                        sx={{
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "center",
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 600,
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

                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            progressPercent
                                        }
                                        sx={{
                                            height: 8,
                                            borderRadius: 999,
                                        }}
                                    />

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {currentValue} /{" "}
                                        {targetValue}
                                        {unit
                                            ? ` ${unit}`
                                            : ""}
                                    </Typography>
                                </Stack>

                                <Stack
                                    direction={{
                                        xs: "column",
                                        sm: "row",
                                    }}
                                    spacing={1.5}
                                    sx={{
                                        alignItems: {
                                            xs: "stretch",
                                            sm: "flex-start",
                                        },
                                    }}
                                >
                                    <TextField
                                        label={
                                            unit
                                                ? `Cantidad (${unit})`
                                                : "Cantidad"
                                        }
                                        type="number"
                                        size="small"
                                        value={amount}
                                        onChange={(
                                            event
                                        ) =>
                                            setAmount(
                                                event.target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            completed ||
                                            saving
                                        }
                                        slotProps={{
                                            htmlInput: {
                                                min: 0,
                                                step: "any",
                                            },
                                        }}
                                        fullWidth
                                    />

                                    <Button
                                        variant="contained"
                                        disabled={
                                            completed ||
                                            saving ||
                                            !validAmount
                                        }
                                        onClick={() =>
                                            void handleAddProgress()
                                        }
                                        sx={{
                                            whiteSpace:
                                                "nowrap",
                                            minWidth: 190,
                                        }}
                                    >
                                        {saving
                                            ? "Guardando..."
                                            : completed
                                                ? "Objetivo completado"
                                                : "Agregar progreso"}
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : (
                            <Stack spacing={1.5}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {completed
                                        ? "Este hábito ya fue completado en la frecuencia actual."
                                        : "Marca el hábito como completado cuando lo hayas realizado."}
                                </Typography>

                                <Button
                                    variant="contained"
                                    startIcon={
                                        <CheckCircleOutlinedIcon />
                                    }
                                    disabled={
                                        completed ||
                                        saving
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