'use client'
import { Grid, Box, Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useAuth } from '../(DashboardLayout)/context/authContext';

// Admin/Staff Components
import PatientOverview from '../(DashboardLayout)/components/dashboard/PatientOverview';
import DepartmentBreakdown from '../(DashboardLayout)/components/dashboard/DepartmentBreakdown';
import RecentAppointments from '../(DashboardLayout)/components/dashboard/recentAppointment';
import AvailableMedications from '../(DashboardLayout)/components/dashboard/AvailableMed';
import MonthlyPatientCount from '../(DashboardLayout)/components/dashboard/MonthlyPatient';
import PatientTreatmentProgress from '../(DashboardLayout)/components/dashboard/PatientTreatmentProgress';
import { DashboardDataProvider } from '../(DashboardLayout)/components/dashboard/DashboardDataContext';

// Nurse Components
import TreatmentSchedule from '../(DashboardLayout)/components/nurse/TreatmentSchedule';
import TreatmentStats from '../(DashboardLayout)/components/nurse/TreatmentStats';
import RecentActivities from '../(DashboardLayout)/components/nurse/RecentActivities';
import { NurseDashboardProvider } from '../(DashboardLayout)/components/nurse/NurseDashboardContext';

// Patient Components
import TreatmentGuide from '../(DashboardLayout)/components/patient/TreatmentGuide';
import VitalSignsChart from '../(DashboardLayout)/components/patient/VitalSignsChart';
import HealthRecords from '../(DashboardLayout)/components/patient/HealthRecords';
import { PatientDashboardProvider } from '../(DashboardLayout)/components/patient/PatientDashboardContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Default dashboard for Admin, Doctor, and other staff
  const renderAdminDashboard = () => (
    <DashboardDataProvider>
      <Box sx={{ pt: 1, pb: 2 }}>
        <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
          Эмнэлгийн хяналтын самбар
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <PatientOverview />
          </Grid>
          <Grid item xs={12} lg={4}>
            <DepartmentBreakdown />
          </Grid>
          <Grid item xs={12}>
            <MonthlyPatientCount />
          </Grid>
          <Grid item xs={12} lg={4}>
            <RecentAppointments />
          </Grid>
          <Grid item xs={12} lg={8}>
            <PatientTreatmentProgress />
          </Grid>
          <Grid item xs={12}>
            <AvailableMedications />
          </Grid>
        </Grid>
      </Box>
    </DashboardDataProvider>
  );

  // Nurse Dashboard
  const renderNurseDashboard = () => (
    <NurseDashboardProvider>
      <Box sx={{ pt: 1, pb: 2 }}>
        <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
          Сувилагчийн хяналтын самбар
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <TreatmentSchedule />
          </Grid>
          <Grid item xs={12} lg={4}>
            <TreatmentStats />
          </Grid>
          <Grid item xs={12} lg={12}>
            <RecentActivities />
          </Grid>
        </Grid>
      </Box>
    </NurseDashboardProvider>
  );

  // Patient Dashboard
  const renderPatientDashboard = () => (
    <PatientDashboardProvider>
      <Box sx={{ pt: 1, pb: 2 }}>
        <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
          Үйлчлүүлэгчийн хяналтын самбар
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TreatmentGuide />
          </Grid>
          <Grid item xs={12}>
            <VitalSignsChart />
          </Grid>
          <Grid item xs={12}>
            <HealthRecords />
          </Grid>
        </Grid>
      </Box>
    </PatientDashboardProvider>
  );

  // Determine which dashboard to render based on user role and position
  const getDashboardByRole = () => {
    if (!user || !user.user) {
      return renderAdminDashboard(); // Default fallback
    }

    const userRole = user.user.role;
    const userPosition = user.user.position;

    if (userRole === 'Patient') {
      return renderPatientDashboard();
    } else if (userRole === 'MedicalStaff') {
      if (userPosition === 'Nurse') {
        return renderNurseDashboard();
      } else {
        // Default for Doctor and other medical staff
        return renderAdminDashboard();
      }
    }
    
    // Default for Admin and others
    return renderAdminDashboard();
  };

  return (
    <PageContainer title="Эмнэлгийн хяналтын самбар (v6.0.2)" description="Hospital Dashboard">
      {getDashboardByRole()}
    </PageContainer>
  );
}

export default Dashboard;
