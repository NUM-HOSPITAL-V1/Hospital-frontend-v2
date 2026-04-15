'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WcIcon from '@mui/icons-material/Wc';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import NotesIcon from '@mui/icons-material/Notes';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useRouter } from 'next/navigation';
import patientService from '../../../service/patientService';

// Mongolian provinces data
const provinces = [
  'Улаанбаатар',
  'Архангай',
  'Баян-Өлгий',
  'Баянхонгор',
  'Булган',
  'Говь-Алтай',
  'Говьсүмбэр',
  'Дархан-Уул',
  'Дорноговь',
  'Дорнод',
  'Дундговь',
  'Завхан',
  'Орхон',
  'Өвөрхангай',
  'Өмнөговь',
  'Сүхбаатар',
  'Сэлэнгэ',
  'Төв',
  'Увс',
  'Ховд',
  'Хөвсгөл',
  'Хэнтий',
];

// District data for Ulaanbaatar
const ulaanbaatarDistricts = [
  'Баянгол',
  'Баянзүрх',
  'Сүхбаатар',
  'Чингэлтэй',
  'Хан-Уул',
  'Сонгинохайрхан',
  'Налайх',
  'Багануур',
  'Багахангай',
];

// Sample soums for other provinces (simplified for demo)
const provinceSoums = {
  'Архангай': ['Эрдэнэбулган', 'Өгийнуур', 'Цэнхэр', 'Өлзийт', 'Хайрхан'],
  'Баян-Өлгий': ['Өлгий', 'Алтай', 'Буянт', 'Ногооннуур', 'Сагсай'],
  'Баянхонгор': ['Баянхонгор', 'Баацагаан', 'Баян-Өндөр', 'Богд', 'Жаргалант'],
  'Булган': ['Булган', 'Баяннуур', 'Бүрэгхангай', 'Дашинчилэн', 'Хутаг-Өндөр'],
  'Дархан-Уул': ['Дархан', 'Хонгор', 'Орхон', 'Шарын гол'],
  'Сэлэнгэ': ['Сүхбаатар', 'Алтанбулаг', 'Баруунхараа', 'Ерөө', 'Мандал'],
  'Төв': ['Зуунмод', 'Алтанбулаг', 'Аргалант', 'Архуст', 'Батсүмбэр'],
  'Орхон': ['Баян-Өндөр', 'Жаргалант'],
};

