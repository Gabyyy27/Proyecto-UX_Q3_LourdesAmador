"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import { loginSchema } from "@/schemas/login.schema";
import { login } from "@/services/auth.service";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginFormErrors =
  Partial<
    Record<keyof LoginFormData, string>
  >;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startSession } = useAuth();

  const registered =
    searchParams.get("registered") === "1";

  const [form, setForm] =
    useState<LoginFormData>({
      email: "",
      password: "",
    });

  const [errors, setErrors] =
    useState<LoginFormErrors>({});

  {
    registered ? (
      <Alert severity="success">
        Cuenta creada correctamente. Ya puedes iniciar sesión.
      </Alert>
    ) : null
  }
  const [generalError, setGeneralError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  function validate() {
    const result =
      loginSchema.safeParse(form);

    if (!result.success) {
      const newErrors:
        LoginFormErrors = {};

      result.error.issues.forEach(
        (issue) => {
          const field =
            issue.path[0];

          if (
            field === "email" ||
            field === "password"
          ) {
            newErrors[field] =
              issue.message;
          }
        },
      );

      setErrors(newErrors);

      return null;
    }

    setErrors({});

    return result.data;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setGeneralError("");

    const validData = validate();

    if (!validData) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await login(validData);

      startSession(response);

      router.replace("/dashboard");
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEmailChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    setForm({
      ...form,
      email: event.target.value,
    });
  }

  function handlePasswordChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    setForm({
      ...form,
      password: event.target.value,
    });
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",

        display: "flex",

        alignItems: "center",
        justifyContent: "center",

        bgcolor: "background.default",

        px: {
          xs: 2,
          sm: 3,
        },

        py: 4,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 430,
        }}
      >
        <Stack
          spacing={3}
          sx={{
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
          >
            Habit Tracker
          </Typography>

          <Card>
            <CardContent
              sx={{
                p: {
                  xs: 3,
                  sm: 4,
                },
              }}
            >
              <Stack
                component="form"
                spacing={3}
                onSubmit={handleSubmit}
              >
                <Box
                  sx={{
                    textAlign: "left",
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                  >
                    Iniciar sesión
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Accede para continuar
                    con tus hábitos.
                  </Typography>
                </Box>

                {generalError ? (
                  <Alert severity="error">
                    {generalError}
                  </Alert>
                ) : null}

                <TextField
                  label="Correo"
                  type="email"
                  value={form.email}
                  onChange={
                    handleEmailChange
                  }
                  error={!!errors.email}
                  helperText={
                    errors.email
                  }
                  fullWidth
                  autoComplete="email"
                />

                <TextField
                  label="Contraseña"
                  type="password"
                  value={
                    form.password
                  }
                  onChange={
                    handlePasswordChange
                  }
                  error={
                    !!errors.password
                  }
                  helperText={
                    errors.password
                  }
                  fullWidth
                  autoComplete="current-password"
                />

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                  sx={{
                    justifyContent:
                      "space-between",
                  }}
                >
                  <Button
                    component={Link}
                    href="/register"
                    variant="text"
                    disabled={loading}
                  >
                    Crear cuenta
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading}
                    sx={{
                      minWidth: 150,
                    }}
                  >
                    {loading ? (
                      <CircularProgress
                        size={22}
                        color="inherit"
                      />
                    ) : (
                      "Iniciar sesión"
                    )}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}