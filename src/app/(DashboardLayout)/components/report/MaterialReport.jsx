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
  LinearProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import medicineService from "@/app/service/medicineService";

const unwrapList = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.medicines)) return response.medicines;
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

const getStockStatus = (current, critical) => {
  if (current <= critical * 0.5) {
    return { color: "error", label: "Маш бага", icon: <WarningIcon color="error" fontSize="small" /> };
  }
  if (current <= critical) {
    return { color: "warning", label: "Бага", icon: <WarningIcon color="warning" fontSize="small" /> };
  }
  return { color: "success", label: "Хангалттай", icon: <CheckCircleIcon color="success" fontSize="small" /> };
};

const MaterialReport = ({ filters }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await medicineService.getAllMedicines();
        if (!mounted) return;
        setRawMaterials(unwrapList(response));
      } catch (fetchError) {
        if (!mounted) return;
        setError(fetchError?.response?.data?.error || fetchError?.message || "Материалын тайлан ачаалж чадсангүй.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMaterials();
    return () => {
      mounted = false;
    };
  }, []);

  const materials = useMemo(() => {
    const normalized = rawMaterials.map((item) => ({
      id: item._id || item.id,
      name: item.name || "Нэргүй",
      type: item.type || "-",
      category: item.category || item.subCategory || "-",
      unit: item.unit || "ширхэг",
      initialStock: Number(item.initialStock) || Number(item.quantity) || 0,
      currentStock: Number(item.quantity) || 0,
      criticalLevel: Number(item.reorderLevel) || 0,
      expiryDate: item.expiryDate,
      price: Number(item.price) || 0,
      location: item.location || "-",
      lastUpdated: item.updatedAt || item.createdAt,
    }));

    return normalized.filter((item) => {
      const [startDate, endDate] = filters.dateRange || [];
      const itemDate = item.lastUpdated ? new Date(item.lastUpdated) : null;

      if (startDate && itemDate && itemDate < new Date(startDate)) return false;
      if (endDate && itemDate && itemDate > new Date(endDate)) return false;
      return true;
    });
  }, [rawMaterials, filters]);

  const totalMaterials = materials.length;
  const lowStockMaterials = materials.filter((item) => item.currentStock <= item.criticalLevel).length;
  const totalStockValue = materials.reduce((sum, item) => sum + item.currentStock * item.price, 0).toLocaleString("mn-MN");
  const categoryData = materials.reduce((acc, item) => {
    const existing = acc.find((entry) => entry.name === item.category);
    if (existing) {
      existing.count += 1;
      existing.value += item.currentStock * item.price;
    } else {
      acc.push({ name: item.category, count: 1, value: item.currentStock * item.price });
    }
    return acc;
  }, []);

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Нийт материал</Typography><Typography variant="h4">{totalMaterials}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Нөөц багатай</Typography><Typography variant="h4" color={lowStockMaterials > 0 ? "error.main" : "text.primary"}>{lowStockMaterials}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Нийт үнийн дүн (₮)</Typography><Typography variant="h4">{totalStockValue}</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>Ангилал бүрээрх тоо хэмжээ</Typography>
        <Grid container spacing={2}>
          {categoryData.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.name}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="subtitle2" color="primary">{category.name}</Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2">{category.count} төрөл</Typography>
                    <Typography variant="body2" fontWeight="medium">{category.value.toLocaleString("mn-MN")}₮</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!categoryData.length ? (
            <Grid item xs={12}>
              <Typography color="textSecondary">Ангиллын мэдээлэл олдсонгүй.</Typography>
            </Grid>
          ) : null}
        </Grid>
      </Paper>

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
                {materials.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const stockStatus = getStockStatus(row.currentStock, row.criticalLevel);
                  const denominator = row.initialStock > 0 ? row.initialStock : Math.max(row.currentStock, 1);
                  const stockPercentage = Math.min((row.currentStock / denominator) * 100, 100);

                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>
                        <Box sx={{ width: "100%", mr: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {row.currentStock}/{row.initialStock} {row.unit}
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={stockPercentage} color={stockStatus.color} sx={{ height: 5, borderRadius: 1 }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip icon={stockStatus.icon} label={stockStatus.label} color={stockStatus.color} size="small" sx={{ fontWeight: "medium" }} />
                      </TableCell>
                      <TableCell>{formatDate(row.expiryDate)}</TableCell>
                      <TableCell>{row.price.toLocaleString("mn-MN")}</TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!materials.length ? (
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
            count={materials.length}
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
    </Box>
  );
};

export default MaterialReport;
