import Link from "next/link";
import {
  CardContent,
  Typography,
  Grid,
  Tooltip,
  Fab,
  Avatar,
  Box,
  Chip,
  LinearProgress
} from "@mui/material";
import { Stack } from "@mui/system";
import { IconPlus } from "@tabler/icons-react";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useTheme } from '@mui/material/styles';

const medications = [];

const MedicationCard = ({ medication }) => {
  const theme = useTheme();
  
  // Determine stock level color
  let stockColor;
  if (medication.stockLevel < 30) {
    stockColor = theme.palette.error.main;
  } else if (medication.stockLevel < 60) {
    stockColor = theme.palette.warning.main;
  } else {
    stockColor = theme.palette.success.main;
  }
  
  return (
    <BlankCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 45,
                height: 45,
                bgcolor: 'primary.light',
                color: 'primary.main',
              }}
            >
              {medication.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {medication.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {medication.category}
              </Typography>
            </Box>
          </Stack>
          <Tooltip title="Нэмэлт захиалга">
            <Fab
              size="small"
              color="primary"
              sx={{ boxShadow: 'none' }}
            >
              <IconPlus size="18" />
            </Fab>
          </Tooltip>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Үлдэгдэл
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {medication.stock} ширхэг
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={medication.stockLevel} 
            sx={{ 
              height: 8, 
              borderRadius: 5,
              bgcolor: 'grey.100',
              '& .MuiLinearProgress-bar': {
                bgcolor: stockColor,
              }
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            ₮{medication.price.toLocaleString()}
          </Typography>
          <Chip 
            label={
              medication.stockLevel < 30 
                ? "Бага үлдсэн" 
                : medication.stockLevel < 60 
                  ? "Дундаж" 
                  : "Хангалттай"
            } 
            size="small"
            sx={{ 
              bgcolor: `${stockColor}20`, 
              color: stockColor,
              fontWeight: 500,
            }}
          />
        </Box>
      </CardContent>
    </BlankCard>
  );
}

const AvailableMedications = () => {
  return (
    <DashboardCard 
      title="Эмийн сан" 
      subtitle="Нийт 0 төрлийн эм" 
      action={
        <Link href="/medications" passHref>
          <Typography 
            component="span" 
            color="primary" 
            sx={{ 
              cursor: 'pointer', 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Бүгдийг харах
          </Typography>
        </Link>
      }
    >
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {medications.length > 0 ? (
          medications.map((medication, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MedicationCard medication={medication} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <BlankCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Эмийн сангийн өгөгдөл алга.
                </Typography>
              </CardContent>
            </BlankCard>
          </Grid>
        )}
      </Grid>
    </DashboardCard>
  );
};

export default AvailableMedications;
