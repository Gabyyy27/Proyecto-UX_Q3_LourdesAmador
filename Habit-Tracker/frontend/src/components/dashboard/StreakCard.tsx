import {
  LocalFireDepartmentRounded,
} from "@mui/icons-material";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

type StreakCardProps = {
  label: string;

  value: number;

  unit: string;
};

export function StreakCard({
  label,
  value,
  unit,
}: StreakCardProps) {
  const active =
    value > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
      }}
    >
      <CardContent>
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
              width: 52,
              height: 52,

              flexShrink: 0,

              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",

              borderRadius:
                "50%",

              bgcolor:
                active
                  ? "action.selected"
                  : "action.hover",
            }}
          >
            <LocalFireDepartmentRounded
              sx={{
                fontSize: 34,

                color:
                  active
                    ? "primary.main"
                    : "text.disabled",
              }}
            />
          </Box>

          <Stack
            spacing={0.25}
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {label}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
              }}
            >
              {value}{" "}
              {unit}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}