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
import { useRouter } from "next/navigation";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import { registerSchema } from "@/schemas/register.schema";
import { register } from "@/services/auth.service";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormErrors = Partial<
  Record<keyof RegisterFormData, string>
>;

export function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] =
    useState<RegisterFormErrors>({});

  const [generalError, setGeneralError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  function validate() {
    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const newErrors: RegisterFormErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (
          field === "name" ||
          field === "email" ||
          field === "password" ||
          field === "confirmPassword"
        ) {
          newErrors[field] = issue.message;
        }
      });

      setErrors(newErrors);

      return null;
    }

    setErrors({});

    return result.data;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setGeneralError("");

    const validData = validate();

    if (!validData) {
      return;
    }

    try {
      setLoading(true);

      await register({
        name: validData.name,
        email: validData.email,
        password: validData.password,
      });

      router.replace("/login?registered=1");
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    field: keyof RegisterFormData,
  ) {
    return (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      setForm({
        ...form,
        [field]: event.target.value,
      });
    };
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
          maxWidth: 460,
        }}
      >
        <Stack spacing={3}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              textAlign: "center",
            }}
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
                <Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                  >
                    Crear cuenta
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Completa tus datos para comenzar.
                  </Typography>
                </Box>

                {generalError ? (
                  <Alert severity="error">
                    {generalError}
                  </Alert>
                ) : null}

                <TextField
                  label="Nombre completo"
                  value={form.name}
                  onChange={handleChange("name")}
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                  autoComplete="name"
                />

                <TextField
                  label="Correo"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                  autoComplete="email"
                />

                <TextField
                  label="Contraseña"
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  error={!!errors.password}
                  helperText={errors.password}
                  fullWidth
                  autoComplete="new-password"
                />

                <TextField
                  label="Confirmar contraseña"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange(
                    "confirmPassword",
                  )}
                  error={!!errors.confirmPassword}
                  helperText={
                    errors.confirmPassword
                  }
                  fullWidth
                  autoComplete="new-password"
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
                    href="/login"
                    variant="text"
                    disabled={loading}
                  >
                    Ya tengo cuenta
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
                      "Registrarme"
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