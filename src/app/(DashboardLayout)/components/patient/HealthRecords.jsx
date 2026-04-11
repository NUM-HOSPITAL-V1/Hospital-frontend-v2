'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { usePatientDashboard } from '@/app/(DashboardLayout)/components/patient/PatientDashboardContext';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const HealthRecords = () => {
  const [tabValue, setTabValue] = useState(0);
  const { examinations, prescriptions, treatments, vitals, loading, error } = usePatientDashboard();

  const tabs = [
    { label: 'Үзлэг', rows: examinations },
    { label: 'Жор', rows: prescriptions },
    { label: 'Эмчилгээ', rows: treatments },
    { label: 'Амин үзүүлэлт', rows: vitals },
  ];

  const currentRows = tabs[tabValue].rows;

  return (
    <DashboardCard title="Эрүүл мэндийн бүртгэл">
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} variant="scrollable" scrollButtons="auto">
          {tabs.map((tab) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {error ? (
        <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}

      {loading ? (
        <Typography color="textSecondary">Өгөгдөл ачаалж байна...</Typography>
      ) : (
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Огноо</TableCell>
                    <TableCell>Тайлбар</TableCell>
                    <TableCell>Хариуцсан эмч</TableCell>
                    <TableCell>Төлөв</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tabValue === 0 && currentRows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>{formatDate(row.exam_date || row.createdAt)}</TableCell>
                      <TableCell>{row.reason || row.exam_type || 'Үзлэг'}</TableCell>
                      <TableCell>{row.doctorName}</TableCell>
                      <TableCell>
                        <Chip size="small" label={row.status || 'Бүртгэгдсэн'} color="primary" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}

                  {tabValue === 1 && currentRows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>{formatDate(row.date || row.createdAt)}</TableCell>
                      <TableCell>{row.diagnosis || 'Жор'}</TableCell>
                      <TableCell>{row.doctorName}</TableCell>
                      <TableCell>
                        <Chip size="small" label="Идэвхтэй" color="secondary" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}

                  {tabValue === 2 && currentRows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>{formatDate(row.date || row.createdAt)}</TableCell>
                      <TableCell>{row.treatmentType || 'Эмчилгээ'}</TableCell>
                      <TableCell>{row.doctorName}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={(row.sessionsCompleted || 0) >= (row.totalQuantity || 0) && (row.totalQuantity || 0) > 0 ? 'Дууссан' : 'Явцтай'}
                          color={(row.sessionsCompleted || 0) >= (row.totalQuantity || 0) && (row.totalQuantity || 0) > 0 ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {tabValue === 3 && currentRows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>{formatDate(row.date || row.createdAt)}</TableCell>
                      <TableCell>
                        Даралт {row.right_systolic ?? row.left_systolic ?? '-'} / {row.right_diastolic ?? row.left_diastolic ?? '-'}, халуун {row.temperature ?? '-'}
                      </TableCell>
                      <TableCell>{row.medicalStaff ? `${row.medicalStaff.lastname || ''} ${row.medicalStaff.firstname || ''}`.trim() : 'Тодорхойгүй'}</TableCell>
                      <TableCell>
                        <Chip size="small" label="Бүртгэгдсэн" color="info" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}

                  {!currentRows.length ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography color="textSecondary">
                          Энэ хэсэгт бодит мэдээлэл олдсонгүй.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </DashboardCard>
  );
};

export default HealthRecords;
