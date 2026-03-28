'use client';

import React, { useEffect, useState } from 'react';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
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
import patientService from '../../service/patientService';
import vitalService from '../../service/vitalService';

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
  const [allData, setAllData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    patient: '',
    date: new Date(),
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    weight: '',
    height: '',
    saturation: '',
    concsiousness_status: '',
  });
  const perPage = 9;

  const getRole = () => {
    if (typeof window === 'undefined') return '';
    try {
      const storedUser = JSON.parse(localStorage.getItem('USER') || '{}');
      return storedUser?.user?.role || '';
    } catch (error) {
      return '';
    }
  };

  const parseBloodPressure = (bloodPressure) => {
    const [systolic, diastolic] = String(bloodPressure || '')
      .split('/')
      .map((value) => Number(value.trim()));

    return {
      systolic: Number.isFinite(systolic) ? systolic : null,
      diastolic: Number.isFinite(diastolic) ? diastolic : null,
    };
  };

  const evaluateStatus = (vital) => {
    const temperature = Number(vital.temperature);
    const heartRate = Number(vital.right_heart_rate);
    const systolic = Number(vital.right_systolic);
    const diastolic = Number(vital.right_diastolic);
    const respiratoryRate = Number(vital.respiration_rate);

    const warning =
      temperature >= 39 ||
      heartRate >= 120 ||
      systolic >= 180 ||
      diastolic >= 120 ||
      respiratoryRate >= 30;

    if (warning) return 'warning';

    const attention =
      temperature >= 37.5 ||
      heartRate > 100 ||
      heartRate < 60 ||
      systolic >= 140 ||
      diastolic >= 90 ||
      respiratoryRate > 20;

    return attention ? 'attention' : 'normal';
  };

  const transformPatientVitals = (patient, vitals) => {
    const latest = vitals[0];
    if (!latest) return null;

    const status = evaluateStatus(latest);
    const bloodPressure = [
      latest.right_systolic ?? latest.left_systolic ?? '-',
      latest.right_diastolic ?? latest.left_diastolic ?? '-',
    ].join('/');

    return {
      id: patient.id,
      name: `${patient.lastname || ''} ${patient.firstname || ''}`.trim(),
      age: patient.birthOfDate
        ? Math.max(0, new Date().getFullYear() - new Date(patient.birthOfDate).getFullYear())
        : 'N/A',
      gender: patient.gender === 'male' ? 'Эрэгтэй' : patient.gender === 'female' ? 'Эмэгтэй' : 'Тодорхойгүй',
      date: new Date(latest.date || latest.createdAt),
      status,
      temperature: latest.temperature ?? '-',
      heartRate: latest.right_heart_rate ?? latest.left_heart_rate ?? '-',
      bloodPressure,
      respiratoryRate: latest.respiration_rate ?? '-',
      weight: latest.weight ?? '-',
      height: latest.height ?? '-',
      isTemperatureNormal: Number(latest.temperature) >= 36 && Number(latest.temperature) <= 37.4,
      isHeartRateNormal: Number(latest.right_heart_rate ?? latest.left_heart_rate) >= 60 && Number(latest.right_heart_rate ?? latest.left_heart_rate) <= 100,
      isBPNormal: Number(latest.right_systolic ?? latest.left_systolic) < 140 && Number(latest.right_diastolic ?? latest.left_diastolic) < 90,
      isRespiratoryNormal: Number(latest.respiration_rate) >= 12 && Number(latest.respiration_rate) <= 20,
      recent: vitals
        .slice()
        .reverse()
        .map((item) => ({
          time: format(new Date(item.date || item.createdAt), 'MM-dd'),
          hr: item.right_heart_rate ?? item.left_heart_rate ?? 0,
        })),
    };
  };

  const loadVitals = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await patientService.getAllPatients();
      const patientList = response?.patients || [];
      setPatients(patientList);

      const role = getRole();
      let fetchFailureCount = 0;
      const vitalsByPatient = await Promise.all(
        patientList.map(async (patient) => {
          try {
            const vitalResponse = await vitalService.getPatientVitalSigns(patient.id, 7);
            return transformPatientVitals(patient, vitalResponse?.data || []);
          } catch (fetchError) {
            fetchFailureCount += 1;
            console.error(`Error fetching vitals for patient ${patient.id}:`, fetchError);
            if (role === 'Admin' || role === 'MedicalStaff') {
              return null;
            }
            throw fetchError;
          }
        })
      );

      setAllData(vitalsByPatient.filter(Boolean));

      if (patientList.length > 0 && fetchFailureCount === patientList.length) {
        setError('Амин үзүүлэлтийн мэдээлэл татаж чадсангүй. Backend container-оо дахин build хийсэн эсэх, мөн /api/vital/patient/:id/vitalsigns endpoint ажиллаж байгаа эсэхийг шалгана уу.');
      }
    } catch (fetchError) {
      console.error('Error fetching vital signs:', fetchError);
      setError(fetchError?.error || fetchError?.response?.data?.error || 'Амин үзүүлэлтийн мэдээлэл татахад алдаа гарлаа');
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVitals();
  }, []);

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
    setTabValue(0);
    setPage(1);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handleCreateOpen = () => {
    setOpenCreateDialog(true);
  };

  const handleCreateClose = () => {
    if (!saving) {
      setOpenCreateDialog(false);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateDateChange = (date) => {
    setCreateForm((prev) => ({ ...prev, date }));
  };

  const handleCreateSubmit = async () => {
    if (!createForm.patient) {
      setError('Өвчтөн сонгоно уу');
      return;
    }

    const { systolic, diastolic } = parseBloodPressure(createForm.bloodPressure);
    if (!systolic || !diastolic) {
      setError('Цусны даралтыг 120/80 хэлбэрээр оруулна уу');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await vitalService.createVitalSigns({
        patient: createForm.patient,
        date: createForm.date,
        temperature: createForm.temperature === '' ? undefined : Number(createForm.temperature),
        right_systolic: systolic,
        right_diastolic: diastolic,
        right_heart_rate: createForm.heartRate === '' ? undefined : Number(createForm.heartRate),
        respiration_rate: createForm.respiratoryRate === '' ? undefined : Number(createForm.respiratoryRate),
        weight: createForm.weight === '' ? undefined : Number(createForm.weight),
        height: createForm.height === '' ? undefined : Number(createForm.height),
        saturation: createForm.saturation === '' ? undefined : Number(createForm.saturation),
        concsiousness_status: createForm.concsiousness_status || undefined,
      });

      setOpenCreateDialog(false);
      setCreateForm({
        patient: '',
        date: new Date(),
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        weight: '',
        height: '',
        saturation: '',
        concsiousness_status: '',
      });
      await loadVitals();
    } catch (saveError) {
      console.error('Error creating vital signs:', saveError);
      setError(saveError?.error || saveError?.response?.data?.error || 'Амин үзүүлэлт бүртгэхэд алдаа гарлаа');
    } finally {
      setSaving(false);
    }
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
                  onClick={handleCreateOpen}
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

          {error ? (
            <Box sx={{ px: 3, mb: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : null}
          
          {/* Results count */}
          <Box sx={{ px: 3, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Ачааллаж байна...' : `${filteredData.length} өвчтөн олдлоо`}
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
                      {loading ? 'Ачааллаж байна' : 'Өвчтөн олдсонгүй'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {loading ? 'Амин үзүүлэлтийн мэдээлэл татаж байна' : 'Хайлтын утгаа өөрчилнө үү'}
                    </Typography>
                    {loading ? null : (
                      <Button variant="outlined" onClick={handleClearFilters} sx={{ mt: 2 }}>
                        Шүүлтүүрийг арилгах
                      </Button>
                    )}
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

        <Dialog open={openCreateDialog} onClose={handleCreateClose} fullWidth maxWidth="sm">
          <DialogTitle>Амин үзүүлэлт бүртгэх</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                label="Өвчтөн"
                name="patient"
                value={createForm.patient}
                onChange={handleCreateChange}
                fullWidth
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {`${patient.lastname || ''} ${patient.firstname || ''}`.trim()}
                  </MenuItem>
                ))}
              </TextField>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Огноо"
                  value={createForm.date}
                  onChange={handleCreateDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                  format="yyyy-MM-dd"
                />
              </LocalizationProvider>
              <TextField label="Биеийн халуун" name="temperature" value={createForm.temperature} onChange={handleCreateChange} fullWidth />
              <TextField label="Цусны даралт" name="bloodPressure" value={createForm.bloodPressure} onChange={handleCreateChange} placeholder="120/80" fullWidth />
              <TextField label="Зүрхний цохилт" name="heartRate" value={createForm.heartRate} onChange={handleCreateChange} fullWidth />
              <TextField label="Амьсгалын хэмнэл" name="respiratoryRate" value={createForm.respiratoryRate} onChange={handleCreateChange} fullWidth />
              <TextField label="Хүчилтөрөгчийн ханалт" name="saturation" value={createForm.saturation} onChange={handleCreateChange} fullWidth />
              <TextField label="Жин" name="weight" value={createForm.weight} onChange={handleCreateChange} fullWidth />
              <TextField label="Өндөр" name="height" value={createForm.height} onChange={handleCreateChange} fullWidth />
              <TextField label="Ухаан санааны байдал" name="concsiousness_status" value={createForm.concsiousness_status} onChange={handleCreateChange} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateClose} disabled={saving}>Болих</Button>
            <Button onClick={handleCreateSubmit} variant="contained" disabled={saving}>
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default VitalSignsPage;
