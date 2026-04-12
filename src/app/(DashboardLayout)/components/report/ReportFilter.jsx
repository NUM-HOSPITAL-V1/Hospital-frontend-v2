"use client";
import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  InputAdornment,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BusinessIcon from "@mui/icons-material/Business";

const emptyFilters = {
  dateRange: [null, null],
  department: "",
  doctor: "",
  patientName: "",
  patientId: "",
};

const ReportFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");

  const handleApplyFilter = () => {
    onFilterChange({
      dateRange: [startDate, endDate],
      department,
      doctor,
      patientName,
      patientId,
    });
  };

  const handleResetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setDepartment("");
    setDoctor("");
    setPatientName("");
    setPatientId("");
    onFilterChange(emptyFilters);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: "100%" }}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
          <FilterAltIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
          Шүүлтүүр
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Эхлэх огноо"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Дуусах огноо"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Тасаг / чиглэл"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Эмч"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalHospitalIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Өвчтөний нэр"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Өвчтөний регистр / ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={4}
            sx={{ display: "flex", gap: 1, justifyContent: { xs: "flex-start", md: "flex-end" } }}
          >
            <Button variant="outlined" color="primary" startIcon={<FilterAltIcon />} onClick={handleApplyFilter}>
              Шүүх
            </Button>
            <Button variant="outlined" color="secondary" startIcon={<RestartAltIcon />} onClick={handleResetFilter}>
              Цэвэрлэх
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default ReportFilter;
