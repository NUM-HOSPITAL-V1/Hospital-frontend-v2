import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineContent,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { Typography, Box } from '@mui/material';
import { useDashboardData } from '@/app/(DashboardLayout)/components/dashboard/DashboardDataContext';

const RecentAppointments = () => {
  const { recentAppointments, loading, error } = useDashboardData();

  return (
    <DashboardCard title="Сүүлийн үзлэгүүд">
      <Timeline
        className="theme-timeline"
        sx={{
          p: 0,
          '& .MuiTimelineConnector-root': {
            width: '1px',
            backgroundColor: '#efefef',
          },
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: 0.5,
            paddingLeft: 0,
          },
          '& .MuiTimelineItem-root': {
            minHeight: 'auto',
            '&:before': {
              display: 'none',
            }
          },
          '& .MuiTimelineContent-root': {
            padding: '0px 16px 8px',
          },
          '& .MuiTimelineOppositeContent-root': {
            padding: '0px 16px 8px',
          }
        }}
      >
        {loading ? (
          <TimelineItem>
            <TimelineOppositeContent />
            <TimelineSeparator>
              <TimelineDot color="grey" variant="outlined" />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body2" color="text.secondary">
                Өгөгдөл ачаалж байна...
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ) : recentAppointments.length > 0 ? (
          recentAppointments.map((appointment) => (
            <TimelineItem key={appointment.id}>
              <TimelineOppositeContent color="text.secondary">
                {appointment.dateLabel}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary" variant="outlined" />
              </TimelineSeparator>
              <TimelineContent>
                <Box sx={{ mb: 0.5 }}>
                  <Typography fontWeight="600">{appointment.patientName}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {appointment.title} • {appointment.doctorName}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))
        ) : (
          <TimelineItem>
            <TimelineOppositeContent />
            <TimelineSeparator>
              <TimelineDot color="grey" variant="outlined" />
            </TimelineSeparator>
            <TimelineContent>
              <Box sx={{ mb: 0.5 }}>
                <Typography fontWeight="600">Сүүлийн үзлэгийн өгөгдөл алга</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {error || 'Одоогоор бүртгэгдсэн үзлэг олдсонгүй.'}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        )}
      </Timeline>
    </DashboardCard>
  );
};

export default RecentAppointments;
