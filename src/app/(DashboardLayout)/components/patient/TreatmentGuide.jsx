'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { IconPill, IconNotes } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { usePatientDashboard } from '@/app/(DashboardLayout)/components/patient/PatientDashboardContext';

const formatDate = (dateString) => {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });
};

const TreatmentGuide = () => {
  const [tabValue, setTabValue] = useState(0);
  const { medications, guides, loading, error } = usePatientDashboard();

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const items = tabValue === 0 ? medications : guides;

  return (
    <DashboardCard title="Эмчилгээний зөвлөмж">
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Эмийн жагсаалт" />
          <Tab label="Эмчилгээний заавар" />
        </Tabs>
      </Box>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        {tabValue === 0 ? 'Танд бичигдсэн бодит эмийн жагсаалт' : 'Танд өгөгдсөн бодит зөвлөмж, зааврууд'}
      </Typography>

      {error ? (
        <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}

      {loading ? (
        <Typography color="textSecondary">Өгөгдөл ачаалж байна...</Typography>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item._id || item.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: tabValue === 0 ? 'primary.light' : 'secondary.light',
                        color: tabValue === 0 ? 'primary.main' : 'secondary.main',
                        mr: 2,
                      }}
                    >
                      {tabValue === 0 ? <IconPill size={20} /> : <IconNotes size={20} />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {item.displayName}
                      </Typography>
                      <Typography variant="body2">
                        {item.dose || item.frequency || 'Мэдээлэлгүй'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Давтамж
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {item.frequency || '-'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Заавар
                      </Typography>
                      <Typography variant="body1">
                        {item.description || 'Тайлбар байхгүй'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Бүртгэгдсэн огноо
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(item.createdAt)}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={tabValue === 0 ? 'Идэвхтэй эмийн заалт' : 'Идэвхтэй зөвлөмж'}
                      color={tabValue === 0 ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {!items.length ? (
            <Grid item xs={12}>
              <Typography color="textSecondary">
                {tabValue === 0 ? 'Эмийн бодит мэдээлэл олдсонгүй.' : 'Зөвлөмжийн бодит мэдээлэл олдсонгүй.'}
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      )}
    </DashboardCard>
  );
};

export default TreatmentGuide;
