import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip
} from '@mui/material';

// Төлөвийн өнгө
const getStatusColor = (status) => {
  switch (status) {
    case 'Хүлээгдэж буй':
      return 'warning';
    case 'Хийгдэж буй':
      return 'info';
    case 'Дууссан':
      return 'success';
    default:
      return 'default';
  }
};

const TreatmentsTab = ({ treatments, onAdministerTreatment }) => {
  const handleAdminister = (treatment) => {
    if (onAdministerTreatment) {
      onAdministerTreatment(treatment.id);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
        Эмчилгээ
      </Typography>
      {treatments && treatments.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                <TableCell sx={{ fontWeight: 600 }}>Эмчилгээний нэр</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Дэлгэрэнгүй</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Хугацаа</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Давтамж</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Өдөр</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Төлөв</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {treatments.map((treatment) => {
                const id = treatment.id;
                const done = treatment.currentSessions || 0;
                const total = treatment.totalSessions || parseInt(treatment.days.replace(/\D/g, ''), 10) || 0;

                const isCompleted = done >= total;
                const currentStatus = isCompleted ? 'Дууссан' : done > 0 ? 'Хийгдэж буй' : treatment.status;

                return (
                  <TableRow key={id}>
                    <TableCell>{treatment.name}</TableCell>
                    <TableCell>{treatment.details}</TableCell>
                    <TableCell>{treatment.duration}</TableCell>
                    <TableCell>{treatment.frequency}</TableCell>
                    <TableCell>{treatment.days}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${currentStatus} (${done}/${total})`}
                        size="small"
                        color={getStatusColor(currentStatus)}
                        sx={{ borderRadius: '4px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => handleAdminister(treatment)}
                        disabled={isCompleted}
                        sx={{ borderRadius: '8px', textTransform: 'none', minWidth: 100 }}
                      >
                        {isCompleted ? 'Дууссан' : 'Өгөх'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Эмчилгээний жагсаалт хоосон байна</Typography>
        </Box>
      )}
    </Box>
  );
};

export default TreatmentsTab;
