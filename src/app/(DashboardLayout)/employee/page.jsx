'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Pagination, TextField,
  Typography, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, FormControl, InputLabel, Select, Stack, CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import employeeService from '../../service/employeeService';

const ITEMS_PER_PAGE = 6;

const normalizeEmployee = (employee) => ({
  id: employee.id,
  firstname: employee.firstname || '',
  lastname: employee.lastname || '',
  email: employee.email || '',
  phoneNumber: employee.phoneNumber || '',
  position: employee.position || '',
  specialization: employee.specialization || '',
});

const getFullName = (employee) =>
  `${employee?.lastname || ''} ${employee?.firstname || ''}`.trim();

export default function Employee() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    firstname: '',
    lastname: '',
    email: '',
    position: '',
    specialization: '',
    phoneNumber: '',
  });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await employeeService.getAllEmployees();
      setEmployees(Array.isArray(data) ? data.map(normalizeEmployee) : []);
    } catch (fetchError) {
      console.error('Failed to load employees:', fetchError);
      setError('Ажилтны мэдээлэл ачааллах үед алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredEmployees = employees.filter((employee) => {
    const searchableText = [
      employee.firstname,
      employee.lastname,
      employee.email,
      employee.phoneNumber,
      employee.position,
      employee.specialization,
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (tabValue === 0) return true;
    if (tabValue === 1) return employee.position === 'Эмч';
    if (tabValue === 2) return employee.position === 'Сувилагч';
    if (tabValue === 3) return employee.position === 'Асрагч';
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE));
  const currentPageData = filteredEmployees.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAddEmployee = () => {
    router.push('/employee/employeeRegister');
  };

  const handleMoreClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (!selectedEmployee) return;

    setEditFormData({
      id: selectedEmployee.id,
      firstname: selectedEmployee.firstname,
      lastname: selectedEmployee.lastname,
      email: selectedEmployee.email,
      position: selectedEmployee.position,
      specialization: selectedEmployee.specialization,
      phoneNumber: selectedEmployee.phoneNumber,
    });
    setOpenEditDialog(true);
    handleCloseMenu();
  };

  const handleDelete = () => {
    setOpenDeleteConfirm(true);
    handleCloseMenu();
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editFormData.firstname || !editFormData.lastname || !editFormData.email) {
      setError('Овог, нэр, имэйл талбаруудыг бөглөнө үү.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const updatedEmployee = await employeeService.updateEmployee(editFormData.id, {
        firstname: editFormData.firstname,
        lastname: editFormData.lastname,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        position: editFormData.position,
        specialization: editFormData.specialization,
      });

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === editFormData.id ? normalizeEmployee(updatedEmployee) : employee
        )
      );
      setOpenEditDialog(false);
    } catch (updateError) {
      console.error('Failed to update employee:', updateError);
      setError('Ажилтны мэдээлэл шинэчлэх үед алдаа гарлаа.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedEmployee?.id) return;

    try {
      setActionLoading(true);
      setError('');
      await employeeService.deleteEmployee(selectedEmployee.id);
      setEmployees((prev) => prev.filter((employee) => employee.id !== selectedEmployee.id));
      setOpenDeleteConfirm(false);
      setSelectedEmployee(null);
    } catch (deleteError) {
      console.error('Failed to delete employee:', deleteError);
      setError('Ажилтан устгах үед алдаа гарлаа.');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelDelete = () => {
    setOpenDeleteConfirm(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="600">Ажилтан</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Бүх ажилтны дэлгэрэнгүй мэдээллийн жагсаалт
              </Typography>
              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Хайх"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ width: 250 }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddEmployee}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Нэмэх
              </Button>
              <Button
                variant="outlined"
                onClick={loadEmployees}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Шинэчлэх
              </Button>
            </Box>
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Бүх ажилтан" />
            <Tab label="Эмч" />
            <Tab label="Сувилагч" />
            <Tab label="Асрагч" />
          </Tabs>
        </Box>

        <TableContainer component={Paper} sx={{ flexGrow: 1, mx: 3, boxShadow: 'none', border: '1px solid #eee', borderRadius: '12px' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Овог</TableCell>
                <TableCell>Нэр</TableCell>
                <TableCell>Албан тушаал</TableCell>
                <TableCell>Мэргэжил</TableCell>
                <TableCell>Утасны дугаар</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    Ажилтны мэдээлэл олдсонгүй.
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((employee) => (
                  <TableRow key={employee.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
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
                          {(employee.firstname || employee.lastname || '?').charAt(0)}
                        </Avatar>
                        {employee.lastname || '-'}
                      </Box>
                    </TableCell>
                    <TableCell>{employee.firstname || '-'}</TableCell>
                    <TableCell>{employee.position || '-'}</TableCell>
                    <TableCell>{employee.specialization || '-'}</TableCell>
                    <TableCell>{employee.phoneNumber || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMoreClick(event, employee)}
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="small" />
        </Box>

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
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1
            }}
          >
            <Box component="div">
              <Typography variant="h6" component="span" fontWeight={600}>
                Ажилтны мэдээлэл засах
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
                label="Овог"
                name="lastname"
                value={editFormData.lastname}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Нэр"
                name="firstname"
                value={editFormData.firstname}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Имэйл"
                name="email"
                value={editFormData.email}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth>
                <InputLabel id="position-label">Албан тушаал</InputLabel>
                <Select
                  labelId="position-label"
                  name="position"
                  value={editFormData.position}
                  onChange={handleEditChange}
                  label="Албан тушаал"
                >
                  <MenuItem value="Эмч">Эмч</MenuItem>
                  <MenuItem value="Сувилагч">Сувилагч</MenuItem>
                  <MenuItem value="Асрагч">Асрагч</MenuItem>
                  <MenuItem value="Удирдлага">Удирдлага</MenuItem>
                  <MenuItem value="Харуул">Харуул</MenuItem>
                  <MenuItem value="Цэвэрлэгч">Цэвэрлэгч</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Мэргэжил"
                name="specialization"
                value={editFormData.specialization}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Утас"
                name="phoneNumber"
                value={editFormData.phoneNumber}
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
              disabled={actionLoading}
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
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
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
              Та <b>{getFullName(selectedEmployee) || 'энэ ажилтан'}</b> ажилтныг устгахдаа итгэлтэй байна уу?
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
              disabled={actionLoading}
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
