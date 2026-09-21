"use client";

import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  useAuth,
} from "@/context/AuthContext";

/*
 * Lee una propiedad del usuario de forma
 * segura.
 *
 * Esto permite que la página siga funcionando
 * aunque el tipo User tenga campos opcionales.
 */
function getUserField(
  user: unknown,
  field: string,
) {
  if (
    !user ||
    typeof user !== "object"
  ) {
    return "";
  }

  const value =
    (
      user as Record<
        string,
        unknown
      >
    )[field];

  return typeof value ===
    "string"
    ? value
    : "";
}

export default function ProfilePage() {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,

          display: "flex",

          alignItems: "center",

          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  /*
   * Intentamos soportar los nombres
   * de propiedades más comunes sin
   * depender de una estructura concreta.
   */
  const name =
    getUserField(
      user,
      "name",
    ) ||
    getUserField(
      user,
      "fullName",
    ) ||
    getUserField(
      user,
      "username",
    ) ||
    "Usuario";

  const email =
    getUserField(
      user,
      "email",
    ) ||
    "Sin correo disponible";

  return (
    <Stack spacing={3}>
      {/*
       * ENCABEZADO
       */}
      <Box>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
          }}
        >
          Perfil
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          Consulta la información
          de tu cuenta.
        </Typography>
      </Box>

      {/*
       * TARJETA PRINCIPAL
       */}
      <Card
        variant="outlined"
        sx={{
          maxWidth: 700,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },

            "&:last-child": {
              pb: {
                xs: 2,
                sm: 3,
              },
            },
          }}
        >
          <Stack spacing={3}>
            {/*
             * USUARIO
             */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems:
                  "center",
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,

                  borderRadius:
                    "50%",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  bgcolor:
                    "action.selected",

                  color:
                    "primary.main",

                  flexShrink: 0,
                }}
              >
                <PersonOutlineIcon
                  fontSize="large"
                />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,

                    wordBreak:
                      "break-word",
                  }}
                >
                  {name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    wordBreak:
                      "break-word",
                  }}
                >
                  {email}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {/*
             * INFORMACIÓN PERSONAL
             */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Información personal
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Nombre
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mt: 0.25,
                      fontWeight: 500,
                    }}
                  >
                    {name}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Correo electrónico
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mt: 0.25,

                      fontWeight: 500,

                      wordBreak:
                        "break-word",
                    }}
                  >
                    {email}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}