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
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import ArticleIcon from "@mui/icons-material/Article";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";

// Import Chart Component
import ExaminationCharts from "./ExaminationCharts";

// Mock data for examination reports
const mockExaminationData = [
  {
    id: 1,
    patientId: "P001",
    patientName: "Б.Номин",
    examinationType: "Ерөнхий үзлэг",
    doctor: "Jean Doe",
    department: "Дотрын тасаг",
    date: "2025-04-10",
    status: "Дууссан",
    diagnosis: "Хэвийн",
    cost: 25000,
  },
  {
    id: 2,
    patientId: "P002",
    patientName: "Б.Баяр",
    examinationType: "Нүдний үзлэг",
    doctor: "Jean Doe",
    department: "Нүдний тасаг",
    date: "2025-04-11",
    status: "Дууссан",
    diagnosis: "Нүдний даралт ихсэлт",
    cost: 35000,
  },
  {
    id: 3,
    patientId: "P001",
    patientName: "Б.Номин",
    examinationType: "Шүдний үзлэг",
    doctor: "Jean Doe",
    department: "Шүдний тасаг",
    date: "2025-04-12",
    status: "Дууссан",
    diagnosis: "Шүдний өвчлөл",
    cost: 30000,
  },
  {
    id: 4,
    patientId: "P002",
    patientName: "Б.Баяр",
    examinationType: "Арьсны үзлэг",
    doctor: "Jean Doe",
    department: "Арьс өвчний тасаг",
    date: "2025-04-13",
    status: "Хүлээгдэж буй",
    diagnosis: "Тодорхойгүй",
    cost: 28000,
  },
  {
    id: 5,
    patientId: "P002",
    patientName: "Б.Баяр",
    examinationType: "Мэс заслын үзлэг",
    doctor: "Jean Doe",
    department: "Мэс заслын тасаг",
    date: "2025-04-14",
    status: "Дууссан",
    diagnosis: "Умайн хавдар",
    cost: 45000,
  },
  {
    id: 6,
    patientId: "P002",
    patientName: "Б.Баяр",
    examinationType: "Ерөнхий үзлэг",
    doctor: "Jean Doe",
    department: "Дотрын тасаг",
    date: "2025-04-15",
    status: "Дууссан",
    diagnosis: "Цусны даралт ихсэлт",
    cost: 25000,
  },
  {
    id: 7,
    patientId: "P002",
    patientName: "Б.Баяр",
    examinationType: "Нүдний үзлэг",
    doctor: "Jean Doe",
    department: "Нүдний тасаг",
    date: "2025-04-16",
    status: "Дууссан",
    diagnosis: "Хэвийн",
    cost: 35000,
  },
];

const ExaminationReport = ({ filters }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [examinations, setExaminations] = useState([]);
  const [showCharts, setShowCharts] = useState(false);
  
  // For the action menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  // Calculate statistics
  const totalExaminations = examinations.length;
  const completedExaminations = examinations.filter(item => item.status === "Дууссан").length;
  const pendingExaminations = examinations.filter(item => item.status === "Хүлээгдэж буй").length;
  const totalCost = examinations.reduce((sum, item) => sum + item.cost, 0).toLocaleString('mn-MN');

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

  // Toggle charts visibility
  const toggleCharts = () => {
    setShowCharts(!showCharts);
  };

  // Apply filters when they change
  useEffect(() => {
    // In a real application, you would fetch data from an API here
    // For now, we'll just filter the mock data
    let filteredData = [];
    
    // Filter by department
    if (filters.department) {
      filteredData = filteredData.filter(item => 
        item.department === departments.find(d => d.id === filters.department)?.name
      );
    }
    
    // Filter by doctor
    if (filters.doctor) {
      filteredData = filteredData.filter(item => 
        item.doctor === doctors.find(d => d.id === filters.doctor)?.name
      );
    }
    
    // Filter by date range
    if (filters.dateRange[0] && filters.dateRange[1]) {
      const startDate = new Date(filters.dateRange[0]);
      const endDate = new Date(filters.dateRange[1]);
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    // Filter by patient name
    if (filters.patientName) {
      filteredData = filteredData.filter(item =>
        item.patientName.toLowerCase().includes(filters.patientName.toLowerCase())
      );
    }
    
    // Filter by patient ID
    if (filters.patientId) {
      filteredData = filteredData.filter(item =>
        item.patientId.toLowerCase().includes(filters.patientId.toLowerCase())
      );
    }
    
    setExaminations(filteredData);
  }, [filters]);

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Нийт үзлэг
              </Typography>
              <Typography variant="h4">{totalExaminations}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Дууссан үзлэг
              </Typography>
              <Typography variant="h4" color="success.main">
                {completedExaminations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Хүлээгдэж буй үзлэг
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingExaminations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Нийт дүн (₮)
              </Typography>
              <Typography variant="h4">{totalCost}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          startIcon={showCharts ? <ArticleIcon /> : <BarChartIcon />}
          onClick={toggleCharts}
        >
          {showCharts ? "Хүснэгт харах" : "График харах"}
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<FileDownloadIcon />}
          onClick={() => console.log("Export all data")}
        >
          Тайлан татах
        </Button>
      </Box>

      {/* Charts Section */}
      {showCharts && (
        <Box sx={{ mb: 3 }}>
          <ExaminationCharts data={examinations} />
        </Box>
      )}

      {/* Table */}
      {!showCharts && (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Өвчтөн</TableCell>
                  <TableCell>Үзлэгийн төрөл</TableCell>
                  <TableCell>Эмч</TableCell>
                  <TableCell>Тасаг</TableCell>
                  <TableCell>Огноо</TableCell>
                  <TableCell>Төлөв</TableCell>
                  <TableCell>Дүн (₮)</TableCell>
                  <TableCell align="center">Үйлдэл</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {examinations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.patientId}</TableCell>
                      <TableCell>{row.patientName}</TableCell>
                      <TableCell>{row.examinationType}</TableCell>
                      <TableCell>{row.doctor}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={row.status === "Дууссан" ? "success" : "warning"}
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell>{row.cost.toLocaleString('mn-MN')}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuClick(event, row)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {examinations.length === 0 && (
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
            count={examinations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Хуудсанд:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </>
      )}

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

// Mock data for departments and doctors to use in filtering
const departments = [
  { id: 1, name: "Нүдний тасаг" },
  { id: 2, name: "Дотрын тасаг" },
  { id: 3, name: "Мэс заслын тасаг" },
  { id: 4, name: "Шүдний тасаг" },
  { id: 5, name: "Арьс өвчний тасаг" },
];

const doctors = [
  { id: 1, name: "Jean Doe" },

];

export default ExaminationReport;