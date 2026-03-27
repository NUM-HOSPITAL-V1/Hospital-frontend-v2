import {
  Typography, Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Avatar
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

// TODO: Dashboard дээрх мэдээллийг API-аар сольж авах
const patients = [];

const PatientTreatmentProgress = () => {
  return (
    <DashboardCard title="Эмчилгээний явц">
      <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
        <Table
          aria-label="patient treatment progress table"
          sx={{ whiteSpace: "nowrap", mt: 2 }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  ID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Нэр
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Тасаг
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Төлөв
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient, idx) => (
              <TableRow key={`${patient.id}-${idx}`} hover>
                <TableCell>
                  <Typography fontSize={15} fontWeight={500}>
                    {patient.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      sx={{
                        mr: 2,
                        width: 40,
                        height: 40,
                        bgcolor: 'secondary.light',
                      }}
                    >
                      {patient.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {patient.name}
                      </Typography>
                      <Typography color="textSecondary" fontSize={13}>
                        Нас: {patient.age}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography color="textSecondary" variant="subtitle2">
                    {patient.department}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    sx={{
                      px: "6px",
                      backgroundColor: patient.statusColor,
                      color: "#fff",
                    }}
                    size="small"
                    label={patient.status}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </DashboardCard>
  );
};

export default PatientTreatmentProgress;
