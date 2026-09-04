import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

export default function DashboardPage() {
  return (
    <Card>
      <CardContent>
        <Typography
          variant="h5"
          gutterBottom
        >
          Dashboard
        </Typography>

        <Typography
          color="text.secondary"
        >
          La autenticación y el layout principal están funcionando.
        </Typography>
      </CardContent>
    </Card>
  );
}