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

const RecentAppointments = () => {
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
        <TimelineItem>
          <TimelineOppositeContent />
          <TimelineSeparator>
            <TimelineDot color="grey" variant="outlined" />
          </TimelineSeparator>
          <TimelineContent>
            <Box sx={{ mb: 0.5 }}>
              <Typography fontWeight="600">Сүүлийн үзлэгийн өгөгдөл алга</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">API холбоход энд бодит мэдээлэл харагдана.</Typography>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </DashboardCard>
  );
};

export default RecentAppointments;
