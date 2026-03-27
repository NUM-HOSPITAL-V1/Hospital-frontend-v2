'use client';

import React, { useState } from 'react';
import {
  Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Pagination, TextField,
  Typography, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, 
  DialogActions, Divider, FormControl, InputLabel, Select, Stack
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';

// Sample employee data
const initialEmployees = [];

export default function Employee() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 6;

  const [employees, setEmployees] = useState(initialEmployees);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    department: '',
    position: '',
    gender: '',
    phone: '',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (tabValue === 0) return true;
    if (tabValue === 1) return emp.department === 'Эмч';
    if (tabValue === 2) return emp.department === 'Сувилагч';
    if (tabValue === 3) return emp.department === 'Асрагч';
    return true;
  });

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const currentPageData = filteredEmployees.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAddEmployee = () => {
    router.push('/employee/employeeRegister');
  };

  const handleMoreClick = (event, emp) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(emp);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditFormData({ ...selectedEmployee });
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

  const saveEdit = () => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === editFormData.id ? { ...editFormData } : emp
      )
    );
    console.log("Updated Employee:", editFormData); // энд axios.put ашиглаж болно
    setOpenEditDialog(false);
  };

  const confirmDelete = () => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== selectedEmployee.id));
    setOpenDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setOpenDeleteConfirm(false);
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
                onClick={handleAddEmployee}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Нэмэх
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
                <TableCell>Хүйс</TableCell>
                <TableCell>Утасны дугаар</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.map((emp) => {
                const { lastName, firstName } = getNameParts(emp.name);
                return (
                  <TableRow key={emp.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
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
                          {emp.name.charAt(0)}
                        </Avatar>
                        {lastName}
                      </Box>
                    </TableCell>
                    <TableCell>{firstName}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.gender}</TableCell>
                    <TableCell>{emp.phone}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMoreClick(e, emp)}
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
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="small" />
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
                label="Нэр"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControl fullWidth>
                <InputLabel id="department-label">Албан тушаал</InputLabel>
                <Select
                  labelId="department-label"
                  name="department"
                  value={editFormData.department}
                  onChange={handleEditChange}
                  label="Албан тушаал"
                >
                  <MenuItem value="Эмч">Эмч</MenuItem>
                  <MenuItem value="Сувилагч">Сувилагч</MenuItem>
                  <MenuItem value="Асрагч">Асрагч</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Албан тасаг"
                name="position"
                value={editFormData.position}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControl fullWidth>
                <InputLabel id="gender-label">Хүйс</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  value={editFormData.gender}
                  onChange={handleEditChange}
                  label="Хүйс"
                >
                  <MenuItem value="Эрэгтэй">Эрэгтэй</MenuItem>
                  <MenuItem value="Эмэгтэй">Эмэгтэй</MenuItem>
                </Select>
              </FormControl>
              
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
              Та <b>{selectedEmployee?.name}</b> ажилтныг устгахдаа итгэлтэй байна уу?
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
