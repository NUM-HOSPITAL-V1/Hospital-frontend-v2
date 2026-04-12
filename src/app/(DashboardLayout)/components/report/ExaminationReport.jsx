"use client";
import React, { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import ArticleIcon from "@mui/icons-material/Article";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BarChartIcon from "@mui/icons-material/BarChart";
import ExaminationCharts from "./ExaminationCharts";
import examinationService from "@/app/service/examinationService";

const unwrapList = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.examinations)) return response.examinations;
  return [];
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatDoctorName = (staff) =>
  `${staff?.lastname || ""} ${staff?.firstname || ""}`.trim() || "Тодорхойгүй";

const normalizeStatus = (status) => {
  if (status === "Done") return "Дууссан";
  if (status === "Todo") return "Хүлээгдэж буй";
  return "Явагдаж буй";
};

const getStatusColor = (status) => {
  if (status === "Дууссан") return "success";
  if (status === "Хүлээгдэж буй") return "warning";
  return "info";
};

const ExaminationReport = ({ filters }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rawExaminations, setRawExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCharts, setShowCharts] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchExaminations = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await examinationService.getAllExaminations();
        if (!mounted) return;
        setRawExaminations(unwrapList(response));
      } catch (fetchError) {
        if (!mounted) return;
        setError(fetchError?.response?.data?.error || fetchError?.message || "Үзлэгийн тайлан ачаалж чадсангүй.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchExaminations();
    return () => {
      mounted = false;
    };
  }, []);

  const examinations = useMemo(() => {
    const normalized = rawExaminations.map((item) => {
      const patientName = `${item.patient?.lastname || ""} ${item.patient?.firstname || ""}`.trim() || "Тодорхойгүй";
      const doctor = formatDoctorName(item.medicalStaff);
      const department = item.medicalStaff?.specialization || "Тодорхойгүй";
      const date = item.exam_date || item.createdAt;

      return {
        id: item._id || item.id,
        patientId: item.patient?.register || item.patient?._id || "-",
        patientName,
        examinationType: item.exam_type || item.doctors_examination || "Үзлэг",
        doctor,
        department,
        date,
        dateLabel: formatDate(date),
        status: normalizeStatus(item.status),
        diagnosis: item.illness || "-",
        cost: Number(item.cost) || 0,
      };
    });

    return normalized.filter((item) => {
      const [startDate, endDate] = filters.dateRange || [];
      const itemDate = item.date ? new Date(item.date) : null;

      if (startDate && itemDate && itemDate < new Date(startDate)) return false;
      if (endDate && itemDate && itemDate > new Date(endDate)) return false;
      if (filters.department && !item.department.toLowerCase().includes(filters.department.toLowerCase())) return false;
      if (filters.doctor && !item.doctor.toLowerCase().includes(filters.doctor.toLowerCase())) return false;
      if (filters.patientName && !item.patientName.toLowerCase().includes(filters.patientName.toLowerCase())) return false;
      if (filters.patientId && !String(item.patientId).toLowerCase().includes(filters.patientId.toLowerCase())) return false;

      return true;
    });
  }, [rawExaminations, filters]);

  useEffect(() => {
    setPage(0);
  }, [filters, rowsPerPage]);

  const totalExaminations = examinations.length;
  const completedExaminations = examinations.filter((item) => item.status === "Дууссан").length;
  const pendingExaminations = examinations.filter((item) => item.status === "Хүлээгдэж буй").length;
  const totalCost = examinations.reduce((sum, item) => sum + item.cost, 0).toLocaleString("mn-MN");

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentRow(null);
  };

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Нийт үзлэг</Typography>
              <Typography variant="h4">{totalExaminations}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Дууссан үзлэг</Typography>
              <Typography variant="h4" color="success.main">{completedExaminations}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Хүлээгдэж буй үзлэг</Typography>
              <Typography variant="h4" color="warning.main">{pendingExaminations}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Нийт дүн (₮)</Typography>
              <Typography variant="h4">{totalCost}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" startIcon={showCharts ? <ArticleIcon /> : <BarChartIcon />} onClick={() => setShowCharts((prev) => !prev)}>
          {showCharts ? "Хүснэгт харах" : "График харах"}
        </Button>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => window.print()}>
          Тайлан татах
        </Button>
      </Box>

      {error ? (
        <Typography color="error.main" sx={{ mb: 2 }}>{error}</Typography>
      ) : null}

      {loading ? (
        <Typography color="textSecondary">Өгөгдөл ачаалж байна...</Typography>
      ) : showCharts ? (
        <ExaminationCharts data={examinations} />
      ) : (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
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
                {examinations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.patientId}</TableCell>
                    <TableCell>{row.patientName}</TableCell>
                    <TableCell>{row.examinationType}</TableCell>
                    <TableCell>{row.doctor}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.dateLabel}</TableCell>
                    <TableCell>
                      <Chip label={row.status} color={getStatusColor(row.status)} size="small" sx={{ fontWeight: "medium" }} />
                    </TableCell>
                    <TableCell>{row.cost.toLocaleString("mn-MN")}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(event) => handleMenuClick(event, row)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!examinations.length ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="textSecondary">Мэдээлэл олдсонгүй</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={examinations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Хуудсанд:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary={currentRow?.diagnosis || "Дэлгэрэнгүй мэдээлэлгүй"} />
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); window.print(); }}>
          <ListItemIcon><FileDownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="PDF татах" />
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); window.print(); }}>
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Хэвлэх" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExaminationReport;
