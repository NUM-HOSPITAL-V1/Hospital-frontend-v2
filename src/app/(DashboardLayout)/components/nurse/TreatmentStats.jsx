import { Box, Typography, Grid, Paper, Avatar, LinearProgress, Divider } from '@mui/material';
import {
  IconStethoscope,
  IconPill,
  IconHeartbeat,
  IconCalendarEvent,
  IconTrophy,
  IconArchive
} from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useNurseDashboard } from '@/app/(DashboardLayout)/components/nurse/NurseDashboardContext';

const TreatmentStats = () => {
  const { stats, loading, error } = useNurseDashboard();
  const cards = [
    {
      title: 'Нийт эмчилгээ',
      value: stats.totalTreatments,
      icon: <IconStethoscope size={20} />,
      iconBg: 'primary.light',
      iconColor: 'primary.main',
    },
    {
      title: 'Амин үзүүлэлт',
      value: stats.totalVitals,
      icon: <IconHeartbeat size={20} />,
      iconBg: 'error.light',
      iconColor: 'error.main',
    },
    {
      title: 'Дууссан',
      value: stats.completedTreatments,
      icon: <IconPill size={20} />,
      iconBg: 'info.light',
      iconColor: 'info.main',
    },
    {
      title: 'Төлөвлөсөн',
      value: stats.pendingTreatments,
      icon: <IconCalendarEvent size={20} />,
      iconBg: 'warning.light',
      iconColor: 'warning.main',
    },
  ];

  return (
    <DashboardCard title="Эмчилгээний статистик">
      {error ? (
        <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}
      <Grid container spacing={2}>
        {cards.map((stat, index) => (
          <Grid item xs={6} key={index}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: stat.iconBg,
                  color: stat.iconColor,
                  mr: 1.5
                }}
              >
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  {stat.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mr: 0.5 }}>
                    {stat.value}
                  </Typography>
                  {stat.unit && (
                    <Typography variant="body2" color="textSecondary">
                      {stat.unit}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 2 }} />
      
      {/* Treatment progress */}
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        Эмчилгээний гүйцэтгэл
      </Typography>
      
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: 'success.light',
              color: 'success.main',
              mr: 1,
              fontSize: 15
            }}
          >
            <IconTrophy size={16} />
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {loading
              ? 'Өгөгдөл ачаалж байна...'
              : `Өнөөдрийн гүйцэтгэл: ${stats.todayCompletionPercent}%`}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={stats.todayCompletionPercent} 
          color="success"
          sx={{ height: 6, borderRadius: 5, mb: 2 }} 
        />
      </Box>
      
      {stats.progressItems.map((item, index) => (
        <Box key={index} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="textSecondary">
              {item.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
              <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>
                {item.value}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ({item.percentage}%)
              </Typography>
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={item.percentage} 
            sx={{ 
              height: 6, 
              borderRadius: 5,
              bgcolor: 'background.default',
              '& .MuiLinearProgress-bar': {
                bgcolor: item.color,
              }
            }} 
          />
        </Box>
      ))}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Monthly statistics */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'secondary.light',
            color: 'secondary.main',
            mr: 1.5
          }}
        >
          <IconArchive size={20} />
        </Avatar>
        <Box>
          <Typography variant="body2" color="textSecondary">
            Сарын гүйцэтгэл
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mr: 0.5 }}>
              {loading ? '...' : `${stats.monthCompletionPercent}%`}
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
              ({stats.monthChangePercent >= 0 ? '+' : ''}{stats.monthChangePercent}% өмнөх сараас)
            </Typography>
          </Box>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default TreatmentStats;