export default function CustomerRegister() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [userType, setUserType] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    registrationNumber: '',
    profession: '',
    birthPlace: '',
    apartment: '',
    street: '',
    phone: '',
    email: '',
    password: '',
    notes: '',
  });
  
  // Success dialog state
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  // Confirmation dialog state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    // Update available districts based on selected province
    if (province === 'Улаанбаатар') {
      setAvailableDistricts(ulaanbaatarDistricts);
    } else if (provinceSoums[province]) {
      setAvailableDistricts(provinceSoums[province]);
    } else {
      setAvailableDistricts([]);
    }
    // Reset district selection when province changes
    setDistrict('');
  }, [province]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    router.push('/customer');
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    setOpenConfirmDialog(true);
  };

  const mapUserType = (value) => {
    const typeMap = {
      'Оюутан': 'Student',
      'Багш': 'Teacher',
      'Ажилтан': 'Staff',
    };
    return typeMap[value] || '';
  };

  const mapGender = (value) => {
    const genderMap = {
      'Эрэгтэй': 'male',
      'Эмэгтэй': 'female',
    };
    return genderMap[value];
  };

  const formatBirthDate = (date) => {
    if (!date) return undefined;
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return undefined;
    return parsedDate.toISOString().split('T')[0];
  }; 

  const mapSchoolType = (value) => {
    const schoolTypeMap = {
    "ШУТ UB парк ": "SHUT",
    "УТОУХНУС ": "UTOUHNUS",
    "ИТС": "ITS",
    "МТЭС": "MTEC",
    "ШУС": "SHUS",
    "ХЗС": "HZS",
    "БС": "BS",
    "АТС": "ATS",
    };
    return schoolTypeMap[value] || '';
  };
  
  const confirmSave = async () => {
    if (loading) {
      return;
    }

    const mappedType = mapUserType(userType);
    const mappedGender = mapGender(gender);
    const address = [province, district, formData.apartment, formData.street]
      .filter(Boolean)
      .join(', ');

    if (!formData.lastName || !formData.firstName || !formData.registrationNumber || !formData.phone || !formData.email || !formData.password || !mappedType) {
      setSnackbar({
        open: true,
        message: 'Шаардлагатай талбаруудыг бүрэн бөглөнө үү.',
        severity: 'error',
      });
      return;
    }

    if (formData.password.length < 6) {
      setSnackbar({
        open: true,
        message: 'Нууц үг хамгийн багадаа 6 тэмдэгт байна.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await patientService.createPatient({
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        password: formData.password,
        type: mappedType,
        phoneNumber: formData.phone,
        register: formData.registrationNumber,
        address,
        occupation: formData.profession,
        birthOfDate: formatBirthDate(birthDate),
        gender: mappedGender,
      });

      setOpenConfirmDialog(false);
      setOpenSuccessDialog(true);
    } catch (error) {
      const validationMessage = Array.isArray(error?.errors)
        ? error.errors.map((item) => item.message).join(', ')
        : null;

      setSnackbar({
        open: true,
        message: validationMessage || error?.error || error?.message || 'Үйлчлүүлэгч бүртгэхэд алдаа гарлаа.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSuccessClose = () => {
    setOpenSuccessDialog(false);
    router.push('/customer');
  };
  
  const handleCustomerClose = () => {
    setOpenSuccessDialog(false);
    router.push('/customer');
  };
  const handleExaminationClose = () => {
    setOpenSuccessDialog(false);
    router.push('/examination');
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Header Section */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          {/* Title and actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={handleBack}
                  sx={{ 
                    color: 'primary.main',
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                    mr: 1,
                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1" fontWeight="600">Үйлчлүүлэгч бүртгэх</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Үйлчлүүлэгчийн мэдээллийг үнэн зөв оруулж бүртгэнэ үү.
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3
              }}
            >
              Хадгалах
            </Button>
          </Box>
          
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Энгийнээр бүртгэх" />
            <Tab label="Иргэний үнэмлэхээр бүртгэх" />
            <Tab label="SISI карт уншуулах" />
          </Tabs>
        </Box>

        {/* Content for each tab */}
        <Box sx={{ flexGrow: 1, mx: 3, mb: 3 }}>
          <Paper sx={{ p: 3, border: '1px solid #eee', boxShadow: 'none', borderRadius: '12px' }}>
            {tabValue === 1 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Иргэний үнэмлэхээр бүртгэх боломж удахгүй нэмэгдэнэ.</Typography>
              </Box>
            )}

            {tabValue === 0 && (
              <Box component="form" noValidate autoComplete="off">
                <Grid container spacing={3}>
                  {/* Personal Information Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                      Хувийн мэдээлэл
                    </Typography>
                  </Grid>
                  
                  {/* Row 1 */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Овог"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Нэр"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {/* Row 2 */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Регистрийн дугаар"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Төрсөн он/сар/өдөр"
                        value={birthDate}
                        onChange={(newValue) => setBirthDate(newValue)}
                        slotProps={{
                          textField: { 
                            size: 'small', 
                            fullWidth: true,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarMonthIcon color="primary" />
                                </InputAdornment>
                              ),
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Төрөл</InputLabel>
                      <Select
                        label="Төрөл"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <SchoolIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        <MenuItem value="Оюутан">Оюутан</MenuItem>
                        <MenuItem value="Багш">Багш</MenuItem>
                        <MenuItem value="Ажилтан">Ажилтан</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Хүйс</InputLabel>
                      <Select
                        label="Хүйс"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <WcIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        <MenuItem value="Эрэгтэй">Эрэгтэй</MenuItem>
                        <MenuItem value="Эмэгтэй">Эмэгтэй</MenuItem>
                        <MenuItem value="Бусад">Бусад</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Row 3 */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Үйлчлүүлэгчийн мэргэжил"
                      name="profession"
                      value={formData.profession}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WorkIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Төрсөн газар"
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationCityIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Address Section */}
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                      Хаягийн мэдээлэл
                    </Typography>
                  </Grid>

                  {/* Row 4 */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Хот / Аймаг</InputLabel>
                      <Select
                        label="Хот / Аймаг"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <LocationCityIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        {provinces.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small" disabled={!province}>
                      <InputLabel>Сум / Дүүрэг</InputLabel>
                      <Select
                        label="Сум / Дүүрэг"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <ApartmentIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        {availableDistricts.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Хороо / Байр"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Row 5 */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Гудамж / Байр / Тоот"
                      name="street"
                      value={formData.street}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Утас"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Цахим шуудан"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      type="email"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Нууц үг"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      type="password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Тэмдэглэл"
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      multiline
                      rows={1}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NotesIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabValue === 2 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>SISI карт уншуулах боломж удахгүй нэмэгдэнэ.</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog 
        open={openConfirmDialog} 
        onClose={() => setOpenConfirmDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: '400px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <Box component="div">
            <Typography variant="h6" component="span" fontWeight={600}>
              Мэдээлэл хадгалах
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={() => setOpenConfirmDialog(false)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ py: 3 }}>
          <Typography align="center">
            Үйлчлүүлэгчийн мэдээллийг хадгалахдаа итгэлтэй байна уу?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
            disabled={loading}
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              px: 3,
              minWidth: '120px'
            }}
          >
            Болих
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmSave}
            disabled={loading}
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              px: 3,
              minWidth: '120px'
            }}
          >
            {loading ? 'Хадгалж байна...' : 'Хадгалах'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog 
        open={openSuccessDialog} 
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: '400px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Амжилттай!
          </Typography>
          <Typography>
            Үйлчлүүлэгчийн мэдээллийг амжилттай хадгаллаа.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
  pb: 3, 
  py: 2, 
  display: 'flex',
  flexDirection: 'column',
  gap: 2
}}>
  <Button
    fullWidth
    variant="contained"
    onClick={handleExaminationClose}
    sx={{
      borderRadius: '8px',
      textTransform: 'none',
      px: 3,
      height: '40px'
    }}
  >
    Үзлэг рүү буцах
  </Button>
  <Button
    fullWidth
    variant="contained"
    onClick={handleCustomerClose}
    sx={{
      borderRadius: '8px',
      textTransform: 'none',
      px: 3,
      height: '40px'
    }}
  >
    Нийт үйлчлүүлэгчид рүү буцах
  </Button>
</DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
