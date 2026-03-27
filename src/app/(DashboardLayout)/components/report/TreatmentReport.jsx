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
  Button,
  Collapse
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import ArticleIcon from "@mui/icons-material/Article";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BarChartIcon from "@mui/icons-material/BarChart";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Mock data for treatment reports
const mockTreatmentData = [
  {
    id: 1,
    patientId: "P001",
    patientName: "Д. Баатар",
    treatmentType: "Гэдэсний эмчилгээ",
    doctor: "Б. Батболд",
    department: "Дотрын тасаг",
    startDate: "2025-04-10",
    endDate: "2025-04-15",
    status: "Дууссан",
    diagnosis: "Гэдэсний үрэвсэл",
    cost: 125000,
    medications: [
      { name: "Энтерофурил", dosage: "2 капсул х 3 удаа", days: 5 },
      { name: "Смекта", dosage: "1 уут х 2 удаа", days: 5 }
    ]
  },
  {
    id: 2,
    patientId: "P002",
    patientName: "С. Сүрэн",
    treatmentType: "Нүдний даралт бууруулах",
    doctor: "Н. Нарангэрэл",
    department: "Нүдний тасаг",
    startDate: "2025-04-11",
    endDate: "2025-04-20",
    status: "Үргэлжилж буй",
    diagnosis: "Нүдний даралт ихсэлт",
    cost: 180000,
    medications: [
      { name: "Тимолол", dosage: "1 дуслаар х 2 удаа", days: 10 },
    ]
  },
  {
    id: 3,
    patientId: "P003",
    patientName: "Б. Болд",
    treatmentType: "Шүдний эмчилгээ",
    doctor: "С. Сүхбаатар",
    department: "Шүдний тасаг",
    startDate: "2025-04-12",
    endDate: "2025-04-14",
    status: "Дууссан",
    diagnosis: "Шүдний чулуу",
    cost: 85000,
    medications: [
      { name: "Хлоргексидин", dosage: "Зайлах х 2 удаа", days: 3 },
      { name: "Ибупрофен", dosage: "1 шахмал х 3 удаа", days: 3 }
    ]
  },
  {
    id: 4,
    patientId: "P004",
    patientName: "О. Отгон",
    treatmentType: "Арьсны эмчилгээ",
    doctor: "Т. Төмөрбаатар",
    department: "Арьс өвчний тасаг",
    startDate: "2025-04-13",
    endDate: "2025-04-28",
    status: "Үргэлжилж буй",
    diagnosis: "Харшлын тууралт",
    cost: 95000,
    medications: [
      { name: "Тавегил", dosage: "1 шахмал х 1 удаа", days: 14 },
      { name: "Гидрокортизон тос", dosage: "Түрхэх х 2 удаа", days: 14 }
    ]
  },
  {
    id: 5,
    patientId: "P005",
    patientName: "Г. Ганбат",
    treatmentType: "Мэс засал",
    doctor: "О. Отгонбаяр",
    department: "Мэс заслын тасаг",
    startDate: "2025-04-14",
    endDate: "2025-04-21",
    status: "Үргэлжилж буй",
    diagnosis: "Умайн хавдар",
    cost: 450000,
    medications: [
      { name: "Трамадол", dosage: "1 шахмал х 2 удаа", days: 7 },
      { name: "Цефтриаксон", dosage: "1 тариа х 2 удаа", days: 7 },
      { name: "Метронидазол", dosage: "1 тариа х 3 удаа", days: 5 }
    ]
  },
];

// Row component with collapsible details
function Row(props) {
  const { row } = props;
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle menu open
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <TableRow 
        hover 
        onClick={() => setOpen(!open)}
        sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }}
      >
        <TableCell>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.patientId}</TableCell>
        <TableCell>{row.patientName}</TableCell>
        <TableCell>{row.treatmentType}</TableCell>
        <TableCell>{row.doctor}</TableCell>
        <TableCell>{row.startDate} - {row.endDate}</TableCell>
        <TableCell>
          <Chip
            label={row.status}
            color={row.status === "Дууссан" ? "success" : "warning"}
            size="small"
            sx={{ fontWeight: 'medium' }}
          />
        </TableCell>
        <TableCell>{row.cost.toLocaleString('mn-MN')}</TableCell>
        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
          <IconButton
            size="small"
            onClick={handleMenuClick}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Дэлгэрэнгүй" />
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <FileDownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="PDF татах" />
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PrintIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Хэвлэх" />
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Эмчилгээний дэлгэрэнгүй
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Онош:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{row.diagnosis}</Typography>
                  
                  <Typography variant="subtitle2">Тасаг:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{row.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Эхэлсэн огноо:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{row.startDate}</Typography>
                  
                  <Typography variant="subtitle2">Дууссан/Дуусах огноо:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{row.endDate}</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Эм, тариа, эмчилгээ
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Нэр</TableCell>
                    <TableCell>Тун хэмжээ</TableCell>
                    <TableCell>Өдөр</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.medications.map((medication, index) => (
                    <TableRow key={index}>
                      <TableCell>{medication.name}</TableCell>
                      <TableCell>{medication.dosage}</TableCell>
                      <TableCell>{medication.days}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const TreatmentReport = ({ filters }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [treatments, setTreatments] = useState([]);

  // Calculate statistics
  const totalTreatments = treatments.length;
  const completedTreatments = treatments.filter(item => item.status === "Дууссан").length;
  const ongoingTreatments = treatments.filter(item => item.status === "Үргэлжилж буй").length;
  const totalCost = treatments.reduce((sum, item) => sum + item.cost, 0).toLocaleString('mn-MN');

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
        const itemStartDate = new Date(item.startDate);
        return itemStartDate >= startDate && itemStartDate <= endDate;
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
    
    setTreatments(filteredData);
  }, [filters]);

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Нийт эмчилгээ
              </Typography>
              <Typography variant="h4">{totalTreatments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Дууссан эмчилгээ
              </Typography>
              <Typography variant="h4" color="success.main">
                {completedTreatments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Үргэлжилж буй
              </Typography>
              <Typography variant="h4" color="warning.main">
                {ongoingTreatments}
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
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          startIcon={<FileDownloadIcon />}
          onClick={() => console.log("Export treatment data")}
        >
          Тайлан татах
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell width={50} />
              <TableCell>ID</TableCell>
              <TableCell>Өвчтөн</TableCell>
              <TableCell>Эмчилгээний төрөл</TableCell>
              <TableCell>Эмч</TableCell>
              <TableCell>Хугацаа</TableCell>
              <TableCell>Төлөв</TableCell>
              <TableCell>Дүн (₮)</TableCell>
              <TableCell align="center">Үйлдэл</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {treatments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <Row key={row.id} row={row} />
              ))}
            {treatments.length === 0 && (
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
        count={treatments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Хуудсанд:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
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
  { id: 1, name: "Б. Батболд" },
  { id: 2, name: "Н. Нарангэрэл" },
  { id: 3, name: "О. Отгонбаяр" },
  { id: 4, name: "С. Сүхбаатар" },
  { id: 5, name: "Т. Төмөрбаатар" },
];

export default TreatmentReport;