'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  Chip,
  TextField,
  Pagination,
  Button,
  Stack,
  Container,
  Paper,
  IconButton,
  InputAdornment,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  alpha,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HeightIcon from '@mui/icons-material/Height';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AirIcon from '@mui/icons-material/Air';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AddIcon from '@mui/icons-material/Add';
import { format, isSameDay } from 'date-fns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Match customer management theme while preserving vital card design
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Match customer UI blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f50057', // Match customer UI accent color
      light: '#ff4081',
      dark: '#c51162',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
    },
  },
  shape: {
    borderRadius: 8, // Match customer UI rounded corners
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

const generateSampleData = () => [];

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1, boxShadow: 2, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="body2">{`${payload[0].payload.time}`}</Typography>
        <Typography variant="body1" fontWeight="bold" color="primary">
          {`${payload[0].value} bpm`}
        </Typography>
      </Paper>
    );
  }
  return null;
};

// Vital sign component with colored background based on status
const VitalSignChip = ({ icon, label, isNormal }) => {
  const theme = useTheme();
  
  return (
    <Chip 
      icon={icon} 
      label={label} 
      sx={{ 
        width: '100%',
        bgcolor: isNormal ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
        color: isNormal ? theme.palette.success.dark : theme.palette.warning.dark,
        borderLeft: isNormal ? `4px solid ${theme.palette.success.main}` : `4px solid ${theme.palette.warning.main}`,
        '& .MuiChip-icon': {
          color: isNormal ? theme.palette.success.main : theme.palette.warning.main,
        }
      }} 
    />
  );
};

