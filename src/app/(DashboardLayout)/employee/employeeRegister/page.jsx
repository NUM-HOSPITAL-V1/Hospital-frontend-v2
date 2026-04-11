'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
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
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockIcon from '@mui/icons-material/Lock';
import employeeService from '../../../service/employeeService';
import { useRouter } from 'next/navigation';

// Position options
const positions = [
  'Эмч',
  'Сувилагч',
  'Асрагч',
  'Удирдлага',
  'Харуул',
  'Цэвэрлэгч'
];

// Department options
const departments = [
  'Анагаах, сургалтын хэрэгжүүлэгч',
  'Хүний нөөц',
  'Санхүү',
  'Үйлчилгээ',
  'Харуул хамгаалалт'
];

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

export default function EmployeeRegister() {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [gender, setGender] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState([]);
  
  // Success dialog state
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  // Confirmation dialog state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    registrationNumber: '',
    education: '',
    email: '',
    password: '',
    apartment: '',
    street: '',
    phone: '',
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
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleBack = () => {
    router.push('/employee');
  };
  
  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !position) {
      setSaveError('Овог, нэр, имэйл, нууц үг, албан тушаал талбаруудыг бөглөнө үү.');
      return;
    }

    setSaveError('');
    setOpenConfirmDialog(true);
  };
  
  const confirmSave = async () => {
    const payload = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phone,
      position,
      specialization: formData.education,
    };

    try {
      setSaveLoading(true);
      await employeeService.createEmployee(payload);
      setOpenConfirmDialog(false);
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error("Employee creation failed:", error);
      setSaveError('Ажилтан бүртгэх үед алдаа гарлаа.');
      setOpenConfirmDialog(false);
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleSuccessClose = () => {
    setOpenSuccessDialog(false);
    router.push('/employee');
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
                <Typography variant="h4" component="h1" fontWeight="600">Ажилтан бүртгэх</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Ажилтны дэлгэрэнгүй мэдээллийг үнэн зөв оруулж бүртгэнэ үү.
                </Typography>
                {saveError && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {saveError}
                  </Typography>
                )}
              </Box>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saveLoading}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3
              }}
            >
              Хадгалах
            </Button>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, mx: 3, mb: 3 }}>
          <Paper sx={{ p: 3, border: '1px solid #eee', boxShadow: 'none', borderRadius: '12px' }}>
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

                {/* Row 2 */}
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
                <Grid item xs={12} sm={4}>
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
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Имэйл хаяг"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Professional Information */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                    Мэргэжлийн мэдээлэл
                  </Typography>
                </Grid>

                {/* Row 3 */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Албан тушаал</InputLabel>
                    <Select
                      label="Албан тушаал"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <WorkIcon color="primary" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value=""><em>Сонгох</em></MenuItem>
                      {positions.map((pos) => (
                        <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
            
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Боловсрол / Мэргэжил"
                    name="education"
                    value={formData.education}
                    onChange={handleFormChange}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Анхны нууц үг"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    type="password"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Row 4 */}
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Ажилд орсон огноо"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
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
              </Grid>
            </Box>
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
            Ажилтны мэдээллийг хадгалахдаа итгэлтэй байна уу?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
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
            disabled={saveLoading}
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              px: 3,
              minWidth: '120px'
            }}
          >
            Хадгалах
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog 
        open={openSuccessDialog} 
        onClose={handleSuccessClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: '400px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogContent sx={{ py: 4, textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Амжилттай!
          </Typography>
          <Typography>
            Ажилтны мэдээллийг амжилттай бүртгэлээ.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleSuccessClose}
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              px: 3,
              minWidth: '120px'
            }}
          >
            Ажилтнууд
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
