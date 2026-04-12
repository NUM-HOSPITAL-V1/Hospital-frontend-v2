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
  Collapse,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import treatmentService from "@/app/service/treatmentService";

const unwrapList = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.treatments)) return response.treatments;
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

const normalizeStatus = (row) => {
  const total = Number(row.totalQuantity) || 0;
  const completed = Number(row.sessionsCompleted) || 0;
  if (total > 0 && completed >= total) return "Дууссан";
  if (completed > 0) return "Үргэлжилж буй";
  return "Хүлээгдэж буй";
};

function Row({ row }) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <TableRow hover onClick={() => setOpen(!open)} sx={{ "& > *": { borderBottom: "unset" }, cursor: "pointer" }}>
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
        <TableCell>{row.startDate}</TableCell>
        <TableCell>
          <Chip label={row.status} color={row.status === "Дууссан" ? "success" : row.status === "Үргэлжилж буй" ? "warning" : "info"} size="small" />
        </TableCell>
        <TableCell>{row.cost.toLocaleString("mn-MN")}</TableCell>
        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
          <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Дэлгэрэнгүй" />
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); window.print(); }}>
              <ListItemIcon><FileDownloadIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="PDF татах" />
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); window.print(); }}>
              <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Хэвлэх" />
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 2 }}>
              <Typography variant="h6" gutterBottom>Эмчилгээний дэлгэрэнгүй</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Төрөл:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{row.treatmentType}</Typography>
                  <Typography variant="subtitle2">Тасаг / чиглэл:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{row.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Оношийн төрөл:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{row.diagnosis}</Typography>
                  <Typography variant="subtitle2">Хийгдсэн явц:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{row.progress}</Typography>
                </Grid>
              </Grid>
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
  const [rawTreatments, setRawTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchTreatments = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await treatmentService.getAllTreatments();
        if (!mounted) return;
        setRawTreatments(unwrapList(response));
      } catch (fetchError) {
        if (!mounted) return;
        setError(fetchError?.response?.data?.error || fetchError?.message || "Эмчилгээний тайлан ачаалж чадсангүй.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTreatments();
    return () => {
      mounted = false;
    };
  }, []);

  const treatments = useMemo(() => {
    const normalized = rawTreatments.map((item) => {
      const patientName = `${item.patient?.lastname || ""} ${item.patient?.firstname || ""}`.trim() || "Тодорхойгүй";
      const doctor = formatDoctorName(item.medicalStaff);
      const department = item.medicalStaff?.specialization || "Тодорхойгүй";
      const date = item.date || item.createdAt;
      const status = normalizeStatus(item);

      return {
        id: item._id || item.id,
        patientId: item.patient?.register || item.patient?._id || "-",
        patientName,
        treatmentType: item.treatmentType || "Эмчилгээ",
        doctor,
        department,
        rawDate: date,
        startDate: formatDate(date),
        status,
        diagnosis: item.diagnosisType === "in" ? "Хэвтэн" : item.diagnosisType === "out" ? "Амбулатори" : "-",
        progress: `${item.sessionsCompleted || 0}/${item.totalQuantity || 0}`,
        cost: Number(item.cost) || 0,
      };
    });

    return normalized.filter((item) => {
      const [startDate, endDate] = filters.dateRange || [];
      const itemDate = item.rawDate ? new Date(item.rawDate) : null;

      if (startDate && itemDate && itemDate < new Date(startDate)) return false;
      if (endDate && itemDate && itemDate > new Date(endDate)) return false;
      if (filters.department && !item.department.toLowerCase().includes(filters.department.toLowerCase())) return false;
      if (filters.doctor && !item.doctor.toLowerCase().includes(filters.doctor.toLowerCase())) return false;
      if (filters.patientName && !item.patientName.toLowerCase().includes(filters.patientName.toLowerCase())) return false;
      if (filters.patientId && !String(item.patientId).toLowerCase().includes(filters.patientId.toLowerCase())) return false;
      return true;
    });
  }, [rawTreatments, filters]);

  const totalTreatments = treatments.length;
  const completedTreatments = treatments.filter((item) => item.status === "Дууссан").length;
  const ongoingTreatments = treatments.filter((item) => item.status === "Үргэлжилж буй").length;
  const totalCost = treatments.reduce((sum, item) => sum + item.cost, 0).toLocaleString("mn-MN");

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Нийт эмчилгээ</Typography><Typography variant="h4">{totalTreatments}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Дууссан эмчилгээ</Typography><Typography variant="h4" color="success.main">{completedTreatments}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Үргэлжилж буй</Typography><Typography variant="h4" color="warning.main">{ongoingTreatments}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Нийт дүн (₮)</Typography><Typography variant="h4">{totalCost}</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => window.print()}>
          Тайлан татах
        </Button>
      </Box>

      {error ? <Typography color="error.main" sx={{ mb: 2 }}>{error}</Typography> : null}
      {loading ? (
        <Typography color="textSecondary">Өгөгдөл ачаалж байна...</Typography>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell width={50} />
                  <TableCell>ID</TableCell>
                  <TableCell>Өвчтөн</TableCell>
                  <TableCell>Эмчилгээний төрөл</TableCell>
                  <TableCell>Эмч</TableCell>
                  <TableCell>Огноо</TableCell>
                  <TableCell>Төлөв</TableCell>
                  <TableCell>Дүн (₮)</TableCell>
                  <TableCell align="center">Үйлдэл</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {treatments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <Row key={row.id} row={row} />
                ))}
                {!treatments.length ? (
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
            count={treatments.length}
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
    </Box>
  );
};

export default TreatmentReport;
