// components/DepartmentBreakdown.tsx
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar } from '@mui/material';
import { IconArrowUpLeft } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useDashboardData } from '@/app/(DashboardLayout)/components/dashboard/DashboardDataContext';

const DepartmentBreakdown = () => {
  const theme = useTheme();
  const { departmentBreakdown, loading, error: dashboardError } = useDashboardData();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const success = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  const warning = theme.palette.warning.main;
  const info = theme.palette.info.main;
  const successlight = theme.palette.success.light;

  const options = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 155,
    },
    colors: [primary, secondary, success, errorColor, warning, info],
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          background: 'transparent',
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    responsive: [
      {
        breakpoint: 991,
        options: { chart: { width: 120 } },
      },
    ],
  };

  const series = departmentBreakdown.series;
  const departments = departmentBreakdown.departments.map((department) => ({
    ...department,
    color: theme.palette[department.color?.split('.')[0]]?.[department.color?.split('.')[1]] || theme.palette.grey[500],
  }));

  return (
    <DashboardCard title="Салбар сургуулиудын үзлэгийн харьцаа">
      {loading || dashboardError ? (
        <Typography color="textSecondary">
          {loading ? 'Өгөгдөл ачаалж байна...' : dashboardError}
        </Typography>
      ) : (
      <Grid container spacing={3}>
        <Grid item xs={7} sm={7}>
          <Typography variant="h3" fontWeight="700">
            {departmentBreakdown.total}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
              <IconArrowUpLeft width={20} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {departmentBreakdown.percentChange}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              өмнөх сараас
            </Typography>
          </Stack>

          <Stack spacing={2} mt={3}>
            {departments.map((dept, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 9, height: 9, bgcolor: dept.color, svg: { display: 'none' } }} />
                <Typography variant="subtitle2" color="textSecondary">
                  {dept.name} ({series[index]}%)
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={5} sm={5}>
          <Chart
            options={options}
            series={series}
            type="donut"
            height={180}
            width={"100%"}
          />
        </Grid>
      </Grid>
      )}
    </DashboardCard>
  );
};

export default DepartmentBreakdown;
