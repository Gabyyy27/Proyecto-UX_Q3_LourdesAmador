"use client";

import {
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";

import { useParams } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { HabitForm } from "@/components/habits/HabitForm";

import { getHabit } from "@/services/habits.service";

import type {
  Habit,
} from "@/types/habit";

export default function EditHabitPage() {
  const params = useParams<{
    id: string;
  }>();

  const [habit, setHabit] =
    useState<Habit | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadHabit() {
      try {
        setLoading(true);

        const data =
          await getHabit(
            params.id,
          );

        setHabit(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el hábito",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadHabit();
  }, [params.id]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!habit) {
    return (
      <Alert severity="error">
        Hábito no encontrado
      </Alert>
    );
  }

  return (
    <HabitForm
      mode="edit"
      initialHabit={habit}
    />
  );
}