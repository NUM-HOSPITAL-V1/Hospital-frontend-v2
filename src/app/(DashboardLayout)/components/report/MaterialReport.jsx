"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  LinearProgress,
  Tooltip
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";

// Mock data for materials
const mockMaterialData = [
  {
    id: 1,
    name: "Цефтриаксон тариа",
    type: "Антибиотик",
    category: "Тариа",
    unit: "ширхэг",
    initialStock: 200,
    currentStock: 145,
    criticalLevel: 50,
    expiryDate: "2026-06-30",
    price: 5000,
    supplierName: "Монос фарм",
    location: "Эмийн сан 1",
    lastUpdated: "2025-04-14"
  },
  {
    id: 2,
    name: "Ибупрофен 400мг",
    type: "Өвдөлт намдаагч",
    category: "Шахмал",
    unit: "ширхэг",
    initialStock: 500,
    currentStock: 320,
    criticalLevel: 100,
    expiryDate: "2026-12-15",
    price: 800,
    supplierName: "Гранд фарма",
    location: "Эмийн сан 1",
    lastUpdated: "2025-04-12"
  },
  {
    id: 3,
    name: "Хөнгөлөлтийн хатуу боолт",
    type: "Боолт",
    category: "Материал",
    unit: "ороодос",
    initialStock: 150,
    currentStock: 35,
    criticalLevel: 40,
    expiryDate: "2027-01-20",
    price: 3500,
    supplierName: "Мед Супплай",
    location: "Агуулах 2",
    lastUpdated: "2025-04-10"
  },
  {
    id: 4,
    name: "Латекс бээлий",
    type: "Хамгаалах хэрэглэл",
    category: "Материал",
    unit: "хос",
    initialStock: 1000,
    currentStock: 620,
    criticalLevel: 200,
    expiryDate: "2026-10-05",
    price: 1500,
    supplierName: "Мед Импорт",
    location: "Агуулах 1",
    lastUpdated: "2025-04-05"
  },
  {
    id: 5,
    name: "Амоксициллин 500мг",
    type: "Антибиотик",
    category: "Шахмал",
    unit: "ширхэг",
    initialStock: 300,
    currentStock: 85,
    criticalLevel: 80,
    expiryDate: "2025-11-30",
    price: 900,
    supplierName: "Монос фарм",
    location: "Эмийн сан 2",
    lastUpdated: "2025-04-08"
  },
  {
    id: 6,
    name: "Тариур 10мл",
    type: "Тариур",
    category: "Материал",
    unit: "ширхэг",
    initialStock: 500,
    currentStock: 25,
    criticalLevel: 100,
    expiryDate: "2027-12-31",
    price: 600,
    supplierName: "Мед Импорт",
    location: "Агуулах 1",
    lastUpdated: "2025-04-02"
  },
  {
    id: 7,
    name: "Стерил живх",
    type: "Боолт",
    category: "Материал",
    unit: "багц",
    initialStock: 200,
    currentStock: 130,
    criticalLevel: 50,
    expiryDate: "2027-08-15",
    price: 4500,
    supplierName: "Мед Супплай",
    location: "Агуулах 2",
    lastUpdated: "2025-04-01"
  }
];

const MaterialReport = ({ filters }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [materials, setMaterials] = useState([]);
  
  // For the action menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  // Calculate statistics
  const totalMaterials = materials.length;
  const lowStockMaterials = materials.filter(item => item.currentStock <= item.criticalLevel).length;
  const totalStockValue = materials.reduce((sum, item) => sum + (item.currentStock * item.price), 0).toLocaleString('mn-MN');
  
  // Group by category
  const categoryData = materials.reduce((acc, item) => {
    const category = acc.find(c => c.name === item.category);
    if (category) {
      category.count += 1;
      category.value += (item.currentStock * item.price);
    } else {
      acc.push({ 
        name: item.category, 
        count: 1, 
        value: item.currentStock * item.price 
      });
    }
    return acc;
  }, []);

  // Handle menu open
  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentRow(null);
  };

  // View details handler
  const handleViewDetails = () => {
    console.log("View details for:", currentRow);
    handleMenuClose();
    // Navigate to details page or open a modal
  };

  // Export to PDF handler
  const handleExportPDF = () => {
    console.log("Export to PDF:", currentRow);
    handleMenuClose();
    // Logic to export to PDF
  };

  // Print handler
  const handlePrint = () => {
    console.log("Print:", currentRow);
    handleMenuClose();
    // Logic to print
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply filters when they change
  useEffect(() => {
    // In a real application, you would fetch data from an API here
    // For now, we'll just filter the mock data
    let filteredData = [];
    
    // Filter by date range (for lastUpdated)
    if (filters.dateRange[0] && filters.dateRange[1]) {
      const startDate = new Date(filters.dateRange[0]);
      const endDate = new Date(filters.dateRange[1]);
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.lastUpdated);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    setMaterials(filteredData);
  }, [filters]);

  // Get stock status
  const getStockStatus = (current, critical) => {
    if (current <= critical * 0.5) {
      return { color: "error", label: "Маш бага", icon: <WarningIcon color="error" fontSize="small" /> };
    } else if (current <= critical) {
      return { color: "warning", label: "Бага", icon: <WarningIcon color="warning" fontSize="small" /> };
    } else {
      return { color: "success", label: "Хангалттай", icon: <CheckCircleIcon color="success" fontSize="small" /> };
    }
  };

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Нийт материал
              </Typography>
              <Typography variant="h4">{totalMaterials}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Нөөц багатай
              </Typography>
              <Typography variant="h4" color={lowStockMaterials > 0 ? "error.main" : "text.primary"}>
                {lowStockMaterials}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Нийт үнийн дүн (₮)
              </Typography>
              <Typography variant="h4">{totalStockValue}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Summary */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Ангилал бүрээрх тоо хэмжээ
        </Typography>
        <Grid container spacing={2}>
          {categoryData.map((category, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="subtitle2" color="primary">
                    {category.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {category.count} төрөл
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {category.value.toLocaleString('mn-MN')}₮
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => console.log("Add new material")}
        >
          Материал нэмэх
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<FileDownloadIcon />}
          onClick={() => console.log("Export material data")}
        >
          Тайлан татах
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Нэр</TableCell>
              <TableCell>Төрөл</TableCell>
              <TableCell>Ангилал</TableCell>
              <TableCell>Нөөц</TableCell>
              <TableCell>Төлөв</TableCell>
              <TableCell>Хугацаа</TableCell>
              <TableCell>Үнэ (₮)</TableCell>
              <TableCell>Байршил</TableCell>
              <TableCell align="center">Үйлдэл</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materials
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                const stockStatus = getStockStatus(row.currentStock, row.criticalLevel);
                const stockPercentage = (row.currentStock / row.initialStock) * 100;
                
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {row.currentStock}/{row.initialStock} {row.unit}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={stockPercentage} 
                          color={stockStatus.color}
                          sx={{ height: 5, borderRadius: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={stockStatus.icon}
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>{row.expiryDate}</TableCell>
                    <TableCell>{row.price.toLocaleString('mn-MN')}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuClick(event, row)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            {materials.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    Мэдээлэл олдсонгүй
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={materials.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Хуудсанд:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Дэлгэрэнгүй" />
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="PDF татах" />
        </MenuItem>
        <MenuItem onClick={handlePrint}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Хэвлэх" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MaterialReport;