// Patient card - keeping the original design
const PatientCard = ({ patient }) => {
  const theme = useTheme();
  
  // Colors for the chart based on status
  const chartColor = 
    patient.status === 'normal' ? theme.palette.success.main :
    patient.status === 'attention' ? theme.palette.warning.main :
    theme.palette.error.main;
  
  return (
    <Card 
      sx={{ 
        borderRadius: 3, 
        boxShadow: 3,
        position: 'relative',
        overflow: 'visible',
        borderTop: `4px solid ${chartColor}`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)',
        },
      }}
    >
      <Avatar 
        sx={{ 
          position: 'absolute', 
          top: -20, 
          right: 20, 
          width: 50, 
          height: 50, 
          bgcolor: chartColor,
          boxShadow: 2
        }}
      >
        <MonitorHeartIcon />
      </Avatar>
      
      <CardContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">{patient.name}</Typography>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="body2" color="text.secondary">
                {patient.age} насны {patient.gender.toLowerCase()}
              </Typography>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: 
                    patient.status === 'normal' ? theme.palette.success.main :
                    patient.status === 'attention' ? theme.palette.warning.main :
                    theme.palette.error.main
                }} 
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Үзүүлсэн: {format(patient.date, 'yyyy-MM-dd')}
            </Typography>
          </Box>
        </Box>

        <Box mt={4}>
          <Typography variant="body2" fontWeight="medium" mb={1} sx={{ opacity: 0.7 }}>Зүрхний хэмнэл</Typography>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={patient.recent} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: theme.palette.text.secondary }} 
                tickLine={false}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']} 
                hide
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="hr" 
                stroke={chartColor} 
                strokeWidth={2} 
                dot={{ fill: chartColor, strokeWidth: 1, r: 3 }}
                activeDot={{ fill: chartColor, strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Grid container spacing={1} mt={2}>
          <Grid item xs={6}>
            <VitalSignChip 
              icon={<DeviceThermostatIcon />} 
              label={`${patient.temperature}°C`} 
              isNormal={patient.isTemperatureNormal}
            />
          </Grid>
          <Grid item xs={6}>
            <VitalSignChip 
              icon={<FavoriteIcon />} 
              label={`${patient.heartRate} bpm`} 
              isNormal={patient.isHeartRateNormal}
            />
          </Grid>
          <Grid item xs={6}>
            <VitalSignChip 
              icon={<MonitorHeartIcon />} 
              label={patient.bloodPressure} 
              isNormal={patient.isBPNormal}
            />
          </Grid>
          <Grid item xs={6}>
            <VitalSignChip 
              icon={<AirIcon />} 
              label={`${patient.respiratoryRate}/мин`} 
              isNormal={patient.isRespiratoryNormal}
            />
          </Grid>
          <Grid item xs={6}>
            <Chip 
              icon={<FitnessCenterIcon />} 
              label={`${patient.weight} кг`} 
              sx={{ width: '100%', bgcolor: alpha(theme.palette.primary.main, 0.1) }}
            />
          </Grid>
          <Grid item xs={6}>
            <Chip 
              icon={<HeightIcon />} 
              label={`${patient.height} см`} 
              sx={{ width: '100%', bgcolor: alpha(theme.palette.primary.main, 0.1) }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const VitalSignsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const perPage = 9;

  const allData = generateSampleData(50);

  const filteredData = allData
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !selectedDate || isSameDay(p.date, selectedDate);
      
      let matchesFilter = true;
      if (tabValue === 1) matchesFilter = p.status === 'normal';
      if (tabValue === 2) matchesFilter = p.status === 'attention';
      if (tabValue === 3) matchesFilter = p.status === 'warning';
      
      return matchesSearch && matchesDate && matchesFilter;
    })
    .sort((a, b) => sortNewest ? b.date - a.date : a.date - b.date);

  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);
  const pageCount = Math.ceil(filteredData.length / perPage);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedDate(null);
    setFilterStatus('all');
    setTabValue(0);
    setPage(1);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  // Count by status for tabs
  const normalCount = allData.filter(p => p.status === 'normal').length;
  const attentionCount = allData.filter(p => p.status === 'attention').length;
  const warningCount = allData.filter(p => p.status === 'warning').length;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
          <Box sx={{ px: 3, pt: 3, pb: 2 }}>
            {/* Title and search */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="600">Амин Үзүүлэлт</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Эрүүл мэндийн үзүүлэлтийн хяналтын самбар
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  placeholder="Хайх"
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250 }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  sx={{ 
                    borderRadius: '8px', 
                    textTransform: 'none' 
                  }}
                >
                  Амин үзүүлэлт бүртгэх
                </Button>
              </Box>
            </Box>
            
            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`Бүх өвчтөн (${allData.length})`} />
              <Tab label={`Хэвийн (${normalCount})`} />
              <Tab label={`Анхаарах (${attentionCount})`} />
              <Tab label={`Яаралтай (${warningCount})`} />
            </Tabs>
          </Box>
          
          {/* Filter bar */}
          <Paper 
            elevation={0} 
            sx={{ 
              mx: 3, 
              mb: 3, 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6} lg={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Огноогоор шүүх"
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        size: "small",
                        sx: { bgcolor: 'background.paper' }
                      } 
                    }}
                    format="yyyy-MM-dd"
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SortIcon color="primary" fontSize="small" />
                  <Typography variant="body2" mr={1}>Эрэмбэлэх:</Typography>
                  <Button 
                    variant={sortNewest ? 'contained' : 'outlined'} 
                    onClick={() => setSortNewest(true)}
                    size="small"
                  >
                    Сүүлийн
                  </Button>
                  <Button 
                    variant={!sortNewest ? 'contained' : 'outlined'} 
                    onClick={() => setSortNewest(false)}
                    size="small"
                  >
                    Эхний
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={12} lg={5}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {(search || selectedDate || tabValue !== 0) && (
                    <Button 
                      variant="outlined" 
                      startIcon={<ClearIcon />}
                      onClick={handleClearFilters}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Цэвэрлэх
                    </Button>
                  )}
                  <Button 
                    variant="outlined" 
                    startIcon={<FilterAltIcon />}
                    size="small"
                  >
                    Нэмэлт шүүлт
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Results count */}
          <Box sx={{ px: 3, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredData.length} өвчтөн олдлоо
            </Typography>
            <Chip 
              label={`${perPage * (page-1) + 1}-${Math.min(perPage * page, filteredData.length)} / ${filteredData.length}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Patient cards - using the original PatientCard component */}
          <Box sx={{ px: 3, flex: 1 }}>
            <Grid container spacing={3}>
              {paginatedData.length > 0 ? (
                paginatedData.map((patient) => (
                  <Grid item xs={12} sm={6} md={4} key={patient.id}>
                    <PatientCard patient={patient} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                    <Typography variant="h6" color="text.secondary">
                      Өвчтөн олдсонгүй
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Хайлтын утгаа өөрчилнө үү
                    </Typography>
                    <Button variant="outlined" onClick={handleClearFilters} sx={{ mt: 2 }}>
                      Шүүлтүүрийг арилгах
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="medium"
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default VitalSignsPage;
