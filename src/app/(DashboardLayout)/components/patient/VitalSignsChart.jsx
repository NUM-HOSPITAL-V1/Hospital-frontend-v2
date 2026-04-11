'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { usePatientDashboard } from '@/app/(DashboardLayout)/components/patient/PatientDashboardContext';

const VitalSignsChart = () => {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const { vitals, latestVital, loading, error } = usePatientDashboard();

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const chartData = vitals.map((item) => ({
    date: item.chartDate,
    temperature: item.temperature ?? null,
    heartRate: item.right_heart_rate ?? item.left_heart_rate ?? null,
    bloodPressureSystolic: item.right_systolic ?? item.left_systolic ?? null,
    bloodPressureDiastolic: item.right_diastolic ?? item.left_diastolic ?? null,
    respiration: item.respiration_rate ?? null,
    oxygenSaturation: item.saturation ?? null,
  }));

  const metricInfo = {
    temperature: { title: 'Биеийн халуун', unit: '°C', color: '#FF6384' },
    heartRate: { title: 'Зүрхний цохилт', unit: 'bpm', color: '#FF9F40' },
    bloodPressure: { title: 'Цусны даралт', unit: 'mmHg', color: '#4BC0C0' },
    respiration: { title: 'Амьсгалын давтамж', unit: 'brpm', color: '#36A2EB' },
    oxygenSaturation: { title: 'Хүчилтөрөгчийн хангамж', unit: '%', color: '#9966FF' },
  }[selectedMetric];

  const latestValue = selectedMetric === 'bloodPressure'
    ? latestVital
      ? `${latestVital.right_systolic ?? latestVital.left_systolic ?? '-'} / ${latestVital.right_diastolic ?? latestVital.left_diastolic ?? '-'} ${metricInfo.unit}`
      : '-'
    : chartData.length
      ? `${chartData[chartData.length - 1][selectedMetric]} ${metricInfo.unit}`
      : '-';

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Амин үзүүлэлтийн шинжилгээ
          </Typography>
        </Box>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Үзүүлэлт</InputLabel>
          <Select value={selectedMetric} onChange={handleMetricChange} label="Үзүүлэлт">
            <MenuItem value="temperature">Биеийн халуун (°C)</MenuItem>
            <MenuItem value="heartRate">Зүрхний цохилт (bpm)</MenuItem>
            <MenuItem value="bloodPressure">Цусны даралт (mmHg)</MenuItem>
            <MenuItem value="respiration">Амьсгалын давтамж (brpm)</MenuItem>
            <MenuItem value="oxygenSaturation">Хүчилтөрөгчийн хангамж (%)</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {metricInfo.title} - {metricInfo.unit}
          </Typography>
        </Box>

        {error ? (
          <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}

        {loading ? (
          <Typography color="textSecondary">Өгөгдөл ачаалж байна...</Typography>
        ) : chartData.length ? (
          selectedMetric === 'bloodPressure' ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bloodPressureSystolic" stroke="#4BC0C0" name="Систолик" />
                <Line type="monotone" dataKey="bloodPressureDiastolic" stroke="#36A2EB" name="Диастолик" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={selectedMetric} stroke={metricInfo.color} name={metricInfo.title} />
              </LineChart>
            </ResponsiveContainer>
          )
        ) : (
          <Typography color="textSecondary">Амин үзүүлэлтийн бодит мэдээлэл олдсонгүй.</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Сүүлийн хэмжилт
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {latestValue}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary">
              Нийт бичлэг
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {vitals.length}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VitalSignsChart;
