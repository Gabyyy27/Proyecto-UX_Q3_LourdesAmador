import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

type StatCardProps = {
  label: string;
  value: string | number;
};

export function StatCard({
  label,
  value,
}: StatCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
      }}
    >
      <CardContent
        sx={{
          p: 3,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          {label}
        </Typography>

        <Typography
          variant="h4"
          component="p"
          sx={{
            fontWeight: 700,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}