'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Pagination, Tabs, Tab, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, FormControl, InputLabel, Select, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Added for Дууссан status
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // Added for Хийгдэж буй status
import { useRouter } from 'next/navigation';
import examinationService from '../../service/examinationService';

const initialExaminations = [];

export default function ExaminationPage() {
  const [examinations, setExaminations] = useState(initialExaminations);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const router = useRouter();
  
  // Dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  
  // Edit form data
  const [editFormData, setEditFormData] = useState({
    id: '',
    date: '',
    lastName: '',
    firstName: '',
    type: '',
    diagnosis: '',
    action: '',
    status: ''
  });

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const mapExamType = (exam) => {
    if (exam.exam_type) return exam.exam_type;
    const typeMap = {
      Initial: 'Анхан',
      'Follow-up': 'Давтан',
      Preventive: 'Сэргийлэх',
      'Active Monitoring': 'Хяналт',
      'Home Visit': 'Гэрийн үзлэг',
      'House Call': 'Дуудлага',
    };
    return typeMap[exam.doctors_examination] || exam.doctors_examination || '';
  };

  const mapStatus = (status) => {
    const statusMap = {
      Ongoing: 'Хийгдэж буй',
      Done: 'Дууссан',
      Todo: 'Хүлээгдэж буй',
    };
    return statusMap[status] || status || 'Хийгдэж буй';
  };

  const transformExamination = (exam) => ({
    id: exam._id,
    date: formatDate(exam.exam_date),
    lastName: exam.patient?.lastname || '',
    firstName: exam.patient?.firstname || '',
    type: mapExamType(exam),
    diagnosis: exam.illness || '',
    action: exam.surgery || '',
    status: mapStatus(exam.status),
  });

  useEffect(() => {
    const fetchExaminations = async () => {
      try {
        setLoading(true);
        setFetchError('');

        const storedUser = localStorage.getItem('USER');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const userRole = parsedUser?.user?.role;

        const response = userRole === 'Admin'
          ? await examinationService.getAllExaminations()
          : await examinationService.getMyExaminations();
        const transformed = (response?.data || []).map(transformExamination);
        setExaminations(transformed);
      } catch (error) {
        console.error('Error fetching examinations:', error);
        setFetchError(error?.response?.data?.error || 'Үзлэгийн мэдээлэл татахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    fetchExaminations();
  }, []);

  const ITEMS_PER_PAGE = 4;

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handleMoreClick = (event, exam) => {
    setAnchorEl(event.currentTarget);
    setSelectedExam(exam);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleEdit = () => {
    setEditFormData({ ...selectedExam });
    setOpenEditDialog(true);
    handleCloseMenu();
  };
  
  const handleDelete = () => {
    const id = selectedExam?.id;
    if (!id) {
      setOpenDeleteConfirm(false);
      return;
    }

    setActionError('');
    examinationService.deleteExamination(id)
      .then(() => {
        setExaminations((prev) => prev.filter((exam) => exam.id !== id));
      })
      .catch((error) => {
        console.error('Error deleting examination:', error);
        setActionError(error?.response?.data?.error || 'Үзлэг устгах үед алдаа гарлаа');
      })
      .finally(() => {
        setOpenDeleteConfirm(false); // modal хаах
      });
  };
  
  const handleViewDetails = () => {
    router.push(`/examinations/${selectedExam?.id}`);
    handleCloseMenu();
  };
  
  const handleOpenDeleteConfirm = () => {
    setOpenDeleteConfirm(true);
    handleCloseMenu();
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const saveEdit = () => {
    setExaminations((prev) =>
      prev.map((exam) =>
        exam.id === editFormData.id ? { ...editFormData } : exam
      )
    );
    console.log("Updated Examination:", editFormData);
    setOpenEditDialog(false);
  };
  
  const confirmDelete = () => {
    handleDelete();
  };
  
  const cancelDelete = () => {
    setOpenDeleteConfirm(false);
  };
  
  const addNewExamination = () => {
    // Navigate to new examination page or open dialog
    router.push('/examination/newExamination');
  };

  const filtered = examinations.filter((item) => {
    const matchesSearch = item.firstName.toLowerCase().includes(search.toLowerCase()) ||
      item.lastName.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab =
      tabValue === 0 ||
      (tabValue === 1 && item.status === 'Хийгдэж буй') ||
      (tabValue === 2 && item.type === 'Анхан') ||
      (tabValue === 3 && item.type === 'Давтан');
      
    return matchesSearch && matchesTab;
  });

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="600">Үзлэг оношилгоо</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Эрүүл биед саруул ухаан оршино.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary"
              onClick={addNewExamination}
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3
              }}
            >
              Шинэ үзлэг
            </Button>
          </Box>
          
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Нийт үзлэгүүд" />
            <Tab label="Хийгдэж буй үзлэг" />
            <Tab label="Анхан үзлэг" />
            <Tab label="Давтан үзлэг" />
          </Tabs>
        </Box>

        <Box sx={{ px: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">Үр дүн: {loading ? '...' : filtered.length}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Хэрэглэгч хайх"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
                }}
                sx={{ width: 240 }}
              />
              
            </Box>
          </Box>
          {fetchError ? (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {fetchError}
            </Typography>
          ) : null}
          {actionError ? (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {actionError}
            </Typography>
          ) : null}
        </Box>

        <TableContainer 
          component={Paper} 
          sx={{ 
            flexGrow: 1, 
            mx: 3, 
            boxShadow: 'none', 
            border: '1px solid #eee', 
            borderRadius: '12px' 
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Үзлэгийн өдөр</TableCell>
                <TableCell>Овог</TableCell>
                <TableCell>Нэр</TableCell>
                <TableCell>Үзлэгийн төрөл</TableCell>
                <TableCell>Онош</TableCell>
                <TableCell>Хийсэн ажилбар</TableCell>
                <TableCell>Төлөв</TableCell>
                <TableCell align="right">Үйлдлүүд</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((exam, idx) => (
                <TableRow 
                  key={exam.id}
                  sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                >
                  <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                  <TableCell>{exam.date}</TableCell>
                  <TableCell>{exam.lastName}</TableCell>
                  <TableCell>{exam.firstName}</TableCell>
                  <TableCell>{exam.type}</TableCell>
                  <TableCell>{exam.diagnosis}</TableCell>
                  <TableCell>{exam.action}</TableCell>
                  <TableCell>
                    <Box 
                      sx={{ 
                        bgcolor: exam.status === 'Хийгдэж буй' ? 'info.100' : 'success.100',
                        color: exam.status === 'Хийгдэж буй' ? 'info.main' : 'success.main',
                        py: 0.5,
                        px: 1.5,
                        borderRadius: '4px',
                        display: 'inline-flex',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      {exam.status === 'Хийгдэж буй' ? (
                        <>
                          <HourglassEmptyIcon fontSize="small" sx={{ fontSize: '16px' }} />
                          {exam.status}
                        </>
                      ) : (
                        <>
                          <CheckCircleOutlineIcon fontSize="small" sx={{ fontSize: '16px' }} />
                          {exam.status}
                        </>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={(e) => handleMoreClick(e, exam)}
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
              ))}
              {!loading && paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Үзлэгийн мэдээлэл алга
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary"
            size="small" 
          />
        </Box>

        {/* Menu */}
        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.08)',
              borderRadius: '8px',
              minWidth: '180px'
            }
          }}
        >
          <MenuItem 
            onClick={handleViewDetails}
            sx={{ 
              gap: 1,
              py: 1,
              '&:hover': { 
                bgcolor: 'rgba(25, 118, 210, 0.08)' 
              }
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" color="primary" />
            <Typography>Дэлгэрэнгүй харах</Typography>
          </MenuItem>
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
            onClick={handleOpenDeleteConfirm} // ✅ ЭНЭ ЧУХАЛ
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
          maxWidth="md"
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
                Үзлэгийн мэдээлэл засах
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
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Үзлэгийн өдөр"
                  name="date"
                  type="date"
                  value={editFormData.date}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth>
                  <InputLabel id="type-label">Үзлэгийн төрөл</InputLabel>
                  <Select
                    labelId="type-label"
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditChange}
                    label="Үзлэгийн төрөл"
                  >
                    <MenuItem value="Анхан">Анхан</MenuItem>
                    <MenuItem value="Давтан">Давтан</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Төлөв</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    label="Төлөв"
                  >
                    <MenuItem value="Хийгдэж буй">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HourglassEmptyIcon fontSize="small" />
                        <Typography>Хийгдэж буй</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="Дууссан">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon fontSize="small" />
                        <Typography>Дууссан</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Овог"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Нэр"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Онош"
                name="diagnosis"
                value={editFormData.diagnosis}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Хийсэн ажилбар"
                name="action"
                value={editFormData.action}
                onChange={handleEditChange}
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
              Та <b>{selectedExam?.lastName} {selectedExam?.firstName}</b> үзлэгийг устгахдаа итгэлтэй байна уу?
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
      </Box>
    </Box>
  );
}
