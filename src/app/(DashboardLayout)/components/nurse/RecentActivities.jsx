import {
    Box,
    Typography,
    Avatar,
    AvatarGroup,
    Divider,
    Button,
    Chip,
    IconButton,
    Menu,
    MenuItem
  } from '@mui/material';
  import {
    Timeline,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
    timelineOppositeContentClasses
  } from '@mui/lab';
  import {
    IconStethoscope,
    IconPill,
    IconHeartbeat,
    IconNotes,
    IconClipboardText,
    IconCheck,
    IconDotsVertical,
    IconCalendarEvent,
    IconClock,
    IconUserPlus,
    IconArrowRight
  } from '@tabler/icons-react';
  import { useState } from 'react';
  import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
  
  // TODO: Dashboard дээрх "сүүлийн үйл ажиллагаа"-г API-аар сольж авах
  const activities = [];
  
  const RecentActivities = () => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'completed', 'upcoming'
  
    const handleOpenMenu = (event) => {
      setMenuAnchor(event.currentTarget);
    };
  
    const handleCloseMenu = () => {
      setMenuAnchor(null);
    };
  
    const handleFilterChange = (newFilter) => {
      setFilter(newFilter);
      handleCloseMenu();
    };
    
    // Filter activities based on selected filter
    const filteredActivities = activities.filter(activity => {
      if (filter === 'completed') return activity.completed;
      if (filter === 'upcoming') return !activity.completed;
      return true; // 'all' filter
    });
  
    // Get icon color based on activity type
    const getIconColor = (color) => {
      return `${color}.main`;
    };
    
    // Get avatar background color based on activity type
    const getAvatarBg = (color) => {
      return `${color}.light`;
    };
  
    return (
      <DashboardCard 
        title="Сүүлийн үйл ажиллагаа" 
        action={
          <>
            <IconButton onClick={handleOpenMenu} size="small">
              <IconDotsVertical size={20} />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={() => handleFilterChange('all')}>
                Бүгд
              </MenuItem>
              <MenuItem onClick={() => handleFilterChange('completed')}>
                Дууссан
              </MenuItem>
              <MenuItem onClick={() => handleFilterChange('upcoming')}>
                Хүлээгдэж буй
              </MenuItem>
            </Menu>
          </>
        }
      >
        <Timeline
          sx={{
            p: 0,
            m: 0,
            '& .MuiTimelineItem-root': { 
              minHeight: 'auto',
              '&:before': {
                display: 'none',
              }
            },
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.2,
              paddingRight: 1,
              paddingLeft: 0,
            },
            '& .MuiTimelineConnector-root': {
              width: '1px',
              backgroundColor: 'divider'
            },
            '& .MuiTimelineContent-root': {
              padding: '0px 16px 20px 16px',
            },
          }}
        >
          {filteredActivities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineOppositeContent
                color="text.secondary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
              >
                <Chip
                  icon={<IconClock size={14} />}
                  label={activity.time}
                  variant="outlined"
                  size="small"
                  color={activity.upcoming ? "primary" : "default"}
                  sx={{ 
                    height: 24,
                    '& .MuiChip-icon': { 
                      fontSize: '0.7rem',
                      marginLeft: '4px'
                    }
                  }}
                />
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot
                  color={activity.color}
                  variant={activity.completed ? "filled" : "outlined"}
                  sx={{ 
                    padding: '4px',
                    marginY: 0.5
                  }}
                >
                  {activity.icon}
                </TimelineDot>
                {index < filteredActivities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {activity.title}
                      {activity.completed && (
                        <IconCheck size={16} style={{ marginLeft: 8, color: '#4caf50', verticalAlign: 'text-bottom' }} />
                      )}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {activity.description}
                    </Typography>
                  </Box>
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 14 } }}>
                    {activity.users.map((user, i) => (
                      <Avatar
                        key={i}
                        sx={{
                          bgcolor: getAvatarBg(activity.color),
                          color: getIconColor(activity.color)
                        }}
                      >
                        {user}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Box>
                
                {!activity.completed && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                      endIcon={<IconCheck size={16} />}
                    >
                      Дууссан
                    </Button>
                  </Box>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="text"
            color="primary"
            endIcon={<IconArrowRight size={16} />}
          >
            Бүх үйл ажиллагааг харах
          </Button>
        </Box>
      </DashboardCard>
    );
  };
  
  export default RecentActivities;