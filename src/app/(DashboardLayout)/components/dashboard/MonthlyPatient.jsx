import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab, Box } from '@mui/material';
import { IconArrowUpRight, IconUsersGroup } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useDashboardData } from '@/app/(DashboardLayout)/components/dashboard/DashboardDataContext';

const MonthlyPatientCount = () => {
  const theme = useTheme();
  const { monthlyPatients, loading, error } = useDashboardData();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const successlight = '#e6fffa';

  const optionscolumnchart = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 40,
      sparkline: { enabled: true },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [secondarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: { size: 0 },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };

  const seriescolumnchart = [
    {
      name: '',
      color: primary,
      data: monthlyPatients.series,
    },
  ];

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      gridColumn: '1 / -1', // Make it span all columns
    }}>
      <DashboardCard
        title="Сарын үйлчлүүлэгчийн тоо"
        action={
          <Fab color="primary" size="medium" sx={{ color: '#ffffff' }}>
            <IconUsersGroup width={24} />
          </Fab>
        }
        sx={{ 
          height: '100%', 
          width: '100%',
          display: 'flex', 
          flexDirection: 'column',
          m: 0,
          '& .MuiCardContent-root': {
            height: '100%',
            p: 3,
          }
        }}
      >
        <Box 
          sx={{ 
            height: '100%',
            width: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h3" fontWeight="700">
              {loading ? '...' : `${monthlyPatients.total} хүн`}
            </Typography>
            <Stack direction="row" spacing={1} my={1} alignItems="center">
              <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
                <IconArrowUpRight width={20} color="#39B69A" />
              </Avatar>
              <Typography variant="subtitle2" fontWeight="600">
                {loading ? '...' : `${monthlyPatients.percentChange}%`}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                өмнөх сараас
              </Typography>
            </Stack>
            {error ? (
              <Typography variant="body2" color="error.main">
                {error}
              </Typography>
            ) : null}
          </Box>
          
          <Box sx={{ mt: 'auto', pt: 1, width: '100%' }}>
            <Chart
              options={optionscolumnchart}
              series={seriescolumnchart}
              type="area"
              height={40}
              width={"100%"}
            />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
};

export default MonthlyPatientCount;
