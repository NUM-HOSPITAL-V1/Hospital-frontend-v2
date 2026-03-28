'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Pagination,
  TextField,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import patientService from '../../../../src/app/service/patientService';

export default function Patient() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 6;
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    birthDate: '',
    age: '',
    type: '',
    address: '',
    phone: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch patients on component mount
  useEffect(() => {
    const fetchAndTransformPatients = async () => {
      try {
        setLoading(true);
        const response = await patientService.getAllPatients();
        const transformed = response.patients.map((patient) => ({
          id: patient.id,
          name: `${patient.lastname} ${patient.firstname}`,
          birthDate: formatDate(patient.birthOfDate),
          age: calculateAge(patient.birthOfDate),
          type: mapPatientType(patient.type),
          address: patient.address || 'N/A',
          phone: patient.phoneNumber || 'N/A',
        }));
        setPatients(transformed);
      } catch (error) {
        console.error('Fetch алдаа:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAndTransformPatients();
  }, []);
  

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAllPatients();
      
      // Transform backend data to match frontend structure
      const transformedPatients = response.patients.map((patient) => ({
        id: patient.id, // Zorilgot ID, temp-id bish
        
        name: `${patient.lastname} ${patient.firstname}`,
        birthDate: formatDate(patient.birthOfDate),
        age: calculateAge(patient.birthOfDate),
        type: mapPatientType(patient.type),
        address: patient.address || "N/A",
        phone: patient.phoneNumber || "N/A",
      }));
      
      
      setPatients(transformedPatients);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Үйлчлүүлэгчдийн мэдээлэл татахад алдаа гарлаа');
      setSnackbar({
        open: true,
        message: 'Үйлчлүүлэгчдийн мэдээлэл татахад алдаа гарлаа',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (typeof window === 'undefined' || !dateString) return dateString;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };
  
  const calculateAge = (dateString) => {
    if (typeof window === 'undefined' || !dateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  

  const mapPatientType = (type) => {
    const typeMap = {
      'Patient': 'Үйлчлүүлэгч',
      'Student': 'Оюутан',
      'Teacher': 'Багш',
      'Staff': 'Ажилтан'
    };
    return typeMap[type] || type;
  };

  // Switch tabs
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Filter data based on the selected tab
  const filteredPatients = patients.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (tabValue === 0) return true; // All patients
    if (tabValue === 1) return item.type === 'Оюутан';
    if (tabValue === 2) return item.type === 'Багш';
    if (tabValue === 3) return item.type === 'Ажилтан';
    return true;
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);

  // Get current page data
  const currentPageData = filteredPatients.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Navigate to /patientRegister
  const handleAddPatient = () => {
    router.push('/customer/customerRegister');
  };
  
  // Menu handlers
  const handleMoreClick = (event, patient) => {
    console.log("Clicked patient:", patient);
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleEdit = () => {
    const fullPatient = {
      ...selectedPatient,
      id: selectedPatient._id || selectedPatient.id, // fallback
    };
    console.log("Edit clicked, patient:", fullPatient);
    setEditFormData({ ...selectedPatient });
    setOpenEditDialog(true);
    handleCloseMenu();
  };
  
  const handleDelete = () => {
    setOpenDeleteConfirm(true);
    handleCloseMenu();
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const saveEdit = async () => {
    try {
      // Extract the form data and create a proper backend-compatible object
      const { id, ...patientData } = editFormData;
      
      // Parse name into firstName and lastName
      const nameParts = getNameParts(patientData.name);
      
      const updatedPatientData = {
        firstname: nameParts.firstName,
        lastname: nameParts.lastName,
        phoneNumber: patientData.phone,
        address: patientData.address,
        type: reverseMappedType(patientData.type)
      };
      
      const response = await patientService.updatePatient(id, updatedPatientData);
      
      // Update local state
      setPatients((prev) =>
        prev.map((pat) =>
          pat.id === id ? { ...editFormData } : pat
        )
      );
      
      setSnackbar({
        open: true,
        message: 'Үйлчлүүлэгчийн мэдээлэл амжилттай шинэчлэгдлээ',
        severity: 'success'
      });
      
      setOpenEditDialog(false);
    } catch (err) {
      console.error('Error updating patient:', err);
      setSnackbar({
        open: true,
        message: 'Үйлчлүүлэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа',
        severity: 'error'
      });
    }
  };
  
  const confirmDelete = async () => {
    try {
      await patientService.deletePatient(selectedPatient.id);
      
      // Update local state
      setPatients((prev) => prev.filter((pat) => pat.id !== selectedPatient.id));
      
      setSnackbar({
        open: true,
        message: 'Үйлчлүүлэгч амжилттай устгагдлаа',
        severity: 'success'
      });
      
      setOpenDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting patient:', err);
      setSnackbar({
        open: true,
        message: 'Үйлчлүүлэгчийг устгахад алдаа гарлаа',
        severity: 'error'
      });
    }
  };
  
  const cancelDelete = () => {
    setOpenDeleteConfirm(false);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };
  
  const getNameParts = (fullName) => {
    const parts = fullName.split(' ');
    if (parts.length === 2) {
      return { lastName: parts[0], firstName: parts[1] };
    } else if (parts.length > 2) {
      return { lastName: parts[0], firstName: parts.slice(1).join(' ') };
    }
    return { lastName: '', firstName: fullName };
  };
  
  const reverseMappedType = (mongolianType) => {
    const reverseMap = {
      'Үйлчлүүлэгч': 'Patient',
      'Оюутан': 'Student',
      'Багш': 'Teacher',
      'Ажилтан': 'Staff'
    };
    return reverseMap[mongolianType] || 'Patient';
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
      {/* Content area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          {/* Title and search */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="600">Үйлчлүүлэгч</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Бүх үйлчлүүлэгчийн дэлгэрэнгүй мэдээллийг жагсаалт</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Хайх"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ width: 250 }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleAddPatient}
                sx={{ 
                  borderRadius: '8px', 
                  textTransform: 'none' 
                }}
              >
                Нэмэх
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
            <Tab label="Бүх үйлчлүүлэгч" />
            <Tab label="Оюутан" />
            <Tab label="Багш" />
            <Tab label="Ажилтан" />
          </Tabs>
        </Box>

        {/* Loading or Error States */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ m: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <>
            {/* Table */}
            <TableContainer component={Paper} sx={{ 
              flexGrow: 1, 
              mx: 3, 
              boxShadow: 'none', 
              border: '1px solid #eee',
              borderRadius: '12px'
            }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Нэр</strong></TableCell>
                    <TableCell><strong>Төрсөн огноо</strong></TableCell>
                    <TableCell><strong>Нас</strong></TableCell>
                    <TableCell><strong>Төрөл</strong></TableCell>
                    <TableCell><strong>Хаяг</strong></TableCell>
                    <TableCell><strong>Утас</strong></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPageData.length > 0 ? (
                    currentPageData.map((item, index) => {
                      const { lastName, firstName } = getNameParts(item.name);
                      // Ensure each row has a unique key by using both ID and index
                      const uniqueKey = `patient-${item.id}-${index}`;
                      
                      return (
                        <TableRow
                          key={uniqueKey}
                          sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  mr: 2, 
                                  width: 36, 
                                  height: 36, 
                                  bgcolor: 'primary.main',
                                  fontSize: '14px',
                                  fontWeight: 'medium'
                                }}
                              >
                                {item.name.charAt(0)}
                              </Avatar>
                              {item.name}
                            </Box>
                          </TableCell>
                          <TableCell>{item.birthDate}</TableCell>
                          <TableCell>{item.age}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.address}</TableCell>
                          <TableCell>{item.phone}</TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleMoreClick(e, item)}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { 
                                  bgcolor: 'rgba(0, 0, 0, 0.04)' 
                                }
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          Үйлчлүүлэгч олдсонгүй
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="small"
              />
            </Box>
          </>
        )}
        
        {/* Menu */}
        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.08)',
              borderRadius: '8px',
              minWidth: '160px'
            }
          }}
        >
          <MenuItem 
            onClick={handleEdit}
            sx={{ 
              gap: 1,
              py: 1,
              '&:hover': { 
                bgcolor: 'rgba(25, 118, 210, 0.08)' 
              }
            }}
          >
            <EditOutlinedIcon fontSize="small" color="primary" />
            <Typography>Засах</Typography>
          </MenuItem>
          <MenuItem 
            onClick={handleDelete}
            sx={{ 
              gap: 1,
              py: 1, 
              '&:hover': { 
                bgcolor: 'rgba(211, 47, 47, 0.08)' 
              }
            }}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" color="error" />
            <Typography color="error.main">Устгах</Typography>
          </MenuItem>
        </Menu>
        
        {/* Edit Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={() => setOpenEditDialog(false)} 
          fullWidth 
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1
          }}>
            <Box component="div">
              <Typography variant="h6" component="span" fontWeight={600}>
                Үйлчлүүлэгчийн мэдээлэл засах
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setOpenEditDialog(false)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          
          <Divider />
          
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Нэр"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Төрсөн огноо"
                name="birthDate"
                value={editFormData.birthDate}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Нас"
                name="age"
                value={editFormData.age}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                type="number"
              />
              
              <FormControl fullWidth>
                <InputLabel id="type-label">Төрөл</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditChange}
                  label="Төрөл"
                >
                  <MenuItem value="Үйлчлүүлэгч">Үйлчлүүлэгч</MenuItem>
                  <MenuItem value="Оюутан">Оюутан</MenuItem>
                  <MenuItem value="Багш">Багш</MenuItem>
                  <MenuItem value="Ажилтан">Ажилтан</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Хаяг"
                name="address"
                value={editFormData.address}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Утас"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={() => setOpenEditDialog(false)}
              variant="outlined"
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3
              }}
            >
              Болих
            </Button>
            <Button 
              variant="contained" 
              onClick={saveEdit}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3
              }}
            >
              Хадгалах
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirm Dialog */}
        <Dialog 
          open={openDeleteConfirm} 
          onClose={cancelDelete}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              width: '400px',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteOutlineOutlinedIcon color="error" />
              <Typography variant="h6" component="span" fontWeight={600} color="error.main">
                Устгах уу?
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={cancelDelete}
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
              Та <b>{selectedPatient?.name}</b> үйлчлүүлэгчийг устгахдаа итгэлтэй байна уу?
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Энэ үйлдлийг буцаах боломжгүй.
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
            <Button 
              onClick={cancelDelete}
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
              color="error" 
              onClick={confirmDelete}
              startIcon={<DeleteOutlineOutlinedIcon />}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3,
                minWidth: '120px'
              }}
            >
              Устгах
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
