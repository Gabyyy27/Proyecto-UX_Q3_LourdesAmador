"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import type {
  Habit,
} from "@/types/habit";

type DeleteHabitDialogProps = {
  habit: Habit | null;
  loading: boolean;

  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteHabitDialog({
  habit,
  loading,
  onClose,
  onConfirm,
}: DeleteHabitDialogProps) {
  return (
    <Dialog
      open={!!habit}
      onClose={
        loading
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        ¿Eliminar hábito?
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Esta acción eliminará{" "}
          <strong>
            “{habit?.name}”
          </strong>{" "}
          y su historial asociado.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          variant="text"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          color="error"
          onClick={onConfirm}
          disabled={loading}
        >
          Eliminar definitivamente
        </Button>
      </DialogActions>
    </Dialog>
  );
